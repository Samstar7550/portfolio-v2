---
name: upstash-json-gotcha
description: "@upstash/redis auto-deserializes JSON on read — breaks strict equality and JSON.parse(String(x))"
metadata:
  type: reference
---

`@upstash/redis` **auto-deserializes** any JSON-looking value when reading it back. This has bitten the portfolio project twice:

1. **OTP check** — stored `"234567"` (string), `redis.get()` returned the **number** `234567`. Strict `stored !== submitted` always failed. Fix: `String(stored) !== submitted`.
2. **Digest visitor/lead parsing** — stored members via `zadd({ member: JSON.stringify(obj) })`, but `zrange` returned them as **objects**, not strings. `JSON.parse(String(obj))` parsed `"[object Object]"` → threw → every record filtered to null → digest reported 0.

**Rule:** never assume a Redis read returns the raw string you stored. For object members, coerce defensively:
```ts
function coerce<T>(raw: unknown): T | null {
  if (raw && typeof raw === "object") return raw as T;
  if (typeof raw === "string") { try { return JSON.parse(raw) as T; } catch { return null; } }
  return null;
}
```
For numeric/string scalars compared with `===`, wrap in `String(...)` first.

Also: `redis.zrange(key, min, max, { byScore: true })` is the Upstash method name — there is **no** `zrangebyscore`. Pruning uses `zremrangebyscore(key, "-inf", cutoff)`.

Related: [[portfolio-project]]
