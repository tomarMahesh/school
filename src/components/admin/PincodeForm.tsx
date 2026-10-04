"use client";

import { useActionState, useState } from "react";
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
type PincodeFormAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function PincodeForm({
  action,
  initial,
  states,
  districts,
  submitLabel,
}: {
  action: PincodeFormAction;
  initial?: { code: string; districtId: string };
  states: { id: string; name: string }[];
  districts: { id: string; name: string; stateId: string }[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  const initialStateId =
    districts.find((d) => d.id === initial?.districtId)?.stateId ?? states[0]?.id ?? "";
  const [stateId, setStateId] = useState(initialStateId);
  const filteredDistricts = districts.filter((d) => d.stateId === stateId);

  return (
    <Card className="max-w-sm">
      <CardContent>
        <PersistentForm action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="code">Pincode</Label>
            <Input
              id="code"
              name="code"
              defaultValue={initial?.code}
              required
              pattern="\d{6}"
              maxLength={6}
              placeholder="226001"
              className="font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>State</Label>
            <Select value={stateId} onValueChange={(value) => setStateId(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => states.find((s) => s.id === value)?.name ?? "Select"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {states.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Filters the District list below -- not saved by itself.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>District</Label>
            <Select
              key={stateId}
              name="districtId"
              defaultValue={
                filteredDistricts.some((d) => d.id === initial?.districtId)
                  ? initial?.districtId
                  : filteredDistricts[0]?.id
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    filteredDistricts.find((d) => d.id === value)?.name ?? "Select"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {filteredDistricts.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filteredDistricts.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Add a district for that state first under Admin → Districts.
              </p>
            )}
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? "Saving..." : submitLabel}
          </Button>
        </PersistentForm>
      </CardContent>
    </Card>
  );
}
