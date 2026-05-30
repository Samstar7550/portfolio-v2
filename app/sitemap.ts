import type { MetadataRoute } from "next";
import { getContent } from "@/lib/redis-content";
import type { Post } from "@/lib/content";

const BASE = "https://www.samuvel.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const all = await getContent<Post[]>("blog").catch(() => [] as Post[]);
  const posts = (Array.isArray(all) ? all : []).filter((p) => p.published);

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    ...posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
