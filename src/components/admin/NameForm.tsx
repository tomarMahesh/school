"use client";

import { useActionState } from "react";

type ActionState = { error?: string };
type NameFormAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function NameForm({
  action,
  initial,
  placeholder,
  submitLabel,
}: {
  action: NameFormAction;
  initial?: { name: string };
  placeholder?: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          name="name"
          defaultValue={initial?.name}
          required
          placeholder={placeholder}
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
