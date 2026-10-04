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
import { recordPayment } from "@/lib/actions/fees";

export function PaymentForm({
  students,
}: {
  students: { id: string; name: string; className: string | null }[];
}) {
  const [state, formAction, pending] = useActionState(recordPayment, {});

  return (
    <PersistentForm action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>Student</Label>
        <Select name="studentId">
          <SelectTrigger className="w-48">
            <SelectValue>
              {(value: string) => {
                const s = students.find((s) => s.id === value);
                return s ? `${s.name}${s.className ? ` (${s.className})` : ""}` : "Select";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
                {s.className ? ` (${s.className})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="term">Term</Label>
        <Input id="term" name="term" required placeholder="Term 1" className="w-28" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" type="number" step="0.01" required className="w-28" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="method">Method</Label>
        <Input id="method" name="method" placeholder="Cash" className="w-28" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="note">Note</Label>
        <Input id="note" name="note" className="w-40" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Recording..." : "Record Payment"}
      </Button>
      {state.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </PersistentForm>
  );
}
