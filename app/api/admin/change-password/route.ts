import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import bcrypt from "bcryptjs";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const OTP_KEY      = "portfolio:admin:change-otp";
const PASSWORD_KEY = "portfolio:admin:password";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const valid = await redis.exists(`portfolio:admin:session:${token}`);
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { otp, newPassword } = await req.json();

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const stored = await redis.get(OTP_KEY);
  if (!stored || String(stored) !== String(otp).trim()) {
    return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 401 });
  }

  await redis.del(OTP_KEY);

  const hash = await bcrypt.hash(newPassword, 12);
  await redis.set(PASSWORD_KEY, hash);

  return NextResponse.json({ ok: true });
}
