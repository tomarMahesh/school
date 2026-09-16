"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { updateSiteSettings } from "@/lib/actions/settings";

type Initial = {
  schoolName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
};

export function SettingsForm({ initial }: { initial: Initial }) {
  const [state, formAction, pending] = useActionState(updateSiteSettings, {});

  useEffect(() => {
    if (state.success) toast.success("Settings saved.");
  }, [state]);

  return (
    <Card className="max-w-lg">
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="schoolName">School Name</Label>
            <Input
              id="schoolName"
              name="schoolName"
              defaultValue={initial.schoolName}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" defaultValue={initial.address ?? ""} rows={2} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={initial.phone ?? ""} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={initial.email ?? ""} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="logoUrl">
              Logo URL{" "}
              <span className="font-normal text-muted-foreground">
                (optional -- leave blank to keep the placeholder logo)
              </span>
            </Label>
            <Input id="logoUrl" name="logoUrl" defaultValue={initial.logoUrl ?? ""} />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="mt-2 w-fit">
            {pending ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
