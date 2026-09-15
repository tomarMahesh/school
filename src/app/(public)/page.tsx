import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SchoolLogo } from "@/components/site/SchoolLogo";
import { NoticeMarquee } from "@/components/site/NoticeMarquee";
import { HeroSlider } from "@/components/site/HeroSlider";

const SCHOOL_NAME = "Shri Brijmohan Sharma Ismarak Inter College";

export default async function HomePage() {
  const recentPosts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 8,
  });
  const posts = recentPosts.slice(0, 3);

  const noticeText =
    recentPosts.length > 0
      ? recentPosts.map((p) => p.title)
      : ["Welcome to our school website — check back here for the latest notices."];

  return (
    <div>
      <section className="relative flex min-h-[560px] flex-col items-center justify-center gap-6 px-6 py-24 text-center text-white">
        <HeroSlider />

        <div className="relative z-20 flex flex-col items-center gap-6">
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
        </div>
      </section>

      <NoticeMarquee notices={noticeText} />

      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-2 sm:items-center">
        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-lg bg-gradient-to-br from-[#0f3d63]/10 to-[#d4a017]/10 text-[#0f3d63]/40">
          <svg viewBox="0 0 24 24" className="h-14 w-14" fill="currentColor">
            <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Zm-11-5 2.5 3.01L16 13l4 5H4Z" />
          </svg>
          <span className="text-sm">School photo placeholder</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0f3d63] sm:text-3xl">
            Welcome to SBMSIC
          </h2>
          <p className="mt-4 opacity-80">
            We are delighted to welcome you to {SCHOOL_NAME}. For generations,
            our school has been a place where students discover their
            potential, build lasting friendships, and prepare for a bright
            future. Whether you&apos;re a prospective parent, a current
            student, or a member of our alumni family, we invite you to
            explore all that our school community has to offer.
          </p>
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
