"use client";

import { useEffect } from "react";
import { PALETTES, paletteCss } from "@/lib/content";

const STYLE_ID = "palette-override";
const FAVICON_BG = "#080A10";
const LS_PALETTE = "portfolio:palette";
const LS_INITIALS = "portfolio:initials";

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

/** Builds an SVG monogram favicon coloured by the palette accent.
 *  Removes and re-appends the <link> on every call so browsers always reload it. */
export function setFavicon(accent: string, initials = "SL") {
  if (typeof document === "undefined") return;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<rect width="32" height="32" rx="6" ry="6" fill="${FAVICON_BG}"/>` +
    `<text x="16" y="22" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" ` +
    `font-weight="700" font-size="16" letter-spacing="-1" fill="${accent}">${initials}</text>` +
    `</svg>`;
  const href = "data:image/svg+xml," + encodeURIComponent(svg);

  // Remove and re-append so every browser notices the change immediately.
  document.getElementById("dynamic-favicon")?.remove();
  const link = document.createElement("link");
  link.id = "dynamic-favicon";
  link.rel = "icon";
  link.type = "image/svg+xml";
  link.sizes = "any";
  link.href = href;
  document.head.appendChild(link);
}

function initialsFrom(name: string): string {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "SL";
}

export default function PaletteProvider() {
  useEffect(() => {
    // Apply cached values immediately — no network round-trip, no flash.
    const cachedPalette = localStorage.getItem(LS_PALETTE) ?? undefined;
    const cachedInitials = localStorage.getItem(LS_INITIALS) ?? "SL";
    applyPalette(cachedPalette);
    const cachedPal = PALETTES.find((p) => p.id === cachedPalette) ?? PALETTES[0];
    setFavicon(cachedPal.dark, cachedInitials);

    // Fetch profile and settings in parallel; update if server values differ.
    Promise.all([
      fetch("/api/content?type=profile").then((r) => r.json()).catch(() => null),
      fetch("/api/content?type=settings").then((r) => r.json()).catch(() => null),
    ]).then(([profileData, settingsData]) => {
      const initials = profileData?.data?.name
        ? initialsFrom(profileData.data.name)
        : cachedInitials;
      const paletteId: string | undefined = settingsData?.data?.palette ?? undefined;

      localStorage.setItem(LS_INITIALS, initials);
      localStorage.setItem(LS_PALETTE, paletteId ?? "");

      applyPalette(paletteId);
      const pal = PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0];
      setFavicon(pal.dark, initials);
    });
  }, []);

  return null;
}
