"use client";

import { useActionState } from "react";
import Link from "next/link";
import { PersistentForm } from "@/components/PersistentForm";
import { requestPasswordReset } from "@/lib/actions/passwordReset";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, {});

  if (state.sent) {
    return (
      <div className="mx-auto mt-24 max-w-sm rounded-lg border border-black/10 p-6 text-center dark:border-white/10">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="mt-2 text-sm opacity-70">
          If an account exists for that email address, we&apos;ve sent a link to reset the
          password. The link works for 1 hour.
        </p>
        <Link href="/portal/login" className="mt-4 inline-block text-sm underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-24 max-w-sm rounded-lg border border-black/10 p-6 dark:border-white/10">
      <h1 className="mb-1 text-xl font-semibold">Forgot your password?</h1>
      <p className="mb-6 text-sm opacity-70">
        Enter the email address of your student or staff account and we&apos;ll email you a link
        to choose a new password.
      </p>
      <PersistentForm action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
        </label>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "Sending..." : "Send reset link"}
        </button>
        <Link href="/portal/login" className="text-center text-sm underline opacity-70">
          Back to sign in
        </Link>
      </PersistentForm>
    </div>
  );
}
