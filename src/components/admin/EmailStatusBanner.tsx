export function EmailStatusBanner({
  status,
  name,
}: {
  status: string | undefined;
  name: string;
}) {
  if (status !== "sent" && status !== "failed") return null;

  if (status === "failed") {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        {name} was created, but the password setup email could not be sent.
        Check the SMTP settings in .env, then use &quot;Resend Setup
        Email&quot; from their profile.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
      {name} was created and a password setup email was sent to them.
    </div>
  );
}
