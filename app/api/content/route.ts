import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { CONTENT_KEYS, DEFAULTS, ContentType } from "@/lib/content";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const SECTION_LABELS: Record<ContentType, string> = {
  settings:   "Settings (availability / profile photo)",
  skills:     "Skills",
  experience: "Experience",
  projects:   "Projects",
};

async function verifySession(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return false;
  const exists = await redis.exists(`portfolio:admin:session:${token}`);
  return exists === 1;
}

async function sendChangeNotification(type: ContentType) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.FROM_EMAIL ?? "Portfolio <noreply@samuvel.in>",
    to:   process.env.ADMIN_EMAIL ?? "admin@samuvel.in",
    subject: `Portfolio updated — ${SECTION_LABELS[type]}`,
    text:
      `Your portfolio content was updated.\n\n` +
      `Section : ${SECTION_LABELS[type]}\n` +
      `Time    : ${new Date().toUTCString()}\n\n` +
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
  await redis.set(CONTENT_KEYS[type], JSON.stringify(body));
  sendChangeNotification(type); // async, non-blocking
  return NextResponse.json({ ok: true });
}
