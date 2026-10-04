import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OtpForm } from "@/components/OtpForm";
import { maskPhone } from "@/lib/sms";
import { CHALLENGE_COOKIE, loadActiveChallenge } from "@/lib/twoFactor";

export default async function AdminVerifyPage() {
  const id = (await cookies()).get(CHALLENGE_COOKIE)?.value;
  const challenge = await loadActiveChallenge(id);
  if (!challenge || !challenge.user.twoFactorPhone) redirect("/admin/login");

  return <OtpForm maskedPhone={maskPhone(challenge.user.twoFactorPhone)} />;
}
