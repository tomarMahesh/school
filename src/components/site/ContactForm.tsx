"use client";

import { useActionState } from "react";
import { submitContactMessage } from "@/lib/actions/contact";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactMessage, {});

  if (state.success) {
    return (
      <p className="rounded border border-[#0f3d63]/20 bg-white p-6 text-[#0f3d63]">
        Thank you — your message has been received. We&apos;ll get back to you soon.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-[#0f3d63]">
          Name
          <input
            name="name"
            required
            className="rounded border border-[#0f3d63]/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[#0f3d63]">
          Phone (optional)
          <input
            name="phone"
            className="rounded border border-[#0f3d63]/20 px-3 py-2"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm text-[#0f3d63]">
        Email
        <input
          name="email"
          type="email"
          required
          className="rounded border border-[#0f3d63]/20 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-[#0f3d63]">
        Message
        <textarea
          name="message"
          rows={4}
          required
          className="rounded border border-[#0f3d63]/20 px-3 py-2"
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-[#0f3d63] px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
