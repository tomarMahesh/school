import Link from "next/link";

const STYLES = {
  site: {
    big: "text-[#d4a017]",
    title: "text-[#0f3d63]",
    primary: "bg-[#0f3d63] text-white hover:opacity-90",
    link: "text-[#0f3d63]",
  },
  app: {
    big: "text-primary",
    title: "",
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    link: "",
  },
} as const;

export function NotFoundView({
  homeHref,
  homeLabel,
  variant,
  links = [],
}: {
  homeHref: string;
  homeLabel: string;
  variant: keyof typeof STYLES;
  links?: { href: string; label: string }[];
}) {
  const s = STYLES[variant];
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
      <p className={`text-7xl font-bold ${s.big}`}>404</p>
      <h1 className={`text-2xl font-semibold ${s.title}`}>Page not found</h1>
      <p className="text-sm opacity-70">
        The page you&apos;re looking for doesn&apos;t exist, or it may have moved.
      </p>
      <Link href={homeHref} className={`mt-2 rounded px-5 py-2 text-sm font-medium ${s.primary}`}>
        {homeLabel}
      </Link>
      {links.length > 0 && (
        <p className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`underline ${s.link}`}>
              {l.label}
            </Link>
          ))}
        </p>
      )}
    </div>
  );
}
