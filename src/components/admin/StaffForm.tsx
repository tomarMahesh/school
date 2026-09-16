"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
type StaffFormAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

const ROLE_LABELS: Record<string, string> = {
  TEACHER: "Teacher",
  PRINCIPAL: "Principal",
  STAFF: "Staff (non-teaching)",
};

export function StaffForm({
  action,
  initial,
  subjects,
  submitLabel,
}: {
  action: StaffFormAction;
  initial?: {
    name: string;
    email: string;
    role: "TEACHER" | "PRINCIPAL" | "STAFF";
    designation: string;
    qualification: string | null;
    education: string | null;
    aadharNumber: string | null;
    subjectIds: string[];
    phone: string | null;
    address: string | null;
  };
  subjects: { id: string; name: string }[];
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
            <Label>Portal Role</Label>
            <Select name="role" defaultValue={initial?.role ?? "TEACHER"}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => ROLE_LABELS[value] ?? value}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="PRINCIPAL">Principal</SelectItem>
                <SelectItem value="STAFF">Staff (non-teaching)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              name="designation"
              defaultValue={initial?.designation}
              required
              placeholder="Mathematics Teacher, Principal, Peon, Accountant..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Subjects taught (if any)</Label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {subjects.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    name="subjectIds"
                    value={s.id}
                    defaultChecked={initial?.subjectIds.includes(s.id)}
                  />
                  {s.name}
                </label>
              ))}
              {subjects.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  No subjects defined yet — add some under Admin → Subjects.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="qualification">Qualification</Label>
            <Input
              id="qualification"
              name="qualification"
              defaultValue={initial?.qualification ?? ""}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="education">Education</Label>
            <Input id="education" name="education" defaultValue={initial?.education ?? ""} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="aadharNumber">
              Aadhar Number{" "}
              <span className="font-normal text-muted-foreground">
                (optional, 12 digits, kept private)
              </span>
            </Label>
            <Input
              id="aadharNumber"
              name="aadharNumber"
              defaultValue={initial?.aadharNumber ?? ""}
              pattern="\d{12}"
              maxLength={12}
              placeholder="123412341234"
              className="font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={initial?.phone ?? ""} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" defaultValue={initial?.address ?? ""} rows={3} />
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
