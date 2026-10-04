"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersistentForm } from "@/components/PersistentForm";

type ActionState = { error?: string };
type DistrictFormAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function DistrictForm({
  action,
  initial,
  states,
  submitLabel,
}: {
  action: DistrictFormAction;
  initial?: { name: string; stateId: string };
  states: { id: string; name: string }[];
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
              placeholder="Lucknow"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>State</Label>
            <Select name="stateId" defaultValue={initial?.stateId ?? states[0]?.id}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => states.find((s) => s.id === value)?.name ?? "Select"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {states.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {states.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Add a state first under Admin → States.
              </p>
            )}
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
