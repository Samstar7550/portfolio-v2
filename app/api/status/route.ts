import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { CONTENT_KEYS, Project } from "@/lib/content";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

type StatusResult = { ok: boolean; status: number; ms: number };

// Only ping URLs that actually appear as a project link — prevents the
// endpoint being abused to probe arbitrary/internal hosts (SSRF).
async function isAllowed(url: string): Promise<boolean> {
  const raw = await redis.get(CONTENT_KEYS.projects);
  const projects = (typeof raw === "string"
    ? (() => { try { return JSON.parse(raw); } catch { return []; } })()
    : raw) as Project[] | null;
  if (!Array.isArray(projects)) return false;
  return projects.some((p) => p.link === url);
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !/^https:\/\//.test(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  if (!(await isAllowed(url))) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
  }

  const cacheKey = `portfolio:status:${url}`;
  const cached = (await redis.get(cacheKey)) as StatusResult | null;
  if (cached) return NextResponse.json(cached);

  const start = Date.now();
  let result: StatusResult;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, { method: "GET", redirect: "follow", signal: ctrl.signal });
    clearTimeout(timer);
    result = { ok: res.ok, status: res.status, ms: Date.now() - start };
  } catch {
    result = { ok: false, status: 0, ms: Date.now() - start };
  }

  // Cache 5 min so we don't hammer the target on every page view
  await redis.set(cacheKey, JSON.stringify(result), { ex: 300 });
  return NextResponse.json(result);
}
