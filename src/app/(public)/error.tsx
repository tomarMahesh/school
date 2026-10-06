"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/ErrorView";

export default function PublicError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorView error={error} retry={retry} homeHref="/" homeLabel="Go to the homepage" variant="site" />;
}
