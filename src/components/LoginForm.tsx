"use client";

import { useActionState } from "react";
import Link from "next/link";
import { PersistentForm } from "@/components/PersistentForm";
import { loginAction } from "@/lib/actions/login";

export function LoginForm({
  redirectTo,
  title,
  showForgotPassword = false,
}: {
  redirectTo: string;
  title: string;
  showForgotPassword?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    loginAction.bind(null, redirectTo),
    {},
  );

  return (
    <div className="mx-auto mt-24 max-w-sm rounded-lg border border-black/10 p-6 dark:border-white/10">
      <h1 className="mb-6 text-xl font-semibold">{title}</h1>
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
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
        </label>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
        {showForgotPassword && (
          <Link href="/forgot-password" className="text-center text-sm underline opacity-70">
            Forgot password?
          </Link>
        )}
      </PersistentForm>
    </div>
  );
}
