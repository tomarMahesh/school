import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pages = await prisma.page.findMany({
    where: { published: true },
    select: { slug: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-black/10 dark:border-white/10">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold">
            School Portal
          </Link>
          <div className="flex gap-6 text-sm">
            {pages.map((page) => (
              <Link key={page.slug} href={`/${page.slug}`}>
                {page.title}
              </Link>
            ))}
            <Link href="/news">News &amp; Events</Link>
            <Link href="/portal/login">Staff/Student Login</Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        {children}
      </main>

      <footer className="border-t border-black/10 px-6 py-6 text-center text-sm opacity-60 dark:border-white/10">
        <Link href="/admin/login">Admin</Link>
      </footer>
    </div>
  );
}
