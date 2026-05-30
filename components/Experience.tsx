"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import type { ExperienceItem } from "@/lib/content";
import { Briefcase, Palette } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT_EXPO, slideLeft, slideRight, staggerContainer } from "@/lib/animations";

const defaultExperience: ExperienceItem[] = [
  {
    role: "System Engineer",
    company: "Tata Consultancy Services",
    period: "Jan 2026 – Present",
    type: "devops",
    current: true,
    bullets: [
      "Lead design and delivery of advanced DevOps training programs covering Kubernetes, CI/CD, and Azure",
      "Build challenge environments across Docker, Kubernetes, Ansible, Jenkins, GitLab, and Azure DevOps",
      "Develop training curricula aligned with real-world production requirements",
    ],
    tags: ["Kubernetes", "CI/CD", "Azure", "Docker", "Ansible"],
  },
  {
    role: "Assistant System Engineer",
    company: "Tata Consultancy Services",
    period: "Sep 2025 – Dec 2025",
    type: "devops",
    current: false,
    bullets: [
      "Designed and delivered Azure cloud training covering VMs, networking, storage, IAM, and Azure CLI",
      "Created hands-on lab exercises for provisioning and configuring Azure environments",
    ],
    tags: ["Azure", "Cloud", "Networking", "IAM"],
  },
  {
    role: "Assistant System Engineer Trainee",
    company: "Tata Consultancy Services",
    period: "Jan 2025 – Aug 2025",
    type: "devops",
    current: false,
    bullets: [
      "Built hands-on challenge environments using Docker, Kubernetes, Ansible, Jenkins, and GitLab",
      "Designed training content on Docker architecture, Kubernetes orchestration, and Azure DevOps pipelines",
    ],
    tags: ["Docker", "Kubernetes", "Jenkins", "GitLab"],
  },
  {
    role: "Graduate Trainee",
    company: "Tata Consultancy Services",
    period: "Sep 2024 – Dec 2024",
    type: "devops",
    current: false,
    bullets: [
      "Ranked top 6 out of 280 in TCS Ignite onboarding — top 2% of entire cohort",
      "Selected for Talent Development team based on performance",
    ],
    tags: ["TCS Ignite", "Top 2%"],
  },
  {
    role: "Freelance Graphic Designer",
    company: "Self-Employed",
    period: "Sep 2022 – Sep 2024",
    type: "design",
    current: false,
    bullets: [
      "Delivered logo, web, and UI/UX design projects over 2 years using Figma and Adobe Photoshop",
    ],
    tags: ["Figma", "UI/UX", "Adobe Photoshop"],
  },
];

export default function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const lineRef = useRef(null);
  const lineInView = useInView(lineRef, { once: true, margin: "-50px" });
  const reduced = useReducedMotion();
  const [items, setItems] = useState<ExperienceItem[]>(defaultExperience);

  useEffect(() => {
    fetch("/api/content?type=experience")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.data)) setItems(d.data); })
      .catch(() => {});
  }, []);

  return (
    <section
      id="experience"
      className="py-16 sm:py-24"
      style={{ background: "var(--surface-1)" }}
      ref={ref}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Title */}
          <motion.div
            variants={reduced ? undefined : slideLeft}
            className="flex items-center gap-4 mb-12"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">Experience</h2>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </motion.div>

          {/* Timeline */}
          <div className="relative" ref={lineRef}>
            {/* Static bg line */}
            <div
              className="absolute left-4 md:left-8 top-0 bottom-0 w-px"
              style={{ background: "var(--border)" }}
            />

            {/* Animated accent line draws down */}
            {!reduced && (
              <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px origin-top overflow-hidden">
                <motion.div
                  className="absolute inset-0 origin-top"
                  style={{ background: "var(--accent)" }}
                  initial={{ scaleY: 0 }}
                  animate={lineInView ? { scaleY: 1 } : {}}
                  transition={{ duration: 2, ease: EASE_OUT_EXPO, delay: 0.3 }}
                />
              </div>
            )}

            <div className="space-y-8">
              {items.map((item, i) => {
                // Alternate left/right slide
                const slideVariant = i % 2 === 0 ? slideLeft : slideRight;

                return (
                  <motion.div
                    key={i}
                    variants={reduced ? undefined : slideVariant}
                    className="relative pl-14 md:pl-24"
                  >
                    {/* Timeline dot with pulse on current role */}
                    <div className="absolute left-2.5 md:left-6 top-5 z-10">
                      <div
                        className="w-3 h-3 rounded-full border-2 border-[var(--accent)]"
                        style={{ background: "var(--background)" }}
                      />
                      {item.current && !reduced && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-[var(--accent)]"
                          animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                    </div>

                    {/* Card — left border grows 2 px → 4 px on hover */}
                    <motion.div
                      whileHover={reduced ? {} : { x: 4 }}
                      style={{ boxShadow: "inset 2px 0 0 var(--border)" }}
                      className="group/card rounded-xl p-5 sm:p-6 border border-[var(--border)] bg-[var(--background)] transition-all hover:border-[var(--accent)] hover:shadow-lg hover:[box-shadow:inset_4px_0_0_var(--accent)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {item.iconUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.iconUrl} alt="" width={14} height={14} style={{ objectFit: "contain", borderRadius: 2 }} />
                            ) : item.type === "devops" ? (
                              <Briefcase size={14} style={{ color: "var(--accent)" }} />
                            ) : (
                              <Palette size={14} style={{ color: "var(--accent)" }} />
                            )}
                            <h3 className="font-heading font-semibold text-base sm:text-lg">
                              {item.role}
                            </h3>
                          </div>
                          <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                            {item.company}
                          </p>
                        </div>
                        <span
                          className="text-xs px-3 py-1 rounded-full border border-[var(--border)] shrink-0"
                          style={{ color: "var(--muted)" }}
                        >
                          {item.period}
                        </span>
                      </div>

                      <ul className="space-y-1.5 mb-4">
                        {item.bullets.map((b, j) => (
                          <li
                            key={j}
                            className="flex gap-2 text-sm leading-relaxed"
                            style={{ color: "var(--muted)" }}
                          >
                            <span
                              className="mt-2 w-1 h-1 rounded-full shrink-0"
                              style={{ background: "var(--accent)" }}
                            />
                            {b}
                          </li>
                        ))}
                      </ul>

                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                            style={{
                              background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                              color: "var(--accent)",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
