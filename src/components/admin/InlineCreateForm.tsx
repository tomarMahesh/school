"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PersistentForm } from "@/components/PersistentForm";

type ActionState = { error?: string };
type CreateAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function InlineCreateForm({
  action,
  submitLabel,
  children,
}: {
  action: CreateAction;
  submitLabel: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Card>
      <CardContent>
        <PersistentForm action={formAction} className="flex flex-wrap items-end gap-3">
          {children}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : submitLabel}
          </Button>
          {state.error && (
            <p className="w-full text-sm text-destructive">{state.error}</p>
          )}
        </PersistentForm>
      </CardContent>
    </Card>
  );
}
