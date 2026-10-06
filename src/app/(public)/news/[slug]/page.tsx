import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(props: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const item = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, published: true },
  });
  return { title: item?.published ? item.title : "Post not found" };
}

export default async function NewsDetailPage(
  props: PageProps<"/news/[slug]">,
) {
  const { slug } = await props.params;

  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.published) notFound();

  return (
    <article>
      <Link href="/news" className="text-sm underline">
        ← Back to News &amp; Events
      </Link>

      <p className="mt-6 text-xs uppercase tracking-wide opacity-50">
        {post.category}
        {post.publishedAt && ` · ${post.publishedAt.toLocaleDateString()}`}
      </p>
      <h1 className="mt-1 text-3xl font-bold">{post.title}</h1>
      <div className="mt-6 whitespace-pre-wrap leading-relaxed">
        {post.content}
      </div>
    </article>
  );
}
