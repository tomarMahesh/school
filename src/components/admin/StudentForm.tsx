"use client";

import { useActionState } from "react";

type ActionState = { error?: string };
type StudentFormAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function StudentForm({
  action,
  initial,
  classes,
  submitLabel,
}: {
  action: StudentFormAction;
  initial?: { name: string; email: string; classId: string | null };
  classes: { id: string; name: string }[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isEdit = Boolean(initial);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          name="name"
          defaultValue={initial?.name}
          required
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          name="email"
          type="email"
          defaultValue={initial?.email}
          required
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        {isEdit ? "New Password (leave blank to keep current)" : "Password"}
        <input
          name="password"
          type="password"
          required={!isEdit}
          minLength={8}
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Class
        <select
          name="classId"
          defaultValue={initial?.classId ?? ""}
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        >
          <option value="">— Unassigned —</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
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
