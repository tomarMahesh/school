"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PersistentForm } from "@/components/PersistentForm";

type ActionState = { error?: string };
type NameFormAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function NameForm({
  action,
  initial,
  placeholder,
  submitLabel,
}: {
  action: NameFormAction;
  initial?: { name: string };
  placeholder?: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Card className="max-w-sm">
      <CardContent>
        <PersistentForm action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initial?.name}
              required
              placeholder={placeholder}
            />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? "Saving..." : submitLabel}
          </Button>
        </PersistentForm>
      </CardContent>
    </Card>
  );
}
