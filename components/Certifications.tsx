"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Clock, CheckCircle } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { slideLeft } from "@/lib/animations";
import { DEFAULT_CERTIFICATIONS, Certification } from "@/lib/content";

export default function Certifications() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const [certs, setCerts] = useState<Certification[]>(DEFAULT_CERTIFICATIONS);

  useEffect(() => {
    fetch("/api/content?type=certifications")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.data)) setCerts(d.data); })
      .catch(() => {});
  }, []);

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
              initial={reduced ? {} : { opacity: 0, rotateX: -25, y: 24 }}
              whileInView={
                reduced
                  ? {}
                  : { opacity: 1, rotateX: 0, y: 0 }
              }
              viewport={{ once: true }}
              transition={
                reduced
                  ? {}
                  : {
                      delay: i * 0.1,
                      duration: 0.55,
                      ease: [0.22, 1, 0.36, 1],
                    }
              }
              whileHover={reduced ? {} : { y: -6, scale: 1.02 }}
              style={{ transformStyle: "preserve-3d" }}
              className="group relative rounded-xl p-5 border border-[var(--border)] bg-[var(--background)] transition-all hover:border-[var(--accent)] overflow-hidden cursor-default"
            >
              {/* Background accent glow */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity pointer-events-none"
                style={{ background: cert.color, transform: "translate(30%, -30%)" }}
              />

              <div className="relative">
                {/* Badge — fixed 48×48 box; text scales/wraps so long codes don't blow out the margin */}
                <div
                  className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-center font-bold font-heading mb-4 px-1 leading-none break-all overflow-hidden ${
                    (cert.badge?.length ?? 0) > 5
                      ? "text-[9px]"
                      : (cert.badge?.length ?? 0) > 3
                      ? "text-xs"
                      : "text-sm"
                  }`}
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
