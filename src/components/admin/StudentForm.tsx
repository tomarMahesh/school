"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
type StudentFormAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

const GENDER_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

export function StudentForm({
  action,
  initial,
  classes,
  academicYears,
  streams,
  subjects,
  states,
  districts,
  pincodes,
  submitLabel,
}: {
  action: StudentFormAction;
  initial?: {
    userId: string;
    name: string;
    email: string;
    classId: string | null;
    streamId: string | null;
    subjectIds: string[];
    fatherName: string | null;
    motherName: string | null;
    gender: "MALE" | "FEMALE" | "OTHER" | null;
    address: string | null;
    stateId: string | null;
    districtId: string | null;
    pincodeId: string | null;
  };
  classes: { id: string; name: string; academicYearId: string }[];
  academicYears: { id: string; name: string; isCurrent: boolean }[];
  streams: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  states: { id: string; name: string }[];
  districts: { id: string; name: string; stateId: string }[];
  pincodes: { id: string; code: string; districtId: string }[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isEdit = Boolean(initial);

  const initialYearId =
    classes.find((c) => c.id === initial?.classId)?.academicYearId ??
    academicYears.find((y) => y.isCurrent)?.id ??
    academicYears[0]?.id ??
    "";
  const [yearId, setYearId] = useState(initialYearId);
  const filteredClasses = classes.filter((c) => c.academicYearId === yearId);

  const initialStateId =
    initial?.stateId ?? districts.find((d) => d.id === initial?.districtId)?.stateId ?? "";
  const [stateId, setStateId] = useState(initialStateId);
  const filteredDistricts = districts.filter((d) => d.stateId === stateId);

  const [districtId, setDistrictId] = useState(initial?.districtId ?? "");
  const filteredPincodes = pincodes.filter((p) => p.districtId === districtId);

  const [pincodeId, setPincodeId] = useState(initial?.pincodeId ?? "");

  function handleStateChange(value: string | null) {
    const newStateId = value ?? "";
    setStateId(newStateId);
    const stillValid = districts.some(
      (d) => d.id === districtId && d.stateId === newStateId,
    );
    if (!stillValid) {
      setDistrictId("");
      setPincodeId("");
    }
  }

  function handleDistrictChange(value: string | null) {
    const newDistrictId = value ?? "";
    setDistrictId(newDistrictId);
    const stillValid = pincodes.some(
      (p) => p.id === pincodeId && p.districtId === newDistrictId,
    );
    if (!stillValid) setPincodeId("");
  }

  return (
    <Card className="max-w-3xl">
      <CardContent>
        {isEdit && initial && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-input bg-muted/30 p-3">
            <p className="text-sm text-muted-foreground">
              Students set their own password via an emailed link.
            </p>
            <ResendSetupEmailButton userId={initial.userId} />
          </div>
        )}
        <PersistentForm
          action={formAction}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
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
            <Label htmlFor="fatherName">Father&apos;s Name</Label>
            <Input id="fatherName" name="fatherName" defaultValue={initial?.fatherName ?? ""} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="motherName">Mother&apos;s Name</Label>
            <Input id="motherName" name="motherName" defaultValue={initial?.motherName ?? ""} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Gender</Label>
            <Select name="gender" defaultValue={initial?.gender ?? ""}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => GENDER_LABELS[value] ?? "Not specified"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not specified</SelectItem>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Academic Year</Label>
            <Select value={yearId} onValueChange={(value) => setYearId(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    academicYears.find((y) => y.id === value)?.name ?? "Select year"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((y) => (
                  <SelectItem key={y.id} value={y.id}>
                    {y.name}
                    {y.isCurrent ? " (current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Filters the Class list below -- not saved by itself.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Class</Label>
            <Select
              key={yearId}
              name="classId"
              defaultValue={
                filteredClasses.some((c) => c.id === initial?.classId)
                  ? initial?.classId ?? ""
                  : (filteredClasses[0]?.id ?? "")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    filteredClasses.find((c) => c.id === value)?.name ?? "Unassigned"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {filteredClasses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filteredClasses.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No classes exist for that academic year yet.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Stream</Label>
            <Select name="streamId" defaultValue={initial?.streamId ?? ""}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    streams.find((s) => s.id === value)?.name ?? "None"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {streams.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={initial?.address ?? ""}
              rows={2}
              placeholder="House no., street, locality"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>State</Label>
            <Select name="stateId" value={stateId} onValueChange={handleStateChange}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => states.find((s) => s.id === value)?.name ?? "None"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {states.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>District</Label>
            <Select name="districtId" value={districtId} onValueChange={handleDistrictChange}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    filteredDistricts.find((d) => d.id === value)?.name ?? "None"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {filteredDistricts.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Pincode</Label>
            <Select
              name="pincodeId"
              value={pincodeId}
              onValueChange={(value) => setPincodeId(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    filteredPincodes.find((p) => p.id === value)?.code ?? "None"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {filteredPincodes.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label>Subjects</Label>
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

          {state.error && (
            <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>
          )}

          <Button type="submit" disabled={pending} className="mt-2 w-fit sm:col-span-2">
            {pending ? "Saving..." : submitLabel}
          </Button>
        </PersistentForm>
      </CardContent>
    </Card>
  );
}
