import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getContent } from "@/lib/redis-content";
import type { Post } from "@/lib/content";
import ShareButtons from "@/components/ShareButtons";

export const revalidate = 60;

function readingTime(body: string): number {
  return Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 200));
}

async function getPost(slug: string): Promise<Post | null> {
  const all = await getContent<Post[]>("blog");
  const post = (Array.isArray(all) ? all : []).find(p => p.slug === slug && p.published);
  return post ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Post not found — Samuvel L" };
  return {
    title: `${post.title} — Samuvel L`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      // opengraph-image.tsx handles the generated card; cover used as fallback
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
  };
}

function fmtDate(d: string): string {
  const date = new Date(d);
  return isNaN(date.getTime())
    ? d
    : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen py-16 sm:py-24">
      <article className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm mb-10 transition-colors hover:text-[var(--accent)]"
          style={{ color: "var(--muted)" }}
        >
          <ArrowLeft size={14} /> All posts
        </Link>

        <div className="flex items-center gap-2 text-xs mb-3 flex-wrap" style={{ color: "var(--muted)" }}>
          <CalendarDays size={13} />
          {fmtDate(post.date)}
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {readingTime(post.body)} min read
          </span>
          {post.tags?.map(t => (
            <Link
              key={t}
              href={`/blog?tag=${encodeURIComponent(t)}`}
              className="px-2 py-0.5 rounded-full transition-opacity hover:opacity-80"
              style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}
            >
              {t}
            </Link>
          ))}
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-8 leading-tight">{post.title}</h1>

        <div className="blog-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
        </div>

        <ShareButtons slug={post.slug} title={post.title} />
      </article>
    </main>
  );
}
