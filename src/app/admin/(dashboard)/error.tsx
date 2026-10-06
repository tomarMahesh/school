"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/ErrorView";

export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorView error={error} retry={retry} homeHref="/admin" homeLabel="Back to the dashboard" variant="app" />;
}
