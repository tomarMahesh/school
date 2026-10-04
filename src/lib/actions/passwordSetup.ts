"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPasswordSetupEmail, checkSetupToken } from "@/lib/passwordSetup";
import { passwordError } from "@/lib/passwordPolicy";
import { clearFailures } from "@/lib/loginSecurity";

type ActionState = { error?: string; success?: boolean };

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function resendPasswordSetupEmail(
  userId: string,
  _prevState: ActionState,
): Promise<ActionState> {
  await requireAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found." };

  try {
    await sendPasswordSetupEmail({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to send the setup email.",
    };
  }

  return { success: true };
}

export async function setPassword(
  token: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password) {
    return { error: "Password is required." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const check = await checkSetupToken(token);
  if (!check.ok) {
    return {
      error:
        check.reason === "expired"
          ? "This setup link has expired. Ask the school office to resend it."
          : check.reason === "used"
            ? "This setup link has already been used."
            : "This setup link is invalid.",
    };
  }

  const weak = passwordError(password, { name: check.name, email: check.email });
  if (weak) return { error: weak };

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: check.userId },
      data: { passwordHash },
    }),
    prisma.passwordSetupToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ]);

  await clearFailures(check.email.toLowerCase());

  return { success: true };
}
