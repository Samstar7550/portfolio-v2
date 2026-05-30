import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { put } from "@vercel/blob";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const valid = await redis.exists(`portfolio:admin:session:${token}`);
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "png";
  const blob = await put(`portfolio-icons/${Date.now()}.${ext}`, file, {
    access: "private",
    contentType: file.type,
  });

  // Return a proxy URL so the private blob is always served through our API
  const proxyUrl = `/api/blob?src=${encodeURIComponent(blob.url)}`;
  return NextResponse.json({ url: proxyUrl });
}
