import { NextRequest, NextResponse } from "next/server";
import * as SimpleIcons from "simple-icons";

type IconEntry = { title: string; slug: string; hex: string; svg: string };

// Build index once per cold start
const ALL_ICONS: IconEntry[] = (Object.values(SimpleIcons) as unknown[])
  .filter((v): v is IconEntry =>
    !!v && typeof v === "object" && "slug" in v && "title" in v && "hex" in v && "svg" in v
  );

function rank(icon: IconEntry, q: string): number {
  const s = icon.slug.toLowerCase();
  const t = icon.title.toLowerCase();
  if (s === q || t === q) return 4;
  if (s.startsWith(q) || t.startsWith(q)) return 3;
  if (s.includes(q) || t.includes(q)) return 2;
  // word-boundary match
  if (t.split(/\s+/).some(w => w.startsWith(q))) return 1;
  return 0;
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").toLowerCase().trim();
  if (q.length < 2) return NextResponse.json({ icons: [] });

  const hits = ALL_ICONS
    .map(icon => ({ icon, r: rank(icon, q) }))
    .filter(x => x.r > 0)
    .sort((a, b) => b.r - a.r || a.icon.title.localeCompare(b.icon.title))
    .slice(0, 8)
    .map(x => ({ title: x.icon.title, slug: x.icon.slug, hex: x.icon.hex, svg: x.icon.svg }));

  return NextResponse.json({ icons: hits });
}
