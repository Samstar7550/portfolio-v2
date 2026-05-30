import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import bcrypt from "bcryptjs";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const RESET_OTP_KEY = "portfolio:admin:reset-otp";
const PASSWORD_KEY   = "portfolio:admin:password";

export async function POST(req: Request) {
  const { email, otp, newPassword } = await req.json();

  if (
    !email ||
    email.trim().toLowerCase() !== (process.env.ADMIN_EMAIL ?? "").toLowerCase()
  ) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const stored = await redis.get(RESET_OTP_KEY);
  if (!stored || String(stored) !== String(otp).trim()) {
    return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 401 });
  }

  await redis.del(RESET_OTP_KEY);

  const hash = await bcrypt.hash(newPassword, 12);
  await redis.set(PASSWORD_KEY, hash);

  return NextResponse.json({ ok: true });
}
