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
import { PersistentForm } from "@/components/PersistentForm";
import { ResendSetupEmailButton } from "@/components/admin/ResendSetupEmailButton";

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
  portalRoles,
  qualifications,
  submitLabel,
}: {
  action: StaffFormAction;
  initial?: {
    userId: string;
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
  portalRoles: { id: string; name: string }[];
  qualifications: { id: string; name: string }[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isEdit = Boolean(initial);

  return (
    <Card className="max-w-lg">
      <CardContent>
        {isEdit && initial && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-input bg-muted/30 p-3">
            <p className="text-sm text-muted-foreground">
              Staff set their own password via an emailed link.
            </p>
            <ResendSetupEmailButton userId={initial.userId} />
          </div>
        )}
        <PersistentForm action={formAction} className="flex flex-col gap-4">
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
            <Label>Designation</Label>
            <Select
              name="designation"
              defaultValue={initial?.designation ?? portalRoles[0]?.name ?? ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue>{(value: string) => value || "Select"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {portalRoles.map((r) => (
                  <SelectItem key={r.id} value={r.name}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {portalRoles.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Add a portal role first under Admin → Portal Roles.
              </p>
            )}
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
            <Label>Qualification</Label>
            <Select name="qualification" defaultValue={initial?.qualification ?? ""}>
              <SelectTrigger className="w-full">
                <SelectValue>{(value: string) => value || "None"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {qualifications.map((q) => (
                  <SelectItem key={q.id} value={q.name}>
                    {q.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </PersistentForm>
      </CardContent>
    </Card>
  );
}
