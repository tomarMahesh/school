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
import { createExam } from "@/lib/actions/exams";

export function CreateExamForm({
  classes,
}: {
  classes: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createExam, {});
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <Card className="max-w-lg">
      <CardContent>
        <PersistentForm action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Exam Name</Label>
            <Input id="name" name="name" required placeholder="Mid-Term Examination" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="term">Term</Label>
            <Input id="term" name="term" required placeholder="Term 1" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Class</Label>
            <Select name="classId" defaultValue={classes[0]?.id}>
              <SelectTrigger className="w-full">
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
            <Label htmlFor="examDate">Exam Date (optional)</Label>
            <Input id="examDate" name="examDate" type="date" min={todayIso} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? "Creating..." : "Create Exam"}
          </Button>
        </PersistentForm>
      </CardContent>
    </Card>
  );
}
