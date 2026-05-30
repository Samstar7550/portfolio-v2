import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { Redis } from "@upstash/redis";
import { LEADS_KEY, Lead } from "@/lib/lead";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: NextRequest) {
  const { from_name, reply_to, message } = await request.json();

  if (!from_name || !reply_to || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.FROM_EMAIL ?? "Portfolio <noreply@samuvel.in>",
    to: process.env.CONTACT_EMAIL ?? "contact@samuvel.in",
    replyTo: reply_to,
    subject: `New message from ${from_name}`,
    text: `Name: ${from_name}\nEmail: ${reply_to}\n\n${message}`,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }

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
