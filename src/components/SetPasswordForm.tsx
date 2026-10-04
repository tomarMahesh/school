"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PersistentForm } from "@/components/PersistentForm";
import { setPassword } from "@/lib/actions/passwordSetup";
import { PasswordStrength } from "@/components/PasswordStrength";
import { PASSWORD_MIN_LENGTH, validatePassword } from "@/lib/passwordPolicy";

export function SetPasswordForm({
  token,
  name,
  email,
}: {
  token: string;
  name: string;
  email: string;
}) {
  const [password, setPasswordValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const action = setPassword.bind(null, token);
  const [state, formAction, pending] = useActionState(action, {});
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => router.push("/portal/login"), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  if (state.success) {
    return (
      <div className="mx-auto mt-24 max-w-sm rounded-lg border border-black/10 p-6 text-center dark:border-white/10">
        <h1 className="text-xl font-semibold">Password set</h1>
        <p className="mt-2 text-sm opacity-70">
          Redirecting you to sign in...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-24 max-w-sm rounded-lg border border-black/10 p-6 dark:border-white/10">
      <h1 className="mb-1 text-xl font-semibold">Set your password</h1>
      <p className="mb-6 text-sm opacity-70">Welcome, {name}. Choose a password to finish setting up your account.</p>
      <PersistentForm action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          New Password
          <input
            name="password"
            type="password"
            required
            minLength={PASSWORD_MIN_LENGTH}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPasswordValue(e.target.value)}
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Confirm Password
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={PASSWORD_MIN_LENGTH}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
        </label>
        <PasswordStrength password={password} context={{ name, email }} />
        {confirm && password !== confirm && (
          <p className="text-xs text-red-600">Passwords do not match.</p>
        )}
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={
            pending ||
            validatePassword(password, { name, email }).length > 0 ||
            password !== confirm
          }
          className="mt-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "Saving..." : "Set Password"}
        </button>
      </PersistentForm>
    </div>
  );
}
