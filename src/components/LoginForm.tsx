"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm({
  redirectTo,
  title,
}: {
  redirectTo: string;
  title: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="mx-auto mt-24 max-w-sm rounded-lg border border-black/10 p-6 dark:border-white/10">
      <h1 className="mb-6 text-xl font-semibold">{title}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
