import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { FEEDBACK_KEY, FeedbackEntry } from "@/lib/content";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function requireAdmin(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return false;
  const exists = await redis.exists(`portfolio:admin:session:${token}`);
  return exists === 1;
}

function coerce<T>(raw: unknown): T | null {
  if (raw && typeof raw === "object") return raw as T;
  if (typeof raw === "string") { try { return JSON.parse(raw) as T; } catch { return null; } }
  return null;
}

// POST — public: submit feedback
export async function POST(req: NextRequest) {
  const { name, role, company, quote, hp_field } = await req.json();

  if (hp_field) return NextResponse.json({ ok: true }); // honeypot

  if (!name || !quote)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (String(name).trim().length < 2)
    return NextResponse.json({ error: "Name too short" }, { status: 400 });
  if (String(quote).trim().length < 10)
    return NextResponse.json({ error: "Feedback is too short" }, { status: 400 });

  // 1 submission per IP per 24 hours
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rlKey = `portfolio:rl:feedback:${ip}`;
  const ttl = await redis.ttl(rlKey);
  if (typeof ttl === "number" && ttl > 0) {
    const hrs = Math.ceil(ttl / 3600);
    return NextResponse.json(
      { error: `You've already submitted feedback. Try again in ${hrs > 1 ? `${hrs} hours` : "an hour"}.` },
      { status: 429 }
    );
  }

  const entry: FeedbackEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: String(name).trim().slice(0, 100),
    role: role ? String(role).trim().slice(0, 100) : undefined,
    company: company ? String(company).trim().slice(0, 100) : undefined,
    quote: String(quote).trim().slice(0, 1000),
    ts: Date.now(),
  };

  await redis.zadd(FEEDBACK_KEY, { score: entry.ts, member: JSON.stringify(entry) });
  await redis.set(rlKey, "1", { ex: 86400 });

  return NextResponse.json({ ok: true });
}

// GET — admin-gated: list all pending feedback (newest first)
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await redis.zrange(FEEDBACK_KEY, 0, -1, { rev: true });
  const entries = (raw as unknown[]).map(r => coerce<FeedbackEntry>(r)).filter(Boolean) as FeedbackEntry[];
  return NextResponse.json({ entries });
}

// DELETE — admin-gated: dismiss one feedback entry by id
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const raw = await redis.zrange(FEEDBACK_KEY, 0, -1);
  for (const r of raw as unknown[]) {
    const entry = coerce<FeedbackEntry>(r);
    if (entry?.id === id) {
      await redis.zrem(FEEDBACK_KEY, r);
      break;
    }
  }
  return NextResponse.json({ ok: true });
}
