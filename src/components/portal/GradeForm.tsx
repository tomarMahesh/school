"use client";

import { useActionState, useRef, useEffect } from "react";

type ActionState = { error?: string };
type AddGradeAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function GradeForm({
  action,
  subjects,
}: {
  action: AddGradeAction;
  subjects: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error && !pending) {
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-end gap-3"
    >
      <label className="flex flex-col gap-1 text-sm">
        Subject
        <select
          name="subjectId"
          required
          defaultValue=""
          className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
        >
          <option value="" disabled>
            Select subject
          </option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Term
        <input
          name="term"
          required
          placeholder="Term 1"
          className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Score
        <input
          name="score"
          type="number"
          step="0.1"
          required
          className="w-20 rounded border border-black/20 px-2 py-1 dark:border-white/20"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Max Score
        <input
          name="maxScore"
          type="number"
          step="0.1"
          required
          defaultValue={100}
          className="w-24 rounded border border-black/20 px-2 py-1 dark:border-white/20"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Adding..." : "Add Grade"}
      </button>
      {state.error && (
        <p className="w-full text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
