import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { CONTENT_KEYS, DEFAULTS, ContentType } from "@/lib/content";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const SECTION_LABELS: Record<ContentType, string> = {
  settings:       "Settings (availability / profile photo / resume)",
  profile:        "Profile (name, bio, stats, contact)",
  skills:         "Skills",
  experience:     "Experience",
  projects:       "Projects",
  certifications: "Certifications",
  awards:         "Awards",
  testimonials:   "Testimonials",
};

async function verifySession(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return false;
  const exists = await redis.exists(`portfolio:admin:session:${token}`);
  return exists === 1;
}

// ─── Change diffing ──────────────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */

function fmt(v: unknown): string {
  if (v === undefined || v === null || v === "") return "(empty)";
  if (typeof v === "boolean") return v ? "on" : "off";
  const s = String(v);
  return s.length > 70 ? s.slice(0, 70) + "…" : s;
}

function itemName(it: any): string {
  return it?.title ?? it?.role ?? it?.name ?? it?.category ?? it?.degree ?? "item";
}

function diffArray(oldArr: any[], newArr: any[]): string[] {
  const lines: string[] = [];
  const oldNames = oldArr.map(itemName);
  const newNames = newArr.map(itemName);
  const added = newNames.filter((n) => !oldNames.includes(n));
  const removed = oldNames.filter((n) => !newNames.includes(n));

  added.forEach((n) => lines.push(`+ added "${n}"`));
  removed.forEach((n) => lines.push(`− removed "${n}"`));
  newArr.forEach((it) => {
    const nm = itemName(it);
    if (added.includes(nm)) return;
    const prev = oldArr.find((o) => itemName(o) === nm);
    if (prev && JSON.stringify(prev) !== JSON.stringify(it)) lines.push(`~ edited "${nm}"`);
  });

  if (lines.length === 0 && oldArr.length !== newArr.length) {
    lines.push(`${oldArr.length} → ${newArr.length} entries`);
  }
  if (lines.length === 0) lines.push("reordered or minor edit");
  return lines;
}

function diffObject(oldObj: any, newObj: any): string[] {
  const lines: string[] = [];
  const keys = Array.from(new Set([...Object.keys(oldObj ?? {}), ...Object.keys(newObj ?? {})]));
  for (const k of keys) {
    const o = oldObj?.[k];
    const n = newObj?.[k];
    if (JSON.stringify(o) === JSON.stringify(n)) continue;
    if (Array.isArray(o) || Array.isArray(n)) {
      const oc = Array.isArray(o) ? o.length : 0;
      const nc = Array.isArray(n) ? n.length : 0;
      lines.push(oc !== nc ? `${k}: ${oc} → ${nc} items` : `${k}: updated`);
    } else if ((o && typeof o === "object") || (n && typeof n === "object")) {
      lines.push(`${k}: updated`);
    } else {
      lines.push(`${k}: ${fmt(o)} → ${fmt(n)}`);
    }
  }
  return lines;
}

function describeChanges(oldVal: unknown, newVal: unknown): string[] {
  if (oldVal == null) return ["Initial content set."];
  const lines = Array.isArray(newVal) && Array.isArray(oldVal)
    ? diffArray(oldVal, newVal)
    : diffObject(oldVal, newVal);
  if (lines.length === 0) return ["No detectable changes."];
  return lines.slice(0, 15).concat(lines.length > 15 ? [`…and ${lines.length - 15} more`] : []);
}

async function sendChangeNotification(type: ContentType, oldVal: unknown, newVal: unknown) {
  const changes = describeChanges(oldVal, newVal);
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.FROM_EMAIL ?? "Portfolio <noreply@samuvel.in>",
    to:   process.env.ADMIN_EMAIL ?? "admin@samuvel.in",
    subject: `Portfolio updated — ${SECTION_LABELS[type]}`,
    text:
      `Your portfolio content was updated.\n\n` +
      `Section : ${SECTION_LABELS[type]}\n` +
      `Time    : ${new Date().toUTCString()}\n\n` +
      `What changed:\n` +
      changes.map((c) => `  • ${c}`).join("\n") + `\n\n` +
      `If this wasn't you, sign in to your admin console immediately.`,
  }).catch(console.error); // fire-and-forget — never block the save
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") as ContentType | null;
  if (!type || !(type in CONTENT_KEYS)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  let data = await redis.get(CONTENT_KEYS[type]);
  if (!data) {
    data = DEFAULTS[type];
    await redis.set(CONTENT_KEYS[type], JSON.stringify(data));
  }
  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") as ContentType | null;
  if (!type || !(type in CONTENT_KEYS)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!(await verifySession(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();

  // Read the previous value to diff against (Upstash auto-deserializes JSON)
  const prevRaw = await redis.get(CONTENT_KEYS[type]);
  const prev = typeof prevRaw === "string"
    ? (() => { try { return JSON.parse(prevRaw); } catch { return prevRaw; } })()
    : prevRaw;

  await redis.set(CONTENT_KEYS[type], JSON.stringify(body));
  sendChangeNotification(type, prev, body); // async, non-blocking
  return NextResponse.json({ ok: true });
}

// Reset a content section back to its built-in defaults
export async function DELETE(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") as ContentType | null;
  if (!type || !(type in CONTENT_KEYS)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!(await verifySession(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prevRaw = await redis.get(CONTENT_KEYS[type]);
  const prev = typeof prevRaw === "string"
    ? (() => { try { return JSON.parse(prevRaw); } catch { return prevRaw; } })()
    : prevRaw;

  const defaults = DEFAULTS[type];
  await redis.set(CONTENT_KEYS[type], JSON.stringify(defaults));
  sendChangeNotification(type, prev, defaults); // async, non-blocking
  return NextResponse.json({ ok: true, data: defaults });
}
