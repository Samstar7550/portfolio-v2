import { Redis } from "@upstash/redis";
import { CONTENT_KEYS, DEFAULTS, ContentType } from "@/lib/content";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/** Server-side read of a content section from Redis, falling back to defaults. */
export async function getContent<T>(type: ContentType): Promise<T> {
  const raw = await redis.get(CONTENT_KEYS[type]);
  if (raw == null) return DEFAULTS[type] as T;
  if (typeof raw === "string") {
    try { return JSON.parse(raw) as T; } catch { return DEFAULTS[type] as T; }
  }
  return raw as T;
}
