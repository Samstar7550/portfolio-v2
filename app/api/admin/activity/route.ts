import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { VisitorRecord } from "@/lib/visitor";
import { LEADS_KEY, Lead } from "@/lib/lead";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const VISITORS_KEY = "portfolio:visitors";

// Upstash auto-deserializes JSON members back to objects on read; fall back to
// parsing a raw string if needed. See [[upstash-json-gotcha]].
function coerce<T>(raw: unknown): T | null {
  if (raw && typeof raw === "object") return raw as T;
  if (typeof raw === "string") {
    try { return JSON.parse(raw) as T; } catch { return null; }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const valid = await redis.exists(`portfolio:admin:session:${token}`);
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Newest 50 of each (rev = highest score / most recent first)
  const [rawLeads, rawVisitors] = await Promise.all([
    redis.zrange(LEADS_KEY, 0, 49, { rev: true }),
    redis.zrange(VISITORS_KEY, 0, 49, { rev: true }),
  ]);

  const leads = rawLeads
    .map(l => coerce<Lead>(l))
    .filter((l): l is Lead => l !== null);

  const visitors = rawVisitors
    .map(v => coerce<VisitorRecord>(v))
    .filter((v): v is VisitorRecord => v !== null);

  return NextResponse.json({ leads, visitors });
}
