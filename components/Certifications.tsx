"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Clock, CheckCircle } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { slideLeft } from "@/lib/animations";

const certs = [
  {
    title: "Microsoft Azure Fundamentals",
    badge: "AZ-900",
    issuer: "Microsoft",
    date: "Aug 2025",
    status: "issued",
    color: "#0078D4",
  },
  {
    title: "GitHub Copilot Certified",
    badge: "GH",
    issuer: "GitHub",
    date: "Mar 2026",
    status: "issued",
    color: "#2088FF",
  },
  {
    title: "Azure Administrator Associate",
    badge: "AZ-104",
    issuer: "Microsoft",
    date: "In Progress",
    status: "progress",
    color: "#0078D4",
  },
  {
    title: "UI/UX Design",
    badge: "UX",
    issuer: "Internshala",
    date: "Mar 2023",
    status: "issued",
    color: "#FF7262",
  },
];

// Returns animation props for a cert card. Centralising the reduced-motion
// logic here means a single place to update if the animation changes.
function certAnimation(reduced: boolean, delay: number) {
  if (reduced) return {} as Record<string, never>;
  return {
    initial: { opacity: 0, rotateX: -25, y: 24 },
    whileInView: { opacity: 1, rotateX: 0, y: 0 },
    transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    whileHover: { y: -6, scale: 1.02 },
  };
}

export default function Certifications() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  return (
    <section
      id="certifications"
      className="py-24 px-4"
      style={{ background: "var(--surface-1)" }}
      ref={ref}
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          variants={reduced ? undefined : slideLeft}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex items-center gap-4 mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold">Certifications</h2>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </motion.div>

        {/* Cards — flip in like physical cards */}
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          style={{ perspective: "1000px" }}
        >
          {certs.map((cert, i) => (
            <motion.div
              key={cert.title}
              {...certAnimation(reduced, i * 0.1)}
              viewport={{ once: true }}
              style={{ transformStyle: "preserve-3d" }}
              className="group relative rounded-xl p-5 border border-[var(--border)] bg-[var(--background)] transition-all hover:border-[var(--accent)] overflow-hidden cursor-default"
            >
              {/* Background accent glow */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity pointer-events-none"
                style={{ background: cert.color, transform: "translate(30%, -30%)" }}
              />

              <div className="relative">
                {/* Badge */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold font-heading mb-4"
                  style={{
                    background: `color-mix(in srgb, ${cert.color} 20%, transparent)`,
                    color: cert.color,
                    border: `1px solid color-mix(in srgb, ${cert.color} 30%, transparent)`,
                  }}
                >
                  {cert.badge}
                </div>

                <h3 className="font-heading font-semibold text-sm mb-1 leading-snug">
                  {cert.title}
                </h3>
                <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                  {cert.issuer}
                </p>

                <div className="flex items-center gap-2">
                  {cert.status === "issued" ? (
                    <CheckCircle size={12} style={{ color: "#22c55e" }} />
                  ) : (
                    <Clock size={12} style={{ color: "#f59e0b" }} />
                  )}
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: cert.status === "issued" ? "#22c55e" : "#f59e0b",
                    }}
                  >
                    {cert.date}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
