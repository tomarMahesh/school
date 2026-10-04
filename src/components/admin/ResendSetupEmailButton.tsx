"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendPasswordSetupEmail } from "@/lib/actions/passwordSetup";

export function ResendSetupEmailButton({ userId }: { userId: string }) {
  const action = resendPasswordSetupEmail.bind(null, userId);
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state.success) toast.success("Setup email sent.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction}>
      <Button type="submit" variant="outline" disabled={pending}>
        <Mail />
        {pending ? "Sending..." : "Resend Setup Email"}
      </Button>
    </form>
  );
}
