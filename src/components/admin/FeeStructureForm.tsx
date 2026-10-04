"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersistentForm } from "@/components/PersistentForm";
import { setFeeStructure } from "@/lib/actions/fees";

export function FeeStructureForm({
  classes,
}: {
  classes: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(setFeeStructure, {});

  return (
    <PersistentForm action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>Class</Label>
        <Select name="classId" defaultValue={classes[0]?.id}>
          <SelectTrigger className="w-40">
            <SelectValue>
              {(value: string) => classes.find((c) => c.id === value)?.name ?? "Select"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="term">Term</Label>
        <Input id="term" name="term" required placeholder="Term 1" className="w-32" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" type="number" step="0.01" required className="w-32" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Set Fee"}
      </Button>
      {state.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </PersistentForm>
  );
}
