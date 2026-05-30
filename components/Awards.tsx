"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Trophy, Medal, Star, Sparkles } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT_EXPO, slideLeft } from "@/lib/animations";
import { DEFAULT_AWARDS, AwardItem } from "@/lib/content";

const ICONS = [Trophy, Medal, Star, Sparkles];

export default function Awards() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const [awards, setAwards] = useState<AwardItem[]>(DEFAULT_AWARDS);

  useEffect(() => {
    fetch("/api/content?type=awards")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.data)) setAwards(d.data); })
      .catch(() => {});
  }, []);

  if (awards.length === 0) return null;

  return (
    <section id="awards" className="py-24 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          variants={reduced ? undefined : slideLeft}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex items-center gap-4 mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold">Awards &amp; Recognition</h2>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {awards.map((award, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <motion.div
                key={award.title + i}
                initial={reduced ? {} : { opacity: 0, y: 28 }}
                whileInView={reduced ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay: i * 0.1 }}
                whileHover={reduced ? {} : { y: -6 }}
                className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 transition-colors hover:border-[var(--accent)] cursor-default"
              >
                {/* Decorative gradient glow */}
                <div
                  aria-hidden
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-[0.12] group-hover:opacity-30 transition-opacity pointer-events-none"
                  style={{ background: "var(--accent)" }}
                />

                {/* Trophy badge with shine */}
                <div className="relative mb-5">
                  <motion.div
                    animate={reduced ? {} : { y: [0, -4, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{
                      background: "color-mix(in srgb, var(--accent) 14%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                    }}
                  >
                    <Icon size={26} style={{ color: "var(--accent)" }} aria-hidden />
                  </motion.div>
                  {/* sweeping shine on hover */}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-[200%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 pointer-events-none" />
                </div>

                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-heading font-semibold text-base leading-snug group-hover:text-[var(--accent)] transition-colors">
                    {award.title}
                  </h3>
                  {award.date && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                      style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}
                    >
                      {award.date}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium mb-3" style={{ color: "var(--accent)" }}>
                  {award.issuer}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {award.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
