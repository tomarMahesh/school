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

      <section className="bg-[#f7f5ef] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-[#0f3d63] sm:text-3xl">
            Why Choose SBMSIC
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center opacity-70">
            A well-rounded education built on strong values, dedicated
            teachers, and a supportive learning environment.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Experienced Faculty",
                desc: "Qualified, dedicated teachers committed to every student's growth.",
                icon: "M12 2 1 8l11 6 9-4.91V17h2V8L12 2Zm0 13.6L4 11.2V16c0 2.21 3.58 4 8 4s8-1.79 8-4v-4.8l-8 4.4Z",
              },
              {
                title: "Modern Infrastructure",
                desc: "Smart classrooms and well-equipped labs built for hands-on learning.",
                icon: "M4 21V9l8-6 8 6v12h-6v-7h-4v7H4Z",
              },
              {
                title: "Safe & Secure Campus",
                desc: "A secure, supervised environment where students can thrive.",
                icon: "M12 2 4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5l-8-3Z",
              },
              {
                title: "Strong Academic Record",
                desc: "A consistent track record of excellent board results year after year.",
                icon: "M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm2 4v2h10V7H7Zm0 4v2h10v-2H7Zm0 4v2h7v-2H7Z",
              },
              {
                title: "Sports & Activities",
                desc: "A wide range of sports and extracurriculars for holistic growth.",
                icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 3.06A7.002 7.002 0 0 1 18.94 11H13V5.06ZM11 5.06V11H5.06A7.002 7.002 0 0 1 11 5.06ZM5.06 13H11v5.94A7.002 7.002 0 0 1 5.06 13Zm7.94 5.94V13h5.94A7.002 7.002 0 0 1 13 18.94Z",
              },
              {
                title: "Individual Attention",
                desc: "A healthy student-teacher ratio so every child is seen and supported.",
                icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05C16.24 13.9 17 15.02 17 16.5V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z",
              },
            ].map((reason) => (
              <div
                key={reason.title}
                className="rounded-lg bg-white p-6 shadow-sm"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-9 w-9 text-[#d4a017]"
                  fill="currentColor"
                >
                  <path d={reason.icon} />
                </svg>
                <h3 className="mt-4 font-semibold text-[#0f3d63]">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm opacity-70">{reason.desc}</p>
              </div>
            ))}
          </div>
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
