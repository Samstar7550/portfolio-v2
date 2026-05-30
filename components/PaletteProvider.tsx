"use client";

import { useEffect } from "react";
import { PALETTES, paletteCss } from "@/lib/content";

const STYLE_ID = "palette-override";

/** Applies the admin-selected color palette by overriding the --accent CSS var. */
export function applyPalette(id: string | undefined) {
  if (typeof document === "undefined") return;
  const existing = document.getElementById(STYLE_ID);
  const palette = PALETTES.find((p) => p.id === id);

  // Default palette = the values already in globals.css → just remove any override
  if (!palette || palette.id === "default") {
    existing?.remove();
    return;
  }

  const el = (existing as HTMLStyleElement | null) ?? document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = paletteCss(palette);
  if (!existing) document.head.appendChild(el);
}

export default function PaletteProvider() {
  useEffect(() => {
    fetch("/api/content?type=settings")
      .then((r) => r.json())
      .then((d) => applyPalette(d.data?.palette))
      .catch(() => {});
  }, []);

  return null;
}
