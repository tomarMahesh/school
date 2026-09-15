"use client";

import { useActionState } from "react";

type ActionState = { error?: string };
type StaffFormAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function StaffForm({
  action,
  initial,
  subjects,
  submitLabel,
}: {
  action: StaffFormAction;
  initial?: {
    name: string;
    email: string;
    role: "TEACHER" | "PRINCIPAL" | "STAFF";
    designation: string;
    qualification: string | null;
    education: string | null;
    aadharNumber: string | null;
    subjectIds: string[];
    phone: string | null;
    address: string | null;
  };
  subjects: { id: string; name: string }[];
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
        Portal Role
        <select
          name="role"
          defaultValue={initial?.role ?? "TEACHER"}
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        >
          <option value="TEACHER">Teacher</option>
          <option value="PRINCIPAL">Principal</option>
          <option value="STAFF">Staff (non-teaching)</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Designation
        <input
          name="designation"
          defaultValue={initial?.designation}
          required
          placeholder="Mathematics Teacher, Principal, Peon, Accountant..."
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
      </label>

      <fieldset className="flex flex-col gap-1 text-sm">
        <legend>Subjects taught (if any)</legend>
        <div className="flex flex-wrap gap-3">
          {subjects.map((s) => (
            <label key={s.id} className="flex items-center gap-1">
              <input
                type="checkbox"
                name="subjectIds"
                value={s.id}
                defaultChecked={initial?.subjectIds.includes(s.id)}
              />
              {s.name}
            </label>
          ))}
          {subjects.length === 0 && (
            <span className="opacity-60">
              No subjects defined yet — add some under Admin → Subjects.
            </span>
          )}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        Qualification
        <input
          name="qualification"
          defaultValue={initial?.qualification ?? ""}
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Education
        <input
          name="education"
          defaultValue={initial?.education ?? ""}
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Aadhar Number{" "}
        <span className="opacity-60">(optional, 12 digits, kept private)</span>
        <input
          name="aadharNumber"
          defaultValue={initial?.aadharNumber ?? ""}
          pattern="\d{12}"
          maxLength={12}
          placeholder="123412341234"
          className="rounded border border-black/20 px-3 py-2 font-mono dark:border-white/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Phone
        <input
          name="phone"
          defaultValue={initial?.phone ?? ""}
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Address
        <textarea
          name="address"
          defaultValue={initial?.address ?? ""}
          rows={3}
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
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
