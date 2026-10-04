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
import { addExamSubject } from "@/lib/actions/exams";

export function ExamSubjectForm({
  examId,
  subjects,
}: {
  examId: string;
  subjects: { id: string; name: string }[];
}) {
  const action = addExamSubject.bind(null, examId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <PersistentForm action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>Subject</Label>
        <Select name="subjectId" defaultValue={subjects[0]?.id}>
          <SelectTrigger className="w-48">
            <SelectValue>
              {(value: string) => subjects.find((s) => s.id === value)?.name ?? "Select"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="maxMarks">Max Marks</Label>
        <Input
          id="maxMarks"
          name="maxMarks"
          type="number"
          step="0.1"
          defaultValue={100}
          className="w-28"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add Subject"}
      </Button>
      {state.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </PersistentForm>
  );
}
