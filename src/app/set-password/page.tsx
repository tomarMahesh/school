import { checkSetupToken } from "@/lib/passwordSetup";
import { SetPasswordForm } from "@/components/SetPasswordForm";

export default async function SetPasswordPage(
  props: PageProps<"/set-password">,
) {
  const searchParams = await props.searchParams;
  const token = typeof searchParams.token === "string" ? searchParams.token : "";

  const check = token ? await checkSetupToken(token) : { ok: false as const, reason: "not_found" as const };

  if (!check.ok) {
    const message =
      check.reason === "expired"
        ? "This setup link has expired. Ask the school office to resend it."
        : check.reason === "used"
          ? "This setup link has already been used. If you still need to set your password, ask the school office to resend it."
          : "This setup link is invalid.";

    return (
      <div className="mx-auto mt-24 max-w-sm rounded-lg border border-black/10 p-6 text-center dark:border-white/10">
        <h1 className="text-xl font-semibold">Link not valid</h1>
        <p className="mt-2 text-sm opacity-70">{message}</p>
      </div>
    );
  }

  return <SetPasswordForm token={token} name={check.name} email={check.email} />;
}
