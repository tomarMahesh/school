"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/ErrorView";

export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <ErrorView error={error} retry={retry} homeHref="/" homeLabel="Go to the homepage" variant="site" />
    </main>
  );
}
