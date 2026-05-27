"use client";
import { useEffect, useState } from "react";

// Read the preference synchronously so the initial render already has the
// correct value. Falls back to false on the server (no window) — the
// useEffect below will then confirm the real value immediately after hydration.
function getInitialReduced(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(getInitialReduced);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Sync in case the value changed between SSR and effect (rare, but correct)
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
