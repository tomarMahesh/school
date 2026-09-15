import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SchoolLogo } from "@/components/site/SchoolLogo";

const SCHOOL_NAME = "Shri Brijmohan Sharma Ismarak Inter College";

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <div>
      <section className="flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#0f3d63] to-[#154f80] px-6 py-24 text-center text-white">
        <SchoolLogo className="h-24 w-24" />
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
          {SCHOOL_NAME}
        </h1>
        <p className="max-w-xl text-white/80">
          Nurturing curiosity, character, and confidence — building the
          foundation for every student&apos;s future.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="rounded bg-[#d4a017] px-6 py-3 text-sm font-semibold text-[#0f3d63]"
          >
            Apply Now
          </Link>
          <Link
            href="/about"
            className="rounded border border-white/40 px-6 py-3 text-sm font-semibold"
          >
            Explore School
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold">Latest News &amp; Events</h2>
        <ul className="mt-8 flex flex-col gap-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="border-b border-black/5 pb-4"
            >
              <Link href={`/news/${post.slug}`} className="font-medium underline">
                {post.title}
              </Link>
              <p className="mt-1 text-xs uppercase tracking-wide opacity-50">
                {post.category}
                {post.publishedAt && ` · ${post.publishedAt.toLocaleDateString()}`}
              </p>
            </li>
          ))}
          {posts.length === 0 && (
            <p className="text-center opacity-60">No news posted yet.</p>
          )}
        </ul>
        {posts.length > 0 && (
          <div className="mt-6 text-center">
            <Link href="/news" className="text-sm underline">
              View all news &amp; events →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
