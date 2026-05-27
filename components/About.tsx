"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, MapPin, Building2, Award } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-12">
      <h2 className="font-heading text-3xl sm:text-4xl font-bold">{children}</h2>
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    </div>
  );
}

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { value: "Top 2%", label: "TCS Ignite Cohort" },
    { value: "#6/280", label: "TCS Ignite Ranking" },
    { value: "89%", label: "B.Sc. Score" },
    { value: "2+ yrs", label: "Design Experience" },
  ];

  return (
    <section id="about" className="py-24 px-4 max-w-6xl mx-auto" ref={ref}>
      <motion.div
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <motion.div variants={fadeUp}>
          <SectionTitle>About Me</SectionTitle>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Bio */}
          <motion.div variants={fadeUp} className="space-y-6">
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
              I chose DevOps because I wanted to be where{" "}
              <span className="font-medium" style={{ color: "var(--foreground)" }}>
                code becomes real
              </span>
              . At TCS, I build hands-on challenge environments and test scenarios using Kubernetes,
              Docker, Ansible, Jenkins, GitLab, and Azure to{" "}
              <span className="font-medium" style={{ color: "var(--foreground)" }}>
                assess and upskill engineers
              </span>
              .
            </p>
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
              Top{" "}
              <span
                className="font-semibold px-1.5 py-0.5 rounded text-sm"
                style={{
                  background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                  color: "var(--accent)",
                }}
              >
                6 out of 280 engineers
              </span>{" "}
              in TCS Ignite. Ranked in the{" "}
              <span
                className="font-semibold px-1.5 py-0.5 rounded text-sm"
                style={{
                  background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                  color: "var(--accent)",
                }}
              >
                top 2%
              </span>{" "}
              of my entire onboarding cohort.
            </p>

            {/* Quick info */}
            <div className="space-y-3 pt-2">
              {[
                { icon: Building2, text: "System Engineer @ Tata Consultancy Services" },
                { icon: MapPin, text: "Remote · India" },
                { icon: Award, text: "AZ-900 Certified · GitHub Copilot Certified" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon
                    size={16}
                    className="shrink-0"
                    style={{ color: "var(--accent)" }}
                  />
                  <span className="text-sm" style={{ color: "var(--muted)" }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right column — stats + education */}
          <motion.div variants={fadeUp} className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <motion.div
                  key={s.label}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-xl p-4 border border-[var(--border)] bg-[var(--surface-1)] transition-all hover:border-[var(--accent)]"
                >
                  <div
                    className="font-heading text-2xl font-bold mb-1"
                    style={{ color: "var(--accent)" }}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Education card */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="rounded-xl p-5 border border-[var(--border)] bg-[var(--surface-1)] transition-all hover:border-[var(--accent)]"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                  }}
                >
                  <GraduationCap size={20} style={{ color: "var(--accent)" }} />
                </div>
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
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      2021 – 2024
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
