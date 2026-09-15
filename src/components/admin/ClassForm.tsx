"use client";

import { useActionState } from "react";

type ActionState = { error?: string };
type ClassFormAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function ClassForm({
  action,
  initial,
  teachers,
  sections,
  submitLabel,
}: {
  action: ClassFormAction;
  initial?: { name: string; teacherId: string | null; sectionId: string | null };
  teachers: { id: string; name: string; designation: string }[];
  sections: { id: string; name: string }[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Class Name
        <input
          name="name"
          defaultValue={initial?.name}
          required
          placeholder="Grade 5A"
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Section
        <select
          name="sectionId"
          defaultValue={initial?.sectionId ?? ""}
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        >
          <option value="">— None —</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Teacher
        <select
          name="teacherId"
          defaultValue={initial?.teacherId ?? ""}
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        >
          <option value="">— None —</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.designation})
            </option>
          ))}
        </select>
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
