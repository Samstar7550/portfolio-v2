import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { createHash } from "crypto";
import { parseUA, getGeo, VisitorRecord } from "@/lib/visitor";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const KEY          = "portfolio:views";
const VISITORS_KEY = "portfolio:visitors";

export async function GET() {
  const count = (await redis.get<number>(KEY)) ?? 0;
  return NextResponse.json({ count });
}

export async function POST(request: NextRequest) {
  // Parse body (referrer sent by ViewCounter)
  let referrer = "Direct";
  try {
    const body = await request.json();
    const raw = body?.referrer as string | undefined;
    if (raw) {
      try { referrer = new URL(raw).hostname.replace(/^www\./, ""); }
      catch { referrer = raw; }
    }
  } catch { /* body absent — old cached ViewCounter */ }

  // Increment counters
  const today = new Date().toISOString().split("T")[0];
  const dailyKey = `portfolio:views:daily:${today}`;
  const [count] = await Promise.all([redis.incr(KEY), redis.incr(dailyKey)]);
  redis.expire(dailyKey, 7_776_000).catch(() => {});

  // Track visitor (fire-and-forget — never delays the response)
  trackVisitor(request, referrer).catch(() => {});

  return NextResponse.json({ count });
}

async function trackVisitor(request: NextRequest, ref: string) {
  // Extract IP
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = (forwarded.split(",")[0] || "127.0.0.1").trim();

  // 1-hour dedup per IP so the same person doesn't appear multiple times
  const ipHash = createHash("sha256").update(ip + "sl-portfolio").digest("hex").slice(0, 16);
  const dedupKey = `portfolio:visitor:seen:${ipHash}`;
  if (await redis.exists(dedupKey)) return;
  await redis.set(dedupKey, "1", { ex: 3600 });

  // UA + geo (geo is async and can fail silently)
  const ua = request.headers.get("user-agent") ?? "";
  const [{ browser, os, device }, { country, city, flag }] = await Promise.all([
    Promise.resolve(parseUA(ua)),
    getGeo(ip),
  ]);

  const record: VisitorRecord = {
    id: Math.random().toString(36).slice(2, 9),
    country, city, flag, browser, os, device, ref,
    ts: Date.now(),
  };

  // Store in sorted set (score = timestamp for range queries)
  await redis.zadd(VISITORS_KEY, { score: record.ts, member: JSON.stringify(record) });

  // Prune records older than 30 days
  redis.zremrangebyscore(VISITORS_KEY, "-inf", Date.now() - 30 * 86_400_000).catch(() => {});
}
