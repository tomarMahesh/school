"use client";

import { useActionState } from "react";
import { PersistentForm } from "@/components/PersistentForm";
import { updateContactInfo } from "@/lib/actions/account";

export function ContactInfoForm({
  initial,
}: {
  initial: { phone: string | null; address: string | null };
}) {
  const [state, formAction, pending] = useActionState(updateContactInfo, {});

  return (
    <PersistentForm action={formAction} className="flex max-w-sm flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Phone
        <input
          name="phone"
          defaultValue={initial.phone ?? ""}
          className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Address
        <input
          name="address"
          defaultValue={initial.address ?? ""}
          className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
        />
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-600">Contact info updated.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-fit rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Saving..." : "Save Contact Info"}
      </button>
    </PersistentForm>
  );
}
