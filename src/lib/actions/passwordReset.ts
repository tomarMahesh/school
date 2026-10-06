"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIpFromHeaders } from "@/lib/loginSecurity";
import { sendPasswordSetupEmail } from "@/lib/passwordSetup";
import { errorFields, logger } from "@/lib/logger";

export type ResetState = { sent?: boolean; error?: string };

const HOUR_MS = 60 * 60 * 1000;
const MAX_PER_EMAIL = 3;
const MAX_PER_IP = 10;

async function recentCount(identifier: string) {
  return prisma.loginAttempt.count({
    where: { identifier, createdAt: { gte: new Date(Date.now() - HOUR_MS) } },
  });
}

// Asks for a password-reset email. The answer is always the same message
// whether or not the address has an account, so this can't be used to find
// out who is registered. Admin accounts are deliberately never emailed --
// their access is protected by two-factor sign-in and is recovered by the system
// owner. Requests are rate-limited (silently) to stop email flooding.
export async function requestPasswordReset(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Enter the email address of your account." };
  }

  const ip = clientIpFromHeaders(await headers());
  const emailKey = `reset:${email}`;
  const ipKey = `reset-ip:${ip}`;

  const limited =
    (await recentCount(emailKey)) >= MAX_PER_EMAIL ||
    (ip !== "unknown" && (await recentCount(ipKey)) >= MAX_PER_IP);

  if (!limited) {
    await prisma.loginAttempt.createMany({
      data: [
        { identifier: emailKey, success: false },
        ...(ip !== "unknown" ? [{ identifier: ipKey, success: false }] : []),
      ],
    });

    // Sent after the response so a real account and an unknown one take
    // the same time to answer.
    after(async () => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        logger.info("password_reset_requested", {
          email,
          sent: Boolean(user && user.role !== "ADMIN"),
        });
        if (!user || user.role === "ADMIN") return;
        await sendPasswordSetupEmail({
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          purpose: "reset",
        });
      } catch (err) {
        logger.error("password_reset_email_failed", { email, ...errorFields(err) });
      }
    });
  }

  return { sent: true };
}
