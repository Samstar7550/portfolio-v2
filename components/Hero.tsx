"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Download, ExternalLink, Star } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT_EXPO } from "@/lib/animations";

const roles = ["DevOps Engineer", "Cloud Engineer", "System Engineer", "CI/CD Specialist"];

function useTypewriter(words: string[], speed = 80, deleteSpeed = 40, pause = 2000) {
  const [displayed, setDisplayed] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const current = words[wordIdx];
    if (!deleting && charIdx < current.length) {
      timer.current = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timer.current = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timer.current = setTimeout(() => setCharIdx((c) => c - 1), deleteSpeed);
    } else {
      setDeleting(false);
      setWordIdx((w) => (w + 1) % words.length);
    }
    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(timer.current);
  }, [charIdx, deleting, wordIdx, words, speed, deleteSpeed, pause]);

  return displayed;
}

// Particles that drift upward and wrap
function FloatingParticles() {
  // Stable seeded particles — no random during render/re-render
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: (i * 37.3 + 11) % 100,
      y: (i * 53.7 + 7) % 100,
      size: 1.5 + (i % 3),
      duration: 9 + (i % 7),
      delay: (i * 0.23) % 5,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.current.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: "var(--accent)",
          }}
          animate={{
            y: [0, -160, -320],
            opacity: [0, 0.22, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow blobs */}
      <div
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-[0.07]"
        style={{ background: "var(--accent)" }}
      />
      <div
        className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-[0.05]"
        style={{ background: "var(--accent)" }}
      />
    </div>
  );
}

// Loading screen clears at ~1.2s — hero stagger starts from this offset
const BASE = 1.2;

export default function Hero() {
  const role = useTypewriter(roles);
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax: bg moves at 0.3× scroll speed
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
    >
      {/* Parallax background layer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={reduced ? {} : { y: bgY }}
      >
        <FloatingParticles />
      </motion.div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">

        {/* 1 — Greeting badge  (delay 0 ms after base) */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: BASE, duration: 0.5, ease: EASE_OUT_EXPO }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 border border-[var(--border)] bg-[var(--surface-1)]"
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
          <span style={{ color: "var(--muted)" }}>
            Available for DevOps &amp; Cloud roles · Remote · India
          </span>
        </motion.div>

        {/* 2 — Name  (delay +150 ms) */}
        <motion.h1
          initial={reduced ? {} : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: BASE + 0.15, duration: 0.6, ease: EASE_OUT_EXPO }}
          className="font-heading text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-4 leading-none"
        >
          Samuvel{" "}
          <span style={{ color: "var(--accent)" }}>L</span>
        </motion.h1>

        {/* 3 — Typewriter  (delay +300 ms) */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: BASE + 0.3, duration: 0.5, ease: EASE_OUT_EXPO }}
          className="h-12 flex items-center justify-center mb-4"
        >
          <span className="text-xl sm:text-2xl font-medium" style={{ color: "var(--muted)" }}>
            {role}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.7 }}
              className="inline-block ml-0.5 w-0.5 h-6 align-middle"
              style={{ background: "var(--accent)" }}
            />
          </span>
        </motion.div>

        {/* 4 — Tagline  (delay +450 ms) */}
        <motion.p
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: BASE + 0.45, duration: 0.5, ease: EASE_OUT_EXPO }}
          className="text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          Building the pipelines that ship code
        </motion.p>

        {/* 5 — CTA buttons  (delay +600 ms, scale from 0.8) */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: BASE + 0.6, duration: 0.4, ease: EASE_OUT_EXPO }}
          className="flex flex-wrap gap-4 justify-center mb-8"
        >
          {/* Primary — shine sweep on hover */}
          <motion.button
            whileHover={reduced ? {} : { scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const el = document.querySelector("#projects");
              if (el) el.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
            }}
            className="group relative flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm text-white overflow-hidden cursor-pointer"
            style={{
              background: "var(--accent)",
              boxShadow: "0 0 20px color-mix(in srgb, var(--accent) 35%, transparent)",
            }}
          >
            {/* Shine sweep */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 pointer-events-none" />
            <ExternalLink size={16} />
            View Projects
          </motion.button>

          {/* Secondary — fill from left on hover */}
          <motion.a
            href="/resume.pdf"
            download
            whileHover={reduced ? {} : { scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group relative flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm border border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--accent)] overflow-hidden transition-colors cursor-pointer"
          >
            <span className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 bg-[color-mix(in_srgb,_var(--accent)_10%,_transparent)] transition-transform duration-300 pointer-events-none" />
            <span className="relative flex items-center gap-2">
              <Download size={16} />
              Download Resume
            </span>
          </motion.a>
        </motion.div>

        {/* 6 — Achievement badge  (delay +750 ms, bounces in from right) */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, x: 40, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={
            reduced
              ? { delay: BASE + 0.75, duration: 0.3 }
              : { delay: BASE + 0.75, type: "spring", stiffness: 280, damping: 18 }
          }
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface-1)] text-xs font-medium"
        >
          {/* Continuous float up/down (4s loop) */}
          <motion.div
            animate={reduced ? {} : { y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-2"
          >
            <Star size={12} style={{ color: "var(--accent)" }} />
            <span style={{ color: "var(--muted)" }}>Top 2% · TCS Ignite · #6 / 280</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: BASE + 1.3 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: "var(--muted)" }}
      >
        <span className="text-xs tracking-widest uppercase">scroll</span>
        <motion.div
          animate={reduced ? {} : { y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          <ArrowDown size={14} />
        </motion.div>
      </motion.div>
    </section>
  );
}
