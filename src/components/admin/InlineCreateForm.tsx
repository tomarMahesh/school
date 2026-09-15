"use client";

import { useActionState } from "react";

type ActionState = { error?: string };
type CreateAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function InlineCreateForm({
  action,
  submitLabel,
  children,
}: {
  action: CreateAction;
  submitLabel: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      {children}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
