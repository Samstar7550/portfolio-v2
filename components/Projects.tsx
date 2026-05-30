"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Project as ProjectType } from "@/lib/content";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, Server, Globe, ArrowRight, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
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

// Live uptime indicator — pings the project's link via our /api/status proxy
function StatusDot({ url }: { url: string }) {
  const [s, setS] = useState<{ ok: boolean; ms: number } | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/status?url=${encodeURIComponent(url)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d && typeof d.ok === "boolean") setS(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, [url]);

  const color = s == null ? "#9ca3af" : s.ok ? "#22c55e" : "#ef4444";
  const text = s == null ? "checking" : s.ok ? "live" : "down";
  const title = s == null ? "Checking status…" : s.ok ? `Live · ${s.ms}ms` : "Currently unreachable";

  return (
    <span className="inline-flex items-center gap-1.5" title={title}>
      <span className="relative flex h-2 w-2">
        {s?.ok && (
          <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ background: color }} />
        )}
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
      </span>
      <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--muted)" }}>{text}</span>
    </span>
  );
}

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const [activeTag, setActiveTag] = useState("All");
  const [projectList, setProjectList] = useState<ProjectType[]>(defaultProjects);
  const [allTags, setAllTags] = useState<string[]>(ALL_DEFAULT_TAGS);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number; title: string } | null>(null);

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
    <>
    <section id="projects" className="py-16 sm:py-24" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

                {/* Image hero — wireframes / screenshots, click to open lightbox */}
                {project.images && project.images.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLightbox({ images: project.images!, index: 0, title: project.title })}
                    aria-label={`View ${project.title} ${project.images.length > 1 ? "gallery" : "image"}`}
                    className="relative w-full aspect-video overflow-hidden cursor-zoom-in"
                    style={{ background: "var(--surface-2)" }}
                  >
                    <Image
                      src={project.images[0]}
                      alt={`${project.title} preview`}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/25 opacity-0 hover:opacity-100 transition-all">
                      <Maximize2 size={20} className="text-white drop-shadow" />
                    </span>
                    {project.images.length > 1 && (
                      <span className="absolute bottom-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
                        1 / {project.images.length}
                      </span>
                    )}
                  </button>
                )}

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

                  {/* Links */}
                  <div className="flex items-center gap-4 flex-wrap">
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
                    ) : null}

                    {/* Live status — only for projects with a public link */}
                    {project.link && <StatusDot url={project.link} />}

                    {!project.link && !project.figma ? (
                      <span
                        className="inline-flex items-center gap-2 text-xs"
                        style={{ color: "var(--muted)" }}
                      >
                        <Server size={12} />
                        {project.type === "devops" ? "Internal TCS Project" : "Design Portfolio"}
                      </span>
                    ) : null}

                    {project.figma && (
                      <a
                        href={project.figma}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-90"
                        style={{ color: project.color }}
                      >
                        <FigmaIcon size={12} />
                        View in Figma
                      </a>
                    )}
                  </div>
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

    <ProjectLightbox data={lightbox} onClose={() => setLightbox(null)} reduced={reduced} />
    </>
  );
}

// ─── Fullscreen image gallery ────────────────────────────────────────────────
function ProjectLightbox({
  data,
  onClose,
  reduced,
}: {
  data: { images: string[]; index: number; title: string } | null;
  onClose: () => void;
  reduced: boolean;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => { if (data) setIndex(data.index); }, [data]);

  useEffect(() => {
    if (!data) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setIndex((i) => (i + 1) % data.images.length);
      else if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + data.images.length) % data.images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [data, onClose]);

  const many = (data?.images.length ?? 0) > 1;

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-sm"
        >
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close gallery"
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {many && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setIndex((i) => (i - 1 + data.images.length) % data.images.length); }}
                aria-label="Previous image"
                className="absolute left-3 sm:left-6 w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIndex((i) => (i + 1) % data.images.length); }}
                aria-label="Next image"
                className="absolute right-3 sm:right-6 w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          <motion.figure
            key={index}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full flex flex-col items-center gap-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.images[index]}
              alt={`${data.title} — ${index + 1} of ${data.images.length}`}
              className="max-h-[78vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
            />
            <figcaption className="text-xs text-white/70">
              {data.title}{many ? ` · ${index + 1} / ${data.images.length}` : ""}
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
