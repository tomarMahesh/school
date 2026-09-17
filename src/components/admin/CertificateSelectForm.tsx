"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPES = [
  { value: "BONAFIDE", label: "Bonafide Certificate" },
  { value: "TRANSFER", label: "Transfer Certificate" },
  { value: "CHARACTER", label: "Character Certificate" },
  { value: "HALL_TICKET", label: "Exam Hall Ticket" },
];

export function CertificateSelectForm({
  students,
}: {
  students: { id: string; name: string; className: string | null }[];
}) {
  return (
    <form action="/admin/certificates/view" method="get" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Student</Label>
        <Select name="studentId" defaultValue={students[0]?.id}>
          <SelectTrigger className="w-full">
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
        <Label>Certificate Type</Label>
        <Select name="type" defaultValue="BONAFIDE">
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) => TYPES.find((t) => t.value === value)?.label ?? "Select"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="term">
          Term{" "}
          <span className="font-normal text-muted-foreground">
            (only needed for Hall Ticket fee check)
          </span>
        </Label>
        <Input id="term" name="term" placeholder="Term 1" />
      </div>

      <Button type="submit" className="w-fit">
        Generate
      </Button>
    </form>
  );
}
