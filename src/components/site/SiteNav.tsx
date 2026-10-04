"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SchoolLogo } from "./SchoolLogo";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/classes", label: "Classes" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export function SiteNav({
  schoolName,
  logoUrl,
}: {
  schoolName: string;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <SchoolLogo className="h-10 w-10" src={logoUrl} />
          <span className="text-sm font-bold leading-tight text-[#0f3d63] sm:text-base">
            {schoolName}
          </span>
        </Link>

        <nav className="hidden gap-6 text-sm font-medium text-[#0f3d63] md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "border-b-2 border-[#d4a017] pb-1"
                  : "border-b-2 border-transparent pb-1 hover:border-[#d4a017]/50"
              }
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/portal/login"
            className="rounded bg-[#0f3d63] px-4 py-1.5 text-white"
          >
            Staff/Student Login
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          className="text-[#0f3d63] md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-black/10 bg-white px-4 py-3 text-sm font-medium text-[#0f3d63] md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-2"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/portal/login" className="py-2">
            Staff/Student Login
          </Link>
        </nav>
      )}
    </header>
  );
}
