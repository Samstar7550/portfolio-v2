"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ViewCounter } from "@/components/ViewCounter";
import { DEFAULT_PROFILE } from "@/lib/content";

export default function Footer() {
  const [name, setName] = useState(DEFAULT_PROFILE.name);

  useEffect(() => {
    fetch("/api/content?type=profile")
      .then(r => r.json())
      .then(d => { if (d.data?.name) setName(d.data.name); })
      .catch(() => {});
  }, []);

  const initials = name
    .split(" ")
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <footer
      className="border-t border-[var(--border)] py-8 px-4"
      style={{ background: "var(--surface-2)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white font-heading"
            style={{ background: "var(--accent)" }}
          >
            {initials}
          </div>
          <span className="text-sm font-medium">{name}</span>
          <Link
            href="/admin"
            className="text-[10px] opacity-20 hover:opacity-70 transition-opacity duration-300 select-none"
            style={{ color: "var(--muted)" }}
            aria-label="Admin"
          >
            ⚙
          </Link>
        </div>

        <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
          Built with Next.js · Tailwind CSS · Framer Motion
        </p>

        <div className="flex items-center gap-3">
          <ViewCounter />
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            © {new Date().getFullYear()} {name}
          </p>
        </div>
      </div>
    </footer>
  );
}
