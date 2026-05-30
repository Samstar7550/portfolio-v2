import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { createHash } from "crypto";
import { LEADS_KEY, Lead } from "@/lib/lead";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const { name, email } = await request.json();

  if (!name?.trim() || !email?.trim() || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Valid name and email required." }, { status: 400 });
  }

  // Rate limit: one widget submission per IP per hour
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = (forwarded.split(",")[0] || "127.0.0.1").trim();
  const ipHash = createHash("sha256").update(ip + "sl-lead").digest("hex").slice(0, 16);
  const rlKey = `portfolio:lead:rl:${ipHash}`;
  if (await redis.exists(rlKey)) {
    return NextResponse.json({ ok: true }); // silently accept — don't reveal rate limit
  }
  await redis.set(rlKey, "1", { ex: 3600 });

  const lead: Lead = {
    id: Math.random().toString(36).slice(2, 9),
    name: String(name).trim().slice(0, 100),
    email: String(email).trim().slice(0, 150),
    source: "widget",
    ts: Date.now(),
  };

  await redis.zadd(LEADS_KEY, { score: lead.ts, member: JSON.stringify(lead) });

  return NextResponse.json({ ok: true });
}
