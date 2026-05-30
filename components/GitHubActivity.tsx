"use client";
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Upload, GitBranch, GitPullRequest, GitFork,
  CircleDot, Activity, ExternalLink,
} from "lucide-react";
import { EASE_OUT_EXPO, slideLeft } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type GHEvent = {
  id: string;
  type: string;
  repo: string;
  description: string;
  url: string;
  createdAt: string;
};

type FetchState = "loading" | "done" | "error";

const ICONS: Record<string, React.ReactNode> = {
  PushEvent:        <Upload size={14} />,
  CreateEvent:      <GitBranch size={14} />,
  PullRequestEvent: <GitPullRequest size={14} />,
  ForkEvent:        <GitFork size={14} />,
  IssuesEvent:      <CircleDot size={14} />,
};

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function GitHubActivity() {
  const [events, setEvents] = useState<GHEvent[]>([]);
  const [status, setStatus] = useState<FetchState>("loading");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    fetch("/api/github")
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((d) => {
        setEvents(d.events ?? []);
        setStatus("done");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <section
      id="activity"
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
          className="flex items-center gap-4 mb-4"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold">GitHub Activity</h2>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </motion.div>

        <motion.p
          initial={reduced ? {} : { opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5, ease: EASE_OUT_EXPO }}
          className="text-sm mb-10"
          style={{ color: "var(--muted)" }}
        >
          Recent public activity from{" "}
          <a
            href="https://github.com/Samstar7550"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--accent)] transition-colors"
          >
            @Samstar7550
          </a>
        </motion.p>

        {/* Skeleton */}
        {status === "loading" && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl border border-[var(--border)] animate-pulse"
                style={{ background: "var(--surface-2)" }}
              />
            ))}
          </div>
        )}

        {/* Error / empty state */}
        {(status === "error" || (status === "done" && events.length === 0)) && (
          <div
            className="flex items-center justify-center py-12 rounded-xl border border-[var(--border)] text-sm"
            style={{ color: "var(--muted)" }}
          >
            No public activity found.
          </div>
        )}

        {/* Event feed */}
        {status === "done" && events.length > 0 && (
          <div className="space-y-3">
            {events.map((ev, i) => (
              <motion.a
                key={ev.id}
                href={ev.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={reduced ? {} : { opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.06, duration: 0.4, ease: EASE_OUT_EXPO }}
                whileHover={reduced ? {} : { x: 4 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)] transition-all group cursor-pointer"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                    color: "var(--accent)",
                  }}
                >
                  {ICONS[ev.type] ?? <Activity size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate group-hover:text-[var(--accent)] transition-colors">
                    {ev.description}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>
                    {ev.repo}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    {timeAgo(ev.createdAt)}
                  </span>
                  <ExternalLink
                    size={12}
                    className="group-hover:text-[var(--accent)] transition-colors"
                    style={{ color: "var(--muted)" }}
                  />
                </div>
              </motion.a>
            ))}
          </div>
        )}

        {/* View all */}
        {status === "done" && events.length > 0 && (
          <motion.a
            href="https://github.com/Samstar7550"
            target="_blank"
            rel="noopener noreferrer"
            initial={reduced ? {} : { opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="inline-flex items-center gap-2 mt-6 text-sm hover:text-[var(--accent)] transition-colors"
            style={{ color: "var(--muted)" }}
          >
            View all activity on GitHub
            <ExternalLink size={13} />
          </motion.a>
        )}
      </div>
    </section>
  );
}
