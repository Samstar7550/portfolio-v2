import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { list, del } from "@vercel/blob";
import { CONTENT_KEYS } from "@/lib/content";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function verifySession(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return false;
  return (await redis.exists(`portfolio:admin:session:${token}`)) === 1;
}

function isVercelBlob(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/** Recursively drops any object key whose string value matches one of `targets`. */
/* eslint-disable @typescript-eslint/no-explicit-any */
function stripRefs(value: any, targets: string[]): { value: any; changed: boolean } {
  if (Array.isArray(value)) {
    let changed = false;
    const arr = value.map((v) => {
      const r = stripRefs(v, targets);
      changed = changed || r.changed;
      return r.value;
    });
    return { value: arr, changed };
  }
  if (value && typeof value === "object") {
    let changed = false;
    const obj: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === "string" && targets.includes(v)) {
        changed = true; // drop this key entirely
        continue;
      }
      const r = stripRefs(v, targets);
      changed = changed || r.changed;
      obj[k] = r.value;
    }
    return { value: obj, changed };
  }
  return { value, changed: false };
}

// ─── GET: list all uploaded blobs ──────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { blobs } = await list({ prefix: "portfolio-icons/" });
    const files = blobs
      .map((b) => ({
        url: b.url,
        pathname: b.pathname,
        size: b.size,
        uploadedAt: b.uploadedAt,
        // Preview through our proxy since blobs are private
        proxyUrl: `/api/blob?src=${encodeURIComponent(b.url)}`,
      }))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}

// ─── DELETE: remove a blob + clear any Redis references to it ────────────────────
export async function DELETE(req: NextRequest) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { url } = await req.json().catch(() => ({ url: null }));
  if (!url || !isVercelBlob(url)) {
    return NextResponse.json({ error: "Invalid blob URL" }, { status: 400 });
  }

  // Delete the actual file from Vercel Blob
  await del(url);

  // References in Redis are stored as the proxy URL; also match the raw URL just in case
  const proxyUrl = `/api/blob?src=${encodeURIComponent(url)}`;
  const targets = [proxyUrl, url];

  const clearedFrom: string[] = [];
  for (const [type, key] of Object.entries(CONTENT_KEYS)) {
    const raw = await redis.get(key);
    if (raw == null) continue;
    const parsed =
      typeof raw === "string"
        ? (() => { try { return JSON.parse(raw); } catch { return raw; } })()
        : raw;
    const { value, changed } = stripRefs(parsed, targets);
    if (changed) {
      await redis.set(key, JSON.stringify(value));
      clearedFrom.push(type);
    }
  }

  return NextResponse.json({ ok: true, clearedFrom });
}
