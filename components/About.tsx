"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { GraduationCap, MapPin, Building2, Award } from "lucide-react";
import Image from "next/image";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT_EXPO } from "@/lib/animations";

// ─── Shared viewport config ───────────────────────────────────────────────────
const VP = { once: true, margin: "-60px" } as const;

// ─── Count-up number ──────────────────────────────────────────────────────────
function CountUp({
  target, prefix = "", suffix = "", duration = 1200,
}: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setCount(target); return; }
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration, reduced]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

// ─── Section title with animated draw-in line ─────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();

  return (
    <div ref={ref} className="flex items-center gap-4 mb-12">
      <motion.h2
        className="font-heading text-3xl sm:text-4xl font-bold"
        initial={reduced ? {} : { opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      >
        {children}
      </motion.h2>
      <motion.div
        aria-hidden="true"
        className="flex-1 h-px origin-left"
        style={{ background: "var(--border)" }}
        initial={reduced ? {} : { scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.2 }}
      />
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const stats = [
  { prefix: "Top ", target: 2,  suffix: "%",    label: "TCS Ignite Cohort" },
  { prefix: "#",   target: 6,  suffix: "/280",  label: "TCS Ignite Ranking" },
  { prefix: "",    target: 89, suffix: "%",     label: "B.Sc. Score" },
  { prefix: "",    target: 2,  suffix: "+ yrs", label: "Design Experience" },
];

const quickInfo = [
  { icon: Building2, text: "System Engineer @ Tata Consultancy Services" },
  { icon: MapPin,    text: "Remote · India" },
  { icon: Award,     text: "AZ-900 Certified · GitHub Copilot Certified" },
];

// ─── Reusable animation wrappers ──────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? {} : { opacity: 0, y: 24 }}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={VP}
      transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}

function SlideIn({ children, delay = 0, from = "left", className = "" }: {
  children: React.ReactNode; delay?: number; from?: "left" | "right"; className?: string;
}) {
  const reduced = useReducedMotion();
  const x = from === "left" ? -32 : 32;
  return (
    <motion.div
      className={className}
      initial={reduced ? {} : { opacity: 0, x }}
      whileInView={reduced ? {} : { opacity: 1, x: 0 }}
      viewport={VP}
      transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function About() {
  const reduced = useReducedMotion();
  const decorRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: decorRef, offset: ["start end", "end start"] });
  const decorY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section id="about" className="py-24 px-4 max-w-6xl mx-auto relative overflow-hidden">

      {/* Decorative blob */}
      <motion.div
        ref={decorRef}
        aria-hidden="true"
        className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl opacity-[0.04] pointer-events-none"
        style={{ background: "var(--accent)", y: reduced ? 0 : decorY }}
      />

      <SectionTitle>About Me</SectionTitle>

      <div className="grid lg:grid-cols-2 gap-12 items-start">

        {/* ── LEFT — bio ────────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Profile row */}
          <SlideIn from="left" delay={0.05}>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-[var(--accent)]"
                style={{ boxShadow: "0 0 16px color-mix(in srgb, var(--accent) 30%, transparent)" }}
              >
                <Image
                  src="/SAM.JPG"
                  alt="Samuvel L"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <p className="font-heading font-bold text-lg leading-tight">Samuvel L</p>
                <p className="text-sm" style={{ color: "var(--accent)" }}>
                  System Engineer @ TCS
                </p>
              </div>
            </div>
          </SlideIn>

          {/* Para 1 */}
          <FadeUp delay={0.12}>
            <p className="text-base leading-relaxed" style={{ color: "var(--muted)" }}>
              I chose DevOps because I wanted to be where{" "}
              <span className="font-medium" style={{ color: "var(--foreground)" }}>
                code becomes real
              </span>{" "}
              — where a developer&apos;s push becomes a running service. At TCS I&apos;ve grown from
              Graduate Trainee to System Engineer in 20 months, building{" "}
              <span className="font-medium" style={{ color: "var(--foreground)" }}>
                hands-on challenge environments
              </span>{" "}
              with Kubernetes, Docker, Ansible, Jenkins, GitLab, and Azure — making tools break,
              recover, and behave in edge cases. That&apos;s deeper technical exposure than most
              junior engineers get.
            </p>
          </FadeUp>

          {/* Para 2 */}
          <FadeUp delay={0.2}>
            <p className="text-base leading-relaxed" style={{ color: "var(--muted)" }}>
              I work across the full{" "}
              <span className="font-medium" style={{ color: "var(--foreground)" }}>
                Microsoft DevOps stack
              </span>{" "}
              — configuring Azure Pipelines, managing repos and boards, and storing build artifacts.
              I hold the{" "}
              <span
                className="font-semibold px-1.5 py-0.5 rounded text-sm"
                style={{
                  background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                  color: "var(--accent)",
                }}
              >
                AZ-900
              </span>{" "}
              and{" "}
              <span
                className="font-semibold px-1.5 py-0.5 rounded text-sm"
                style={{
                  background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                  color: "var(--accent)",
                }}
              >
                GitHub Copilot
              </span>{" "}
              certifications and am preparing for{" "}
              <span className="font-medium" style={{ color: "var(--foreground)" }}>
                AZ-104
              </span>{" "}
              to deepen my Azure infrastructure skills.
            </p>
          </FadeUp>

          {/* Para 3 */}
          <FadeUp delay={0.28}>
            <p className="text-base leading-relaxed" style={{ color: "var(--muted)" }}>
              My background in{" "}
              <span className="font-medium" style={{ color: "var(--foreground)" }}>
                full-stack development
              </span>{" "}
              (Next.js, React, TypeScript) and{" "}
              <span className="font-medium" style={{ color: "var(--foreground)" }}>
                UI/UX design
              </span>{" "}
              gives me an edge most DevOps engineers don&apos;t have — I understand the entire
              delivery lifecycle, from design to deployment. Now looking for a hands-on{" "}
              <span className="font-medium" style={{ color: "var(--foreground)" }}>
                DevOps or Cloud Engineer role
              </span>{" "}
              where I can own infrastructure and solve real delivery problems.
            </p>
          </FadeUp>

          {/* Quick info — each slides in from left with increasing delay */}
          <div className="space-y-3 pt-2">
            {quickInfo.map(({ icon: Icon, text }, i) => (
              <SlideIn key={text} from="left" delay={0.32 + i * 0.1}>
                <div className="flex items-center gap-3">
                  <Icon size={16} aria-hidden="true" className="shrink-0" style={{ color: "var(--accent)" }} />
                  <span className="text-sm" style={{ color: "var(--muted)" }}>{text}</span>
                </div>
              </SlideIn>
            ))}
          </div>
        </div>

        {/* ── RIGHT — stats + education ─────────────────────────────────── */}
        <div className="space-y-6">

          {/* Stats — each card scales in with stagger */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={reduced ? {} : { opacity: 0, scale: 0.82, y: 16 }}
                whileInView={reduced ? {} : { opacity: 1, scale: 1, y: 0 }}
                viewport={VP}
                transition={{
                  duration: 0.5,
                  ease: EASE_OUT_EXPO,
                  delay: 0.08 + i * 0.1,
                }}
                whileHover={reduced ? {} : { scale: 1.04, y: -3 }}
                className="rounded-xl p-4 border border-[var(--border)] bg-[var(--surface-1)] transition-colors hover:border-[var(--accent)] cursor-default"
              >
                <div className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--accent)" }}>
                  <CountUp prefix={s.prefix} target={s.target} suffix={s.suffix} />
                </div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Education card — slides in from right */}
          <SlideIn from="right" delay={0.38}>
            <motion.div
              whileHover={reduced ? {} : { scale: 1.01, y: -2 }}
              className="rounded-xl p-5 border border-[var(--border)] bg-[var(--surface-1)] transition-colors hover:border-[var(--accent)]"
            >
              <div className="flex items-start gap-4">
                <motion.div
                  whileHover={reduced ? {} : { rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.4 }}
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)" }}
                >
                  <GraduationCap size={20} aria-hidden="true" style={{ color: "var(--accent)" }} />
                </motion.div>
                <div>
                  <div className="font-semibold font-heading text-sm mb-0.5">
                    B.Sc Computer Science
                  </div>
                  <div className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                    Sankara College of Arts &amp; Science
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                        color: "var(--accent)",
                      }}
                    >
                      89%
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>2021 – 2024</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </SlideIn>

        </div>
      </div>
    </section>
  );
}
