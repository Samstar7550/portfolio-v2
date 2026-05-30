import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { VisitorRecord, formatTime } from "@/lib/visitor";
import { LEADS_KEY, LEADS_LAST_RUN, Lead } from "@/lib/lead";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const VIEWS_KEY      = "portfolio:views";
const SNAPSHOT_KEY   = "portfolio:views:snapshot";
const VISITORS_KEY   = "portfolio:visitors";
const LAST_RUN_KEY   = "portfolio:digest:last-run";

// Upstash auto-deserializes JSON-stringified members back into objects on read,
// but falls back to a raw string if parsing failed when stored. Handle both.
function coerce<T>(raw: unknown): T | null {
  if (raw && typeof raw === "object") return raw as T;
  if (typeof raw === "string") {
    try { return JSON.parse(raw) as T; } catch { return null; }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Fetch analytics ──────────────────────────────────────────────────────────
  const total    = Number((await redis.get<number>(VIEWS_KEY)) ?? 0);
  const snapshot = Number((await redis.get<number>(SNAPSHOT_KEY)) ?? 0);
  const daily    = total - snapshot;
  await redis.set(SNAPSHOT_KEY, total);

  // ── Fetch new visitors since last run ─────────────────────────────────────────
  const lastRunRaw = await redis.get<number>(LAST_RUN_KEY);
  const lastRun    = lastRunRaw ? Number(lastRunRaw) : Date.now() - 86_400_000;
  const now        = Date.now();

  const rawVisitors = await redis.zrange(VISITORS_KEY, lastRun + 1, now, { byScore: true });
  await redis.set(LAST_RUN_KEY, now);

  const visitors: VisitorRecord[] = rawVisitors
    .map(v => coerce<VisitorRecord>(v))
    .filter((v): v is VisitorRecord => v !== null)
    .sort((a, b) => a.ts - b.ts);

  // ── Fetch new leads since last run ────────────────────────────────────────────
  const leadsLastRaw = await redis.get<number>(LEADS_LAST_RUN);
  const leadsLast    = leadsLastRaw ? Number(leadsLastRaw) : Date.now() - 86_400_000;

  const rawLeads = await redis.zrange(LEADS_KEY, leadsLast + 1, now, { byScore: true });
  await redis.set(LEADS_LAST_RUN, now);

  const leads: Lead[] = rawLeads
    .map(l => coerce<Lead>(l))
    .filter((l): l is Lead => l !== null)
    .sort((a, b) => a.ts - b.ts);

  // ── Build email ───────────────────────────────────────────────────────────────
  const date = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const visitorLines = visitors.length === 0
    ? "  No new visitors today.\n"
    : visitors.map((v, i) =>
        `  ${i + 1}. ${v.flag} ${v.country}${v.city ? `, ${v.city}` : ""}\n` +
        `     ${v.browser} · ${v.os} · ${v.device}\n` +
        `     via: ${v.ref || "Direct"}\n` +
        `     @ ${formatTime(v.ts)}\n`
      ).join("\n");

  const leadLines = leads.length === 0
    ? "  No new leads today.\n"
    : leads.map((l, i) =>
        `  ${i + 1}. ${l.name}  <${l.email}>\n` +
        `     source: ${l.source === "contact" ? "Contact form" : "Hiring widget"}\n` +
        (l.message ? `     “${l.message}${l.message.length >= 150 ? "…" : ""}”\n` : "") +
        `     @ ${formatTime(l.ts)}\n`
      ).join("\n");

  // Leads are the headline — surface them in the subject first
  const subject = leads.length > 0
    ? `Portfolio Digest — ${leads.length} new lead${leads.length > 1 ? "s" : ""}! · ${date}`
    : visitors.length > 0
    ? `Portfolio Digest — ${visitors.length} new visitor${visitors.length > 1 ? "s" : ""} · ${date}`
    : `Portfolio Digest — ${date}`;

  const body =
    `📊 PORTFOLIO DAILY DIGEST\n` +
    `${date}\n` +
    `${"─".repeat(50)}\n\n` +

    `ANALYTICS\n` +
    `  Views today   : ${daily}\n` +
    `  Total visits  : ${total}\n\n` +

    `🔥 NEW LEADS (${leads.length})\n` +
    `${"─".repeat(50)}\n` +
    leadLines +
    `\n` +

    `NEW VISITORS (${visitors.length})\n` +
    `${"─".repeat(50)}\n` +
    visitorLines +
    `\n${"─".repeat(50)}\n` +
    `Sent nightly by your portfolio bot.\n`;

  // ── Send email ────────────────────────────────────────────────────────────────
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.FROM_EMAIL    ?? "Portfolio <noreply@samuvel.in>",
    to:   process.env.ADMIN_EMAIL   ?? "admin@samuvel.in",
    subject,
    text: body,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Email failed", detail: error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, daily, total, newVisitors: visitors.length, newLeads: leads.length });
}
