"use client";

import { useEffect } from "react";
import { PALETTES, paletteCss } from "@/lib/content";

const STYLE_ID = "palette-override";
const FAVICON_BG = "#080A10";

/** Applies the admin-selected color palette by overriding the --accent CSS var. */
export function applyPalette(id: string | undefined) {
  if (typeof document === "undefined") return;
  const existing = document.getElementById(STYLE_ID);
  const palette = PALETTES.find((p) => p.id === id);

  if (!palette || palette.id === "default") {
    existing?.remove();
  } else {
    const el = (existing as HTMLStyleElement | null) ?? document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = paletteCss(palette);
    if (!existing) document.head.appendChild(el);
  }
  // Keep the favicon colour in sync with the chosen palette (use the dark/bright variant)
  setFavicon((palette ?? PALETTES[0]).dark);
}

/** Builds an SVG monogram favicon coloured by the palette accent. */
export function setFavicon(accent: string, initials = "SL") {
  if (typeof document === "undefined") return;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<rect width="32" height="32" rx="6" ry="6" fill="${FAVICON_BG}"/>` +
    `<text x="16" y="22" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" ` +
    `font-weight="700" font-size="16" letter-spacing="-1" fill="${accent}">${initials}</text>` +
    `</svg>`;
  const href = "data:image/svg+xml," + encodeURIComponent(svg);

  // Only manage our OWN <link>. Never remove the metadata-rendered icon tags —
  // React still tracks those and would crash on removeChild during navigation.
  // A runtime-injected SVG icon is preferred by modern browsers over the raster
  // fallbacks anyway.
  let link = document.getElementById("dynamic-favicon") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = "dynamic-favicon";
    link.rel = "icon";
    link.type = "image/svg+xml";
    document.head.appendChild(link);
  }
  link.href = href;
}

function initialsFrom(name: string): string {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "SL";
}

export default function PaletteProvider() {
  useEffect(() => {
    let initials = "SL";
    fetch("/api/content?type=profile")
      .then((r) => r.json())
      .then((d) => { if (d.data?.name) initials = initialsFrom(d.data.name); })
      .catch(() => {})
      .finally(() => {
        fetch("/api/content?type=settings")
          .then((r) => r.json())
          .then((d) => {
            applyPalette(d.data?.palette);
            const pal = PALETTES.find((p) => p.id === d.data?.palette) ?? PALETTES[0];
            setFavicon(pal.dark, initials);
          })
          .catch(() => setFavicon(PALETTES[0].dark, initials));
      });
  }, []);

  return null;
}
