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
type PostFormAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

const CATEGORY_LABELS: Record<string, string> = {
  NEWS: "News",
  EVENT: "Event",
  ANNOUNCEMENT: "Announcement",
};

export function PostForm({
  action,
  initial,
  submitLabel,
}: {
  action: PostFormAction;
  initial?: {
    title: string;
    slug: string;
    content: string;
    published: boolean;
    category: "NEWS" | "EVENT" | "ANNOUNCEMENT";
  };
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
              placeholder="winter-concert-2026"
              className="font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Select name="category" defaultValue={initial?.category ?? "NEWS"}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => CATEGORY_LABELS[value] ?? value}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEWS">News</SelectItem>
                <SelectItem value="EVENT">Event</SelectItem>
                <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
              </SelectContent>
            </Select>
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
