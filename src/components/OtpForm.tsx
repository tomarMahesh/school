"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PersistentForm } from "@/components/PersistentForm";
import { resendOtpAction, verifyOtpAction } from "@/lib/actions/login";

export function OtpForm({ maskedPhone }: { maskedPhone: string }) {
  const router = useRouter();
  const [verifyState, verifyAction, verifying] = useActionState(verifyOtpAction, {});
  const [resendState, resendAction, resending] = useActionState(resendOtpAction, {});

  const restart = verifyState.restart || resendState.restart;
  useEffect(() => {
    if (!restart) return;
    const timer = setTimeout(() => router.push("/admin/login"), 2500);
    return () => clearTimeout(timer);
  }, [restart, router]);

  const error = verifyState.error ?? resendState.error;

  return (
    <div className="mx-auto mt-24 max-w-sm rounded-lg border border-black/10 p-6 dark:border-white/10">
      <h1 className="mb-1 text-xl font-semibold">Verify it&apos;s you</h1>
      <p className="mb-6 text-sm opacity-70">
        We sent a 6-digit code by SMS to {maskedPhone}. It expires in 5 minutes.
      </p>

      <PersistentForm action={verifyAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Verification code
          <input
            name="code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            autoFocus
            required
            className="rounded border border-black/20 px-3 py-2 text-center text-lg tracking-[0.5em] dark:border-white/20"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && resendState.info && (
          <p className="text-sm text-green-700">{resendState.info}</p>
        )}
        <button
          type="submit"
          disabled={verifying || restart}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {verifying ? "Verifying..." : "Verify and sign in"}
        </button>
      </PersistentForm>

      <div className="mt-4 flex items-center justify-between text-sm">
        <form action={resendAction}>
          <button type="submit" disabled={resending || restart} className="underline disabled:opacity-50">
            {resending ? "Sending..." : "Resend code"}
          </button>
        </form>
        <Link href="/admin/login" className="underline opacity-70">
          Start over
        </Link>
      </div>
    </div>
  );
}
