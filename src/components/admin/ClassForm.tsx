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
type ClassFormAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function ClassForm({
  action,
  initial,
  teachers,
  sections,
  academicYears,
  submitLabel,
}: {
  action: ClassFormAction;
  initial?: {
    name: string;
    teacherId: string | null;
    sectionId: string | null;
    academicYearId: string;
  };
  teachers: { id: string; name: string; designation: string }[];
  sections: { id: string; name: string }[];
  academicYears: { id: string; name: string }[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const defaultYear =
    initial?.academicYearId ?? academicYears.find((y) => y)?.id;

  return (
    <Card className="max-w-lg">
      <CardContent>
        <PersistentForm action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initial?.name}
              required
              placeholder="Grade 5A"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Academic Year</Label>
            <Select name="academicYearId" defaultValue={defaultYear}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    academicYears.find((y) => y.id === value)?.name ?? "Select"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((y) => (
                  <SelectItem key={y.id} value={y.id}>
                    {y.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Section</Label>
            <Select name="sectionId" defaultValue={initial?.sectionId ?? ""}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    sections.find((s) => s.id === value)?.name ?? "None"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Teacher</Label>
            <Select name="teacherId" defaultValue={initial?.teacherId ?? ""}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => {
                    const t = teachers.find((t) => t.id === value);
                    return t ? `${t.name} (${t.designation})` : "None";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.designation})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="mt-2 w-fit">
            {pending ? "Saving..." : submitLabel}
          </Button>
        </PersistentForm>
      </CardContent>
    </Card>
  );
}
