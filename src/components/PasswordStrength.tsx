"use client";

import { Check, Circle } from "lucide-react";
import {
  passwordChecks,
  passwordStrength,
  type PasswordContext,
} from "@/lib/passwordPolicy";

const TONE_CLASS = {
  weak: "bg-red-500",
  fair: "bg-amber-500",
  good: "bg-lime-500",
  strong: "bg-green-600",
} as const;

export function PasswordStrength({
  password,
  context,
}: {
  password: string;
  context?: PasswordContext;
}) {
  const strength = passwordStrength(password, context);
  const checks = passwordChecks(password, context);

  return (
    <div className="flex flex-col gap-2 text-xs" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
          <div
            className={`h-full rounded-full transition-all ${TONE_CLASS[strength.tone]}`}
            style={{ width: `${strength.fraction * 100}%` }}
          />
        </div>
        <span className="w-12 text-right font-medium">{strength.label}</span>
      </div>
      <ul className="grid gap-1">
        {checks.map((check) => (
          <li
            key={check.id}
            className={`flex items-center gap-1.5 ${
              password && check.ok ? "text-green-700 dark:text-green-400" : "opacity-60"
            }`}
          >
            {password && check.ok ? (
              <Check className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Circle className="h-3 w-3 shrink-0" />
            )}
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
