"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PersistentForm } from "@/components/PersistentForm";
import { savePageContent } from "@/lib/actions/pageContent";

export function ContentForm({
  pageKey,
  children,
}: {
  pageKey: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(
    savePageContent.bind(null, pageKey),
    {},
  );

  useEffect(() => {
    if (state.success) toast.success("Page content saved.");
  }, [state]);

  return (
    <PersistentForm action={formAction} className="flex max-w-3xl flex-col gap-6">
      {children}
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Save Changes"}
      </Button>
    </PersistentForm>
  );
}
