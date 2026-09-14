import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome to School Portal</h1>
      <p className="mt-3 max-w-xl opacity-70">
        Find the latest school news and events below, or use the menu to
        explore our pages.
      </p>

      <h2 className="mt-12 text-xl font-semibold">Latest News &amp; Events</h2>
      <ul className="mt-4 flex flex-col gap-4">
        {posts.map((post) => (
          <li
            key={post.id}
            className="border-b border-black/5 pb-4 dark:border-white/5"
          >
            <Link href={`/news/${post.slug}`} className="font-medium underline">
              {post.title}
            </Link>
            <p className="mt-1 text-xs uppercase tracking-wide opacity-50">
              {post.category}
              {post.publishedAt &&
                ` · ${post.publishedAt.toLocaleDateString()}`}
            </p>
          </li>
        ))}
        {posts.length === 0 && (
          <p className="opacity-60">No news posted yet.</p>
        )}
      </ul>

      {posts.length > 0 && (
        <Link href="/news" className="mt-6 inline-block text-sm underline">
          View all news &amp; events →
        </Link>
      )}
    </div>
  );
}
