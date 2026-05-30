"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Download, ExternalLink, Star } from "lucide-react";
import Image from "next/image";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT_EXPO } from "@/lib/animations";
import { DEFAULT_PROFILE, Profile } from "@/lib/content";

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

function FloatingParticles() {
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
          animate={{ y: [0, -160, -320], opacity: [0, 0.22, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
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

const BASE = 1.2;

export default function Hero() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [available, setAvailable] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState("/resume.pdf");
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const role = useTypewriter(profile.roles);

  useEffect(() => {
    fetch("/api/content?type=settings")
      .then(r => r.json())
      .then(d => {
        if (typeof d.data?.available === "boolean") setAvailable(d.data.available);
        if (d.data?.photoUrl) setPhotoUrl(d.data.photoUrl);
        if (d.data?.resumeUrl) setResumeUrl(d.data.resumeUrl);
      })
      .catch(() => {});
    fetch("/api/content?type=profile")
      .then(r => r.json())
      .then(d => { if (d.data) setProfile(d.data); })
      .catch(() => {});
  }, []);

  // Name → first words + accented last word
  const nameParts = profile.name.trim().split(" ");
  const nameLast = nameParts.length > 1 ? nameParts.pop() : "";
  const nameFirst = nameParts.join(" ");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-12 overflow-hidden"
    >
      {/* Parallax background — decorative, hidden from screen readers */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={reduced ? {} : { y: bgY }}
      >
        <FloatingParticles />
      </motion.div>

      {/* ── Two-column grid ─────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── LEFT — text content ─────────────────────────────────────────── */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">

            {/* 1 — Availability badge */}
            <motion.div
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: BASE, duration: 0.5, ease: EASE_OUT_EXPO }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 border border-[var(--border)] bg-[var(--surface-1)]"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: available ? "#22c55e" : "var(--muted)",
                  ...(available && !reduced ? { animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" } : {}),
                }}
              />
              <span style={{ color: "var(--muted)" }}>
                {available ? profile.availableText : profile.unavailableText}
              </span>
            </motion.div>

            {/* 2 — Name */}
            <motion.h1
              initial={reduced ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: BASE + 0.15, duration: 0.6, ease: EASE_OUT_EXPO }}
              className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4 leading-none"
            >
              {nameFirst}{nameLast ? " " : ""}
              <span style={{ color: "var(--accent)" }}>{nameLast}</span>
            </motion.h1>

            {/* 3 — Typewriter role */}
            <motion.div
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: BASE + 0.3, duration: 0.5, ease: EASE_OUT_EXPO }}
              className="h-10 flex items-center justify-center lg:justify-start mb-4"
            >
              <span className="text-lg sm:text-xl font-medium" style={{ color: "var(--muted)" }}>
                {role}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.7 }}
                  className="inline-block ml-0.5 w-0.5 h-5 align-middle"
                  style={{ background: "var(--accent)" }}
                />
              </span>
            </motion.div>

            {/* 4 — Tagline */}
            <motion.p
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: BASE + 0.45, duration: 0.5, ease: EASE_OUT_EXPO }}
              className="text-base sm:text-lg mb-8 max-w-md leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              {profile.tagline}
            </motion.p>

            {/* 5 — CTA buttons */}
            <motion.div
              initial={reduced ? {} : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: BASE + 0.6, duration: 0.4, ease: EASE_OUT_EXPO }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8"
            >
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
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 pointer-events-none" />
                <ExternalLink size={16} />
                View Projects
              </motion.button>

              <motion.a
                href={resumeUrl}
                download="Samuvel_Resume.pdf"
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

            {/* 6 — Achievement badge */}
            <motion.div
              initial={reduced ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduced
                  ? { delay: BASE + 0.75, duration: 0.3 }
                  : { delay: BASE + 0.75, type: "spring", stiffness: 280, damping: 18 }
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface-1)] text-xs font-medium"
            >
              <motion.div
                animate={reduced ? {} : { y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-2"
              >
                <Star size={12} style={{ color: "var(--accent)" }} />
                <span style={{ color: "var(--muted)" }}>{profile.heroBadge}</span>
              </motion.div>
            </motion.div>
          </div>

          {/* ── RIGHT — profile photo ────────────────────────────────────────── */}
          <div className="flex items-center justify-center order-1 lg:order-2">
            <motion.div
              initial={reduced ? {} : { opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: BASE + 0.1, duration: 0.7, ease: EASE_OUT_EXPO }}
              className="relative"
            >
              {/* Decorative corner accents */}
              <div
                className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-30 pointer-events-none"
                style={{ background: "var(--accent)" }}
              />
              <div
                className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full blur-2xl opacity-20 pointer-events-none"
                style={{ background: "var(--accent)" }}
              />

              {/* Spinning accent ring — decorative */}
              {!reduced && (
                <motion.div
                  aria-hidden="true"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-[4px] rounded-full pointer-events-none"
                  style={{
                    background:
                      "conic-gradient(var(--accent) 0%, transparent 35%, var(--accent) 65%, transparent 100%)",
                    opacity: 0.55,
                  }}
                />
              )}

              {/* Photo */}
              <div
                className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full overflow-hidden border-2 border-[var(--background)]"
                style={{
                  boxShadow: "0 0 48px color-mix(in srgb, var(--accent) 35%, transparent)",
                }}
              >
                <Image
                  src={photoUrl ?? "/SAM.JPG"}
                  alt="Samuvel L — DevOps Engineer"
                  fill
                  priority
                  unoptimized={!!photoUrl}
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 224px, (max-width: 1024px) 256px, 320px"
                />
              </div>

              {/* Online status dot */}
              <motion.span
                animate={reduced ? {} : { scale: [1, 1.15, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-3 right-3 w-4 h-4 rounded-full border-2 border-[var(--background)]"
                style={{ background: "#22c55e" }}
              />

              {/* Floating stat card */}
              <motion.div
                initial={reduced ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: BASE + 0.9, duration: 0.5, ease: EASE_OUT_EXPO }}
                className="absolute -bottom-5 -left-6 lg:-left-10 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] shadow-lg text-xs font-medium backdrop-blur-sm"
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                  }}
                >
                  <Star size={13} style={{ color: "var(--accent)" }} />
                </span>
                <div>
                  <div className="font-semibold" style={{ color: "var(--foreground)" }}>
                    {profile.statValue}
                  </div>
                  <div style={{ color: "var(--muted)" }}>{profile.statLabel}</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
          {/* ────────────────────────────────────────────────────────────────── */}

        </div>
      </div>

      {/* Scroll indicator — decorative, hidden from screen readers */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: BASE + 1.4 }}
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
