"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { togglePublishExam } from "@/lib/actions/exams";

export function PublishExamToggle({
  examId,
  defaultChecked,
}: {
  examId: string;
  defaultChecked: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Switch
        defaultChecked={defaultChecked}
        disabled={isPending}
        onCheckedChange={(checked) => {
          startTransition(async () => {
            await togglePublishExam(examId, checked);
            toast.success(
              checked
                ? "Results published — students can now see them."
                : "Results unpublished.",
            );
          });
        }}
      />
      <span className="text-sm text-muted-foreground">
        Publish results to students
      </span>
    </div>
  );
}
