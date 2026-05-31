"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

function LinkedInIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function ShareButtons({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://www.samuvel.in/blog/${slug}`;

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); } catch { /* fallback silently */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const xUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

  const btn = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer";

  return (
    <div className="flex items-center gap-3 pt-8 mt-8 border-t border-[var(--border)] flex-wrap">
      <span className="text-sm" style={{ color: "var(--muted)" }}>Share</span>

      <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" className={btn} style={{ color: "var(--muted)" }}>
        <LinkedInIcon size={13} /> LinkedIn
      </a>

      <a href={xUrl} target="_blank" rel="noopener noreferrer" className={btn} style={{ color: "var(--muted)" }}>
        <XIcon size={13} /> X / Twitter
      </a>

      <button onClick={copyLink} className={btn} style={{ color: copied ? "#22c55e" : "var(--muted)", borderColor: copied ? "#22c55e" : undefined }}>
        {copied ? <Check size={13} /> : <Link2 size={13} />}
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
