"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const reduced = useReducedMotion();

  const spring = useSpring(progress, { stiffness: 200, damping: 30 });

  useEffect(() => {
    let rafId: number | null = null;

    const onScroll = () => {
      // Throttle to one update per animation frame — avoids flooding React
      // with a setState on every pixel of scroll (60-120 calls/s at fast speed).
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        const el = document.documentElement;
        const scrolled = el.scrollTop;
        const total = el.scrollHeight - el.clientHeight;
        setProgress(total > 0 ? scrolled / total : 0);
        rafId = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  if (reduced) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] origin-left"
      style={{
        scaleX: spring,
        background: "linear-gradient(to right, #00C8D7, #0F64D2)",
      }}
    />
  );
}
