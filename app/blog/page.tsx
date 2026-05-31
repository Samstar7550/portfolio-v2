import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Clock } from "lucide-react";
import { getContent } from "@/lib/redis-content";
import type { Post } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog — Samuvel L",
  description: "Notes on DevOps, cloud, CI/CD, and design by Samuvel L.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 60;

function fmtDate(d: string): string {
  const date = new Date(d);
  return isNaN(date.getTime())
    ? d
    : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function readingTime(body: string): number {
  return Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 200));
}

export default async function BlogIndex({ searchParams }: { searchParams: { tag?: string } }) {
  const activeTag = searchParams.tag ?? null;

  const all = await getContent<Post[]>("blog");
  const published = (Array.isArray(all) ? all : [])
    .filter(p => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const allTags = Array.from(new Set(published.flatMap(p => p.tags ?? []))).sort();
  const posts = activeTag ? published.filter(p => p.tags?.includes(activeTag)) : published;

  const tagLink = (t: string | null) =>
    t ? `/blog?tag=${encodeURIComponent(t)}` : "/blog";

  return (
    <main className="min-h-screen py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm mb-10 transition-colors hover:text-[var(--accent)]"
          style={{ color: "var(--muted)" }}
        >
          <ArrowLeft size={14} /> Back to portfolio
        </Link>

        <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-3">Blog</h1>
        <p className="text-base mb-8" style={{ color: "var(--muted)" }}>
          Notes on DevOps, cloud, CI/CD, and design.
        </p>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {(["All", ...allTags] as string[]).map(tag => {
              const t = tag === "All" ? null : tag;
              const active = t === activeTag;
              return (
                <Link
                  key={tag}
                  href={tagLink(t)}
                  className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                  style={{
                    borderColor: active ? "var(--accent)" : "var(--border)",
                    color: active ? "var(--accent)" : "var(--muted)",
                    background: active
                      ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                      : "transparent",
                  }}
                >
                  {tag}
                </Link>
              );
            })}
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-sm py-16 text-center" style={{ color: "var(--muted)" }}>
            {activeTag ? `No posts tagged "${activeTag}".` : "No posts yet — check back soon."}
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map(p => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group block rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 transition-all hover:border-[var(--accent)] hover:shadow-lg"
              >
                <div className="flex items-center gap-2 text-xs mb-2 flex-wrap" style={{ color: "var(--muted)" }}>
                  <CalendarDays size={13} />
                  {fmtDate(p.date)}
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {readingTime(p.body)} min read
                  </span>
                  {p.tags?.slice(0, 3).map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full" style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}>{t}</span>
                  ))}
                </div>
                <h2 className="font-heading text-xl font-bold mb-1.5 group-hover:text-[var(--accent)] transition-colors">
                  {p.title}
                </h2>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--muted)" }}>{p.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--accent)" }}>
                  Read more <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
