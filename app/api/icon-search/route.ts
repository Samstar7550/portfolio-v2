import { NextRequest, NextResponse } from "next/server";
import * as SimpleIcons from "simple-icons";

export type IconHit =
  | { source: "simple-icons"; title: string; slug: string; hex: string; svg: string }
  | { source: "iconify";      title: string; slug: string; cdnUrl: string };

// ─── simple-icons index (built once per cold start) ───────────────────────────

type SIEntry = { title: string; slug: string; hex: string; svg: string };

const SI_ALL: SIEntry[] = (Object.values(SimpleIcons) as unknown[]).filter(
  (v): v is SIEntry =>
    !!v && typeof v === "object" && "slug" in v && "title" in v && "hex" in v && "svg" in v
);

function siRank(icon: SIEntry, q: string): number {
  const s = icon.slug.toLowerCase();
  const t = icon.title.toLowerCase();
  if (s === q || t === q) return 4;
  if (s.startsWith(q) || t.startsWith(q)) return 3;
  if (s.includes(q) || t.includes(q)) return 2;
  if (t.split(/\s+/).some(w => w.startsWith(q))) return 1;
  return 0;
}

function searchSI(q: string): IconHit[] {
  return SI_ALL
    .map(icon => ({ icon, r: siRank(icon, q) }))
    .filter(x => x.r > 0)
    .sort((a, b) => b.r - a.r || a.icon.title.localeCompare(b.icon.title))
    .slice(0, 6)
    .map(x => ({
      source: "simple-icons" as const,
      title: x.icon.title,
      slug: x.icon.slug,
      hex: x.icon.hex,
      svg: x.icon.svg,
    }));
}

// ─── Iconify search (logos + devicon sets, much wider coverage) ───────────────

function iconifyTitle(id: string): string {
  // "logos:microsoft-azure" → "Microsoft Azure"
  const name = id.split(":")[1] ?? id;
  return name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

async function searchIconify(q: string): Promise<IconHit[]> {
  try {
    const url =
      `https://api.iconify.design/search?query=${encodeURIComponent(q)}&prefixes=logos,devicon&limit=8`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const ids: string[] = data.icons ?? [];
    return ids.map(id => ({
      source: "iconify" as const,
      title: iconifyTitle(id),
      slug: id,
      cdnUrl: `https://api.iconify.design/${id}.svg`,
    }));
  } catch {
    return [];
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").toLowerCase().trim();
  if (q.length < 2) return NextResponse.json({ icons: [] });

  const [siHits, iconifyHits] = await Promise.all([
    Promise.resolve(searchSI(q)),
    searchIconify(q),
  ]);

  // Merge: simple-icons first, then Iconify, dedup by normalised title
  const seen = new Set<string>();
  const merged: IconHit[] = [];
  for (const hit of [...siHits, ...iconifyHits]) {
    const key = hit.title.toLowerCase().replace(/\s+/g, "");
    if (!seen.has(key)) { seen.add(key); merged.push(hit); }
    if (merged.length >= 12) break;
  }

  return NextResponse.json({ icons: merged });
}
