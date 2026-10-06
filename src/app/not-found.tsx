import { NotFoundView } from "@/components/NotFoundView";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <NotFoundView homeHref="/" homeLabel="Go to the homepage" variant="site" />
    </main>
  );
}
