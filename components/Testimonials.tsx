"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT_EXPO, slideLeft } from "@/lib/animations";
import { Testimonial } from "@/lib/content";

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetch("/api/content?type=testimonials")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.data)) setItems(d.data); })
      .catch(() => {});
  }, []);

  const go = useCallback((d: number) => {
    setDir(d);
    setIndex((i) => (i + d + items.length) % items.length);
  }, [items.length]);

  // Auto-advance (paused on hover / reduced-motion / <2 items)
  useEffect(() => {
    if (reduced || paused || items.length < 2) return;
    const t = setInterval(() => { setDir(1); setIndex((i) => (i + 1) % items.length); }, 6000);
    return () => clearInterval(t);
  }, [reduced, paused, items.length]);

  if (items.length === 0) return null;
  const t = items[Math.min(index, items.length - 1)];
  const initials = t.author.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  return (
    <section
      id="testimonials"
      className="py-16 sm:py-24"
      style={{ background: "var(--surface-1)" }}
      ref={ref}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          variants={reduced ? undefined : slideLeft}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex items-center gap-4 mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold">Testimonials</h2>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </motion.div>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Big decorative quote mark */}
          <Quote
            size={120}
            aria-hidden
            className="absolute -top-6 -left-2 opacity-[0.06] pointer-events-none"
            style={{ color: "var(--accent)" }}
          />

          <div className="relative min-h-[260px] sm:min-h-[220px] flex items-center">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.blockquote
                key={index}
                custom={dir}
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                className="relative w-full text-center px-2 sm:px-10"
              >
                <p className="font-heading text-lg sm:text-2xl leading-relaxed mb-8">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center justify-center gap-3">
                  {/* Avatar or initials */}
                  <div
                    className="w-11 h-11 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-heading font-bold text-sm text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    {t.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.avatarUrl} alt={t.author} className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">{t.author}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {t.role}{t.company ? ` · ${t.company}` : ""}
                    </div>
                  </div>
                </div>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Controls */}
          {items.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <motion.button
                onClick={() => go(-1)}
                whileTap={{ scale: 0.9 }}
                aria-label="Previous testimonial"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)] transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} style={{ color: "var(--accent)" }} />
              </motion.button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDir(i > index ? 1 : -1); setIndex(i); }}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className="h-2 rounded-full transition-all cursor-pointer"
                    style={{
                      width: i === index ? 20 : 8,
                      background: i === index ? "var(--accent)" : "var(--border)",
                    }}
                  />
                ))}
              </div>

              <motion.button
                onClick={() => go(1)}
                whileTap={{ scale: 0.9 }}
                aria-label="Next testimonial"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)] transition-colors cursor-pointer"
              >
                <ChevronRight size={16} style={{ color: "var(--accent)" }} />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
