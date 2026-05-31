import { ImageResponse } from "next/og";
import { getContent } from "@/lib/redis-content";
import type { Post } from "@/lib/content";

export const alt = "Blog post by Samuvel L";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function getPost(slug: string): Promise<Post | null> {
  const all = await getContent<Post[]>("blog");
  return (Array.isArray(all) ? all : []).find(p => p.slug === slug && p.published) ?? null;
}

export default async function OGImage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          background: "#080A10",
          display: "flex", flexDirection: "column",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          color: "white",
          position: "relative",
        }}
      >
        {/* Accent glow top-right */}
        <div style={{
          position: "absolute", top: -140, right: -140,
          width: 520, height: 520, borderRadius: "50%",
          background: "radial-gradient(circle, #00C8D7, transparent 70%)",
          opacity: 0.15, display: "flex",
        }} />
        {/* Subtle glow bottom-left */}
        <div style={{
          position: "absolute", bottom: -100, left: -80,
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, #0F64D2, transparent 70%)",
          opacity: 0.12, display: "flex",
        }} />

        {/* Tags */}
        {post?.tags && post.tags.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
            {post.tags.slice(0, 3).map(tag => (
              <div key={tag} style={{
                fontSize: 14, color: "#00C8D7",
                border: "1px solid rgba(0,200,215,0.4)",
                padding: "4px 14px", borderRadius: 100, display: "flex",
              }}>
                {tag}
              </div>
            ))}
          </div>
        )}

        {/* Title */}
        <div style={{
          fontSize: post && post.title.length > 55 ? 42 : 54,
          fontWeight: 700, lineHeight: 1.2,
          letterSpacing: "-0.02em",
          flex: 1, display: "flex", alignItems: "flex-start",
          maxWidth: "90%",
        }}>
          {post?.title ?? "Blog Post"}
        </div>

        {/* Excerpt */}
        {post?.excerpt && (
          <div style={{
            fontSize: 18, color: "#777", lineHeight: 1.5,
            marginBottom: 36, display: "flex", maxWidth: "80%",
          }}>
            {post.excerpt.length > 110 ? post.excerpt.slice(0, 110) + "…" : post.excerpt}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 14,
            background: "#00C8D7", color: "#080A10",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em",
          }}>
            SL
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Samuvel L</div>
            <div style={{ fontSize: 14, color: "#555" }}>DevOps Engineer</div>
          </div>
          <div style={{ flex: 1, display: "flex" }} />
          <div style={{ fontSize: 15, color: "#444", display: "flex" }}>www.samuvel.in</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
