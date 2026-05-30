"use client";

import { useEffect } from "react";
import { PALETTES, paletteCss } from "@/lib/content";

const STYLE_ID = "palette-override";
const LS_PALETTE = "portfolio:palette";

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
}

export default function PaletteProvider() {
  useEffect(() => {
    // Apply cached palette immediately — no flash on load.
    const cached = localStorage.getItem(LS_PALETTE) ?? undefined;
    applyPalette(cached);

    // Fetch fresh value from server and update cache.
    fetch("/api/content?type=settings")
      .then((r) => r.json())
      .then((d) => {
        const id: string | undefined = d.data?.palette ?? undefined;
        localStorage.setItem(LS_PALETTE, id ?? "");
        applyPalette(id);
      })
      .catch(() => {});
  }, []);

  return null;
}
