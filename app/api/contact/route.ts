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
  const { from_name, reply_to, message, hp_field } = await request.json();

  // Honeypot — bots fill the hidden "hp_field"; humans never see it. The field
  // has a non-semantic name so browser autofill / password managers leave it
  // empty (the old "company" name was being autofilled and silently dropping
  // real messages). Pretend success so a bot doesn't retry.
  if (hp_field) return NextResponse.json({ ok: true });

  if (!from_name || !reply_to || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!EMAIL_RE.test(String(reply_to))) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Rate limit — one message per IP per 30 minutes (cooldown starts after a
  // successful send, below, so a failed send never locks the visitor out).
  const COOLDOWN = 1800; // seconds (30 min)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rlKey = `portfolio:rl:contact:${ip}`;
  const ttl = await redis.ttl(rlKey);
  if (typeof ttl === "number" && ttl > 0) {
    const mins = Math.ceil(ttl / 60);
    return NextResponse.json(
      {
        error: `You've already sent a message. Please wait about ${mins} minute${mins === 1 ? "" : "s"} before sending another.`,
        retryAfter: ttl,
      },
      { status: 429, headers: { "Retry-After": String(ttl) } }
    );
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
    return NextResponse.json({ error: "Couldn't send right now — please try again in a moment." }, { status: 500 });
  }

  // Message sent — start the 30-minute cooldown for this IP
  await redis.set(rlKey, "1", { ex: COOLDOWN });

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
