import { NotFoundView } from "@/components/NotFoundView";

export const metadata = { title: "Page not found" };

export default function PublicNotFound() {
  return (
    <NotFoundView
      homeHref="/"
      homeLabel="Go to the homepage"
      variant="site"
      links={[
        { href: "/about", label: "About" },
        { href: "/classes", label: "Classes" },
        { href: "/gallery", label: "Gallery" },
        { href: "/news", label: "News & Events" },
        { href: "/contact", label: "Contact" },
      ]}
    />
  );
}
