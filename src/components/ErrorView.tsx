"use client";

import Link from "next/link";

const STYLES = {
  site: {
    title: "text-[#0f3d63]",
    primary: "bg-[#0f3d63] text-white hover:opacity-90",
    secondary: "border border-[#0f3d63]/30 text-[#0f3d63] hover:bg-[#0f3d63]/5",
  },
  app: {
    title: "",
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "border hover:bg-muted",
  },
} as const;

// Friendly "something went wrong" screen for Next.js error boundaries. The
// reference code is the server-side error digest, so whoever reports a problem
// can quote it and it can be found in the logs.
export function ErrorView({
  error,
  retry,
  homeHref,
  homeLabel,
  variant,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  homeHref: string;
  homeLabel: string;
  variant: keyof typeof STYLES;
}) {
  const s = STYLES[variant];
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
      <p className="text-5xl font-bold opacity-30">Oops</p>
      <h1 className={`text-2xl font-semibold ${s.title}`}>Something went wrong</h1>
      <p className="text-sm opacity-70">
        We hit an unexpected problem. Please try again, and if it keeps happening, come back a
        little later or contact the school office.
      </p>
      {error.digest && (
        <p className="rounded bg-black/5 px-3 py-1 font-mono text-xs opacity-70">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className={`rounded px-5 py-2 text-sm font-medium ${s.primary}`}
        >
          Try again
        </button>
        <Link href={homeHref} className={`rounded px-5 py-2 text-sm font-medium ${s.secondary}`}>
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
