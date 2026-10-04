"use client";

import { startTransition } from "react";

// React resets all uncontrolled fields in a <form action={fn}> once the
// action finishes, even when it returns a validation error instead of
// redirecting -- so a rejected submission wipes everything the user
// typed. Intercepting submit ourselves and dispatching the action
// manually (rather than wiring it through the `action` prop) sidesteps
// that native-form-reset behavior while keeping the same
// useActionState pending/error semantics. Drop-in swap for <form
// action={formAction}>.
export function PersistentForm({
  action,
  onSubmit,
  ...props
}: Omit<React.ComponentProps<"form">, "action"> & {
  action: (formData: FormData) => void;
}) {
  return (
    <form
      {...props}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => {
          action(formData);
        });
        onSubmit?.(e);
      }}
    />
  );
}
