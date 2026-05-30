"use client";

import { useState, useEffect } from "react";
import type { Project as ProjectType } from "@/lib/content";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, Server, Globe, ArrowRight } from "lucide-react";
import { FigmaIcon } from "@/components/BrandIcons";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT_EXPO, slideLeft } from "@/lib/animations";

const defaultProjects: ProjectType[] = [
  {
    title: "VizualizeHub",
    period: "Feb – Apr 2024",
    description:
      "Full-stack image editing SaaS application with AI-powered transformations, user authentication, and credit-based billing. Deployed with Vercel CD.",
    tech: ["Next.js", "TypeScript", "MongoDB", "Cloudinary", "Clerk", "Vercel"],
    link: "https://vizualizehub.vercel.app",
    linkLabel: "vizualizehub.vercel.app",
    type: "web",
    color: "#00C8D7",
    featured: true,
  },
  {
    title: "Feedback System",
    period: "Dec 2023",
    description:
      "Anonymous feedback web app with real-time email delivery. Clean, minimal UI with form validation and EmailJS integration for instant notifications.",
    tech: ["React", "JavaScript", "EmailJS", "Vercel"],
    link: "https://feedback-system-online-eight.vercel.app",
    linkLabel: "feedback-system-online-eight.vercel.app",
    type: "web",
    color: "#3178C6",
    featured: false,
  },
  {
    title: "DevOps Challenge Environment",
    period: "2025",
    description:
      "Designed broken Kubernetes and Docker environments for TCS engineer assessments. Engineers diagnosed and fixed real infrastructure issues — pod crashes, misconfigured services, failed pipelines.",
    tech: ["Kubernetes", "Docker", "Ansible", "Jenkins", "GitLab", "Azure DevOps"],
    link: null,
    linkLabel: null,
    type: "devops",
    color: "#326CE5",
    featured: true,
  },
  {
    title: "Student Attendance Management",
    period: "Dec 2023 – Jan 2024",
    description:
      "Full UI/UX design with real-time dashboard, analytics charts, and three-role login system (Admin, Teacher, Student). Built end-to-end in Figma with a complete design system.",
    tech: ["Figma", "UI/UX", "Design System", "Prototyping"],
    link: null,
    linkLabel: null,
    type: "design",
    color: "#F24E1E",
    featured: false,
  },
];

const ALL_DEFAULT_TAGS = ["All", ...Array.from(new Set(defaultProjects.flatMap((p) => p.tech)))];

function ProjectIcon({ type, color }: { type: string; color: string }) {
  const iconStyle = { color };
  if (type === "design") return <FigmaIcon size={16} style={iconStyle} />;
  if (type === "devops") return <Server size={16} style={iconStyle} />;
  return <Globe size={16} style={iconStyle} />;
}

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const [activeTag, setActiveTag] = useState("All");
  const [projectList, setProjectList] = useState<ProjectType[]>(defaultProjects);
  const [allTags, setAllTags] = useState<string[]>(ALL_DEFAULT_TAGS);

  useEffect(() => {
    fetch("/api/content?type=projects")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.data)) {
          setProjectList(d.data);
          setAllTags(["All", ...Array.from(new Set((d.data as ProjectType[]).flatMap((p) => p.tech)))]);
        }
      })
      .catch(() => {});
  }, []);

  const filtered =
    activeTag === "All" ? projectList : projectList.filter((p) => p.tech.includes(activeTag));

  return (
    <section id="projects" className="py-24 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          variants={reduced ? undefined : slideLeft}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex items-center gap-4 mb-8"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold">Projects</h2>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </motion.div>

        {/* Filter pills */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.45, ease: EASE_OUT_EXPO }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {allTags.map((tag) => {
            const active = tag === activeTag;
            return (
              <motion.button
                key={tag}
                onClick={() => setActiveTag(tag)}
                whileHover={reduced ? {} : { scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="relative text-xs px-3 py-1.5 rounded-full border font-medium transition-colors cursor-pointer"
                style={{
                  borderColor: active
                    ? "var(--accent)"
                    : "var(--border)",
                  color: active ? "var(--accent)" : "var(--muted)",
                  background: active
                    ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                    : "transparent",
                }}
              >
                {tag}
                {active && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "color-mix(in srgb, var(--accent) 8%, transparent)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Cards grid */}
        <motion.div
          layout
          className="grid md:grid-cols-2 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <motion.div
                key={project.title}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: EASE_OUT_EXPO }}
                whileHover={reduced ? {} : { y: -8 }}
                className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden transition-all hover:border-[var(--accent)] hover:shadow-2xl"
              >
                {/* Top accent bar */}
                <div
                  className="h-1 w-full opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ background: project.color }}
                />

                {/* Glow on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-32 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at top, color-mix(in srgb, ${project.color} 8%, transparent), transparent 70%)`,
                  }}
                />

                <div className="relative flex flex-col flex-1 p-5 sm:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: `color-mix(in srgb, ${project.color} 18%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${project.color} 30%, transparent)`,
                        }}
                      >
                        {project.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={project.iconUrl} alt="" width={18} height={18} style={{ objectFit: "contain" }} />
                        ) : (
                          <ProjectIcon type={project.type} color={project.color} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-base leading-tight">
                          {project.title}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                          {project.period}
                        </p>
                      </div>
                    </div>
                    {project.featured && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                        style={{
                          background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                          color: "var(--accent)",
                        }}
                      >
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p
                    className="text-sm leading-relaxed mb-4 flex-1"
                    style={{ color: "var(--muted)" }}
                  >
                    {project.description}
                  </p>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((t) => (
                      <button
                        key={t}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTag(t === activeTag ? "All" : t);
                        }}
                        className="text-xs px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer"
                        style={{
                          borderColor:
                            t === activeTag
                              ? "var(--accent)"
                              : "color-mix(in srgb, var(--accent) 35%, var(--border))",
                          color: t === activeTag ? "var(--accent)" : "var(--muted)",
                          background:
                            t === activeTag
                              ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                              : "transparent",
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Link */}
                  {project.link ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-90"
                      style={{ color: project.color }}
                    >
                      <ExternalLink size={12} />
                      {project.linkLabel}
                      <motion.span
                        className="inline-block"
                        whileHover={reduced ? {} : { x: 3 }}
                        style={{ display: "inline-flex", alignItems: "center" }}
                      >
                        <ArrowRight
                          size={12}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </motion.span>
                    </a>
                  ) : (
                    <span
                      className="inline-flex items-center gap-2 text-xs"
                      style={{ color: "var(--muted)" }}
                    >
                      <Server size={12} />
                      {project.type === "devops" ? "Internal TCS Project" : "Design Portfolio"}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-center py-12"
              style={{ color: "var(--muted)" }}
            >
              No projects match this filter.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
