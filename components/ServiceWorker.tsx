"use client";

import { useEffect } from "react";

/** Registers the network-first service worker so the site is installable (PWA). */
export default function ServiceWorker() {
  useEffect(() => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
