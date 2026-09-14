"use client";

import { useActionState } from "react";

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
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Title
        <input
          name="title"
          defaultValue={initial?.title}
          required
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Slug{" "}
        <span className="opacity-60">(leave blank to auto-generate from title)</span>
        <input
          name="slug"
          defaultValue={initial?.slug}
          placeholder="about-us"
          className="rounded border border-black/20 px-3 py-2 font-mono dark:border-white/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Content
        <textarea
          name="content"
          defaultValue={initial?.content}
          rows={14}
          className="rounded border border-black/20 px-3 py-2 font-mono text-sm dark:border-white/20"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={initial?.published}
        />
        Published
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
