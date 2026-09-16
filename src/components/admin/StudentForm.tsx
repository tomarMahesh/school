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

type ActionState = { error?: string };
type StudentFormAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function StudentForm({
  action,
  initial,
  classes,
  submitLabel,
}: {
  action: StudentFormAction;
  initial?: { name: string; email: string; classId: string | null };
  classes: { id: string; name: string }[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isEdit = Boolean(initial);

  return (
    <Card className="max-w-lg">
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={initial?.name} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={initial?.email}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">
              {isEdit ? "New Password (leave blank to keep current)" : "Password"}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required={!isEdit}
              minLength={8}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Class</Label>
            <Select name="classId" defaultValue={initial?.classId ?? ""}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    classes.find((c) => c.id === value)?.name ?? "Unassigned"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="mt-2 w-fit">
            {pending ? "Saving..." : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
