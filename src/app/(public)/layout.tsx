import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { SiteNav } from "@/components/site/SiteNav";
import { FloatingActions } from "@/components/site/FloatingActions";
import { SchoolLogo } from "@/components/site/SchoolLogo";

// Every public page reads the database (settings, CMS content, news), so render
// per request: the build must not need a database, and edits must show at once.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { schoolName } = await getSiteSettings();
  return {
    title: { default: schoolName, template: `%s | ${schoolName}` },
    description: `Official website of ${schoolName}: about the school, classes, gallery, news and contact details.`,
    openGraph: { siteName: schoolName, type: "website", locale: "en_IN" },
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pages, settings] = await Promise.all([
    prisma.page.findMany({
      where: { published: true },
      select: { slug: true, title: true },
      orderBy: { title: "asc" },
    }),
    getSiteSettings(),
  ]);
  const SCHOOL_NAME = settings.schoolName;

  return (
    <div className="flex min-h-full flex-col bg-white text-[#0f3d63]">
      <SiteNav schoolName={SCHOOL_NAME} logoUrl={settings.logoUrl} />
      <FloatingActions />

      <main className="flex-1 pt-20">{children}</main>

      <footer className="bg-[#0f3d63] px-6 py-10 text-white">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <SchoolLogo className="h-8 w-8" src={settings.logoUrl} />
              <span className="font-semibold">{SCHOOL_NAME}</span>
            </div>
            <p className="mt-3 text-sm text-white/70">
              Committed to academic excellence and holistic student growth.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-white/70">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/classes">Classes</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/news">News &amp; Events</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              {pages.map((page) => (
                <li key={page.slug}>
                  <Link href={`/${page.slug}`}>{page.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Portal</h4>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-white/70">
              <li><Link href="/portal/login">Staff/Student Login</Link></li>
              <li><Link href="/admin/login">Admin</Link></li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-5xl border-t border-white/10 pt-6 text-xs text-white/50">
          © {new Date().getFullYear()} {SCHOOL_NAME}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
