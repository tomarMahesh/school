import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function NewsListPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">News &amp; Events</h1>

      <ul className="mt-8 flex flex-col gap-6">
        {posts.map((post) => (
          <li
            key={post.id}
            className="border-b border-black/5 pb-6 dark:border-white/5"
          >
            <p className="text-xs uppercase tracking-wide opacity-50">
              {post.category}
              {post.publishedAt &&
                ` · ${post.publishedAt.toLocaleDateString()}`}
            </p>
            <Link
              href={`/news/${post.slug}`}
              className="mt-1 block text-lg font-medium underline"
            >
              {post.title}
            </Link>
          </li>
        ))}
        {posts.length === 0 && (
          <p className="opacity-60">No news posted yet.</p>
        )}
      </ul>
    </div>
  );
}
