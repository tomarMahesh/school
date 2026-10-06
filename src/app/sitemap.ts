import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";

// Reads the database, so it is built per request, never at build time.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [posts, pages] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.page.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const fixed = ["", "/about", "/classes", "/gallery", "/news", "/contact", "/privacy-policy"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  return [
    ...fixed,
    ...posts.map((p) => ({ url: `${base}/news/${p.slug}`, lastModified: p.updatedAt })),
    ...pages.map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
