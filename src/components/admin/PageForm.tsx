"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ActionState = { error?: string };
type PageFormAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function PageForm({
  action,
  initial,
  submitLabel,
}: {
  action: PageFormAction;
  initial?: { title: string; slug: string; content: string; published: boolean };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Card className="max-w-2xl">
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={initial?.title} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">
              Slug{" "}
              <span className="font-normal text-muted-foreground">
                (leave blank to auto-generate from title)
              </span>
            </Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={initial?.slug}
              placeholder="about-us"
              className="font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={initial?.content}
              rows={14}
              className="font-mono text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="published" defaultChecked={initial?.published} />
            Published
          </label>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="mt-2 w-fit">
            {pending ? "Saving..." : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
