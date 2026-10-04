"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { PersistentForm } from "@/components/PersistentForm";
import { changePassword } from "@/lib/actions/account";
import { PasswordStrength } from "@/components/PasswordStrength";
import { PASSWORD_MIN_LENGTH, validatePassword, type PasswordContext } from "@/lib/passwordPolicy";

export function ChangePasswordForm({ context }: { context?: PasswordContext }) {
  const [state, formAction, pending] = useActionState(changePassword, {});
  const formRef = useRef<HTMLFormElement>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Clear the controlled fields once, when a new successful result arrives.
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    if (state.success) {
      setNewPassword("");
      setConfirm("");
    }
  }

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <PersistentForm
      ref={formRef}
      action={formAction}
      className="flex max-w-sm flex-col gap-3"
    >
      <label className="flex flex-col gap-1 text-sm">
        Current Password
        <input
          type="password"
          name="currentPassword"
          required
          autoComplete="current-password"
          className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        New Password
        <input
          type="password"
          name="newPassword"
          required
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Confirm New Password
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
        />
      </label>

      <PasswordStrength password={newPassword} context={context} />
      {confirm && newPassword !== confirm && (
        <p className="text-xs text-red-600">Passwords do not match.</p>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-600">Password updated.</p>
      )}

      <button
        type="submit"
        disabled={
          pending ||
          validatePassword(newPassword, context).length > 0 ||
          newPassword !== confirm
        }
        className="mt-1 w-fit rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Updating..." : "Change Password"}
      </button>
    </PersistentForm>
  );
}
