import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const VIEWS_KEY = "portfolio:views";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const valid = await redis.exists(`portfolio:admin:session:${token}`);
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

  const keys = days.map((d) => `portfolio:views:daily:${d}`);
  const counts = await redis.mget<(number | null)[]>(...keys);
  const data = days.map((date, i) => ({ date, visits: Number(counts[i] ?? 0) }));
  const total = Number((await redis.get<number>(VIEWS_KEY)) ?? 0);
  const today = data[data.length - 1]?.visits ?? 0;

  return NextResponse.json({ data, total, today });
}
