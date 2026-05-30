import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { Redis } from "@upstash/redis";
import { LEADS_KEY, Lead } from "@/lib/lead";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const { from_name, reply_to, message, company } = await request.json();

  // Honeypot — bots fill the hidden "company" field; humans never see it.
  // Pretend success so the bot doesn't retry.
  if (company) return NextResponse.json({ ok: true });

  if (!from_name || !reply_to || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!EMAIL_RE.test(String(reply_to))) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Rate limit — max 5 submissions per IP per hour
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rlKey = `portfolio:rl:contact:${ip}`;
  const count = await redis.incr(rlKey);
  if (count === 1) await redis.expire(rlKey, 3600);
  if (count > 5) {
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  }

  const fromEmail = process.env.FROM_EMAIL ?? "Portfolio <noreply@samuvel.in>";
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: process.env.CONTACT_EMAIL ?? "contact@samuvel.in",
    replyTo: reply_to,
    subject: `New message from ${from_name}`,
    text: `Name: ${from_name}\nEmail: ${reply_to}\n\n${message}`,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }

  // Auto-reply to the sender (fire-and-forget — never blocks the response)
  resend.emails.send({
    from: fromEmail,
    to: String(reply_to),
    subject: "Thanks for reaching out — Samuvel L",
    text:
      `Hi ${String(from_name).trim()},\n\n` +
      `Thanks for getting in touch — I've received your message and will get back to you soon.\n\n` +
      `For reference, here's what you sent:\n"${String(message).trim().slice(0, 500)}"\n\n` +
      `— Samuvel L\nDevOps Engineer · https://www.samuvel.in`,
  }).catch((e) => console.error("Auto-reply failed:", e));

  // Store as a lead for the nightly digest (fire-and-forget)
  const lead: Lead = {
    id: Math.random().toString(36).slice(2, 9),
    name: String(from_name).trim().slice(0, 100),
    email: String(reply_to).trim().slice(0, 150),
    source: "contact",
    message: String(message).trim().slice(0, 150),
    ts: Date.now(),
  };
  redis.zadd(LEADS_KEY, { score: lead.ts, member: JSON.stringify(lead) }).catch(() => {});

  return NextResponse.json({ ok: true });
}
