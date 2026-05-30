import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const OTP_KEY = "portfolio:admin:change-otp";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const valid = await redis.exists(`portfolio:admin:session:${token}`);
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ttl = await redis.ttl(OTP_KEY);
  if (ttl > 540) {
    return NextResponse.json(
      { error: "Please wait before requesting another OTP." },
      { status: 429 }
    );
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  await redis.set(OTP_KEY, otp, { ex: 600 });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.FROM_EMAIL ?? "Portfolio <noreply@samuvel.in>",
    to: process.env.ADMIN_EMAIL ?? "admin@samuvel.in",
    subject: `${otp} — Password change OTP`,
    text: `Your password change OTP: ${otp}\n\nExpires in 10 minutes. Single use.\n\nIf you did not request this, ignore it.`,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send OTP." }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}
