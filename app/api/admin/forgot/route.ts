import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const RESET_OTP_KEY = "portfolio:admin:reset-otp";

export async function POST(req: Request) {
  const { email } = await req.json();

  // Only the configured admin email can request a reset
  if (
    !email ||
    email.trim().toLowerCase() !== (process.env.ADMIN_EMAIL ?? "").toLowerCase()
  ) {
    // Generic response — don't reveal whether the email is valid
    return NextResponse.json({ sent: true });
  }

  // 60-second resend cooldown
  const ttl = await redis.ttl(RESET_OTP_KEY);
  if (ttl > 540) {
    return NextResponse.json(
      { error: "Please wait before requesting another OTP." },
      { status: 429 }
    );
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  await redis.set(RESET_OTP_KEY, otp, { ex: 600 }); // 10-minute TTL

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.FROM_EMAIL ?? "Portfolio <noreply@samuvel.in>",
    to: process.env.ADMIN_EMAIL ?? "admin@samuvel.in",
    subject: `${otp} — Password reset OTP`,
    text: `Your password reset OTP: ${otp}\n\nExpires in 10 minutes. Single use.\n\nIf you did not request this, ignore this email and your password stays unchanged.`,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send OTP." }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}
