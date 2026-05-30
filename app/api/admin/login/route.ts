import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const PASSWORD_KEY = "portfolio:admin:password";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (
    !email ||
    email.trim().toLowerCase() !== (process.env.ADMIN_EMAIL ?? "").toLowerCase()
  ) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  // Get stored hash; if none yet, seed from ADMIN_PASSWORD env var
  let hash = await redis.get(PASSWORD_KEY);
  if (!hash) {
    const initial = process.env.ADMIN_PASSWORD;
    if (!initial) {
      return NextResponse.json(
        { error: "Admin password not configured. Set ADMIN_PASSWORD env var." },
        { status: 500 }
      );
    }
    hash = await bcrypt.hash(initial, 12);
    await redis.set(PASSWORD_KEY, hash);
  }

  const valid = await bcrypt.compare(password, String(hash));
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = randomBytes(32).toString("hex");
  await redis.set(`portfolio:admin:session:${token}`, "1", { ex: 86400 });

  return NextResponse.json({ token });
}
