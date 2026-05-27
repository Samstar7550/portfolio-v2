"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, Server, Globe } from "lucide-react";
import { FigmaIcon } from "@/components/BrandIcons";

const projects = [
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

function ProjectIcon({ type, color }: { type: string; color: string }) {
  const iconStyle = { color };
  if (type === "design") return <FigmaIcon size={16} style={iconStyle} />;
  if (type === "devops") return <Server size={16} style={iconStyle} />;
  return <Globe size={16} style={iconStyle} />;
}

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="projects" className="py-24 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">Projects</h2>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {projects.map((project, i) => {
              return (
                <motion.div
                  key={project.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden transition-all hover:border-[var(--accent)] hover:shadow-xl"
                >
                  {/* Top accent bar */}
                  <div
                    className="h-1 w-full opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{ background: project.color }}
                  />

                  {/* Glow */}
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
                          <ProjectIcon type={project.type} color={project.color} />
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
                        <span
                          key={t}
                          className="text-xs px-2.5 py-0.5 rounded-full border border-[var(--border)]"
                          style={{ color: "var(--muted)" }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Link */}
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-medium transition-colors hover:opacity-80"
                        style={{ color: project.color }}
                      >
                        <ExternalLink size={12} />
                        {project.linkLabel}
                      </a>
                    )}
                    {!project.link && (
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
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
