import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const VIEWS_KEY = "portfolio:views";
const SNAPSHOT_KEY = "portfolio:views:snapshot";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const total = (await redis.get<number>(VIEWS_KEY)) ?? 0;
  const snapshot = (await redis.get<number>(SNAPSHOT_KEY)) ?? 0;
  const daily = total - snapshot;

  await redis.set(SNAPSHOT_KEY, total);

  const emailRes = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: "samstar7550@gmail.com",
        from_name: "Portfolio Analytics",
        reply_to: "noreply@portfolio.dev",
        message: `Daily Portfolio Report\n\n` +
          `Visits (last 24h): ${daily}\n` +
          `Total visits:      ${total}\n\n` +
          `— Your portfolio bot`,
      },
    }),
  });

  if (!emailRes.ok) {
    const text = await emailRes.text();
    console.error("EmailJS error:", text);
    return NextResponse.json({ error: "Email failed", detail: text }, { status: 500 });
  }

  return NextResponse.json({ ok: true, daily, total });
}
