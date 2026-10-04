import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import type { Role } from "@/generated/prisma/enums";

const SETUP_TTL_HOURS = 48;
const RESET_TTL_HOURS = 1;

function baseUrl() {
  return (process.env.APP_URL || "http://localhost:3020").replace(/\/$/, "");
}

export async function issuePasswordSetupToken(userId: string, ttlHours = SETUP_TTL_HOURS) {
  // Only the newest link should work: retire any older unused ones.
  await prisma.passwordSetupToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  await prisma.passwordSetupToken.create({ data: { token, userId, expiresAt } });
  return token;
}

/** Issues a fresh setup link and emails it. Throws if SMTP isn't configured
 * or sending fails -- callers decide how to surface that to the admin. */
export async function sendPasswordSetupEmail({
  userId,
  name,
  email,
  role,
  purpose = "welcome",
}: {
  userId: string;
  name: string;
  email: string;
  role: Role;
  purpose?: "welcome" | "reset";
}) {
  const reset = purpose === "reset";
  const token = await issuePasswordSetupToken(
    userId,
    reset ? RESET_TTL_HOURS : SETUP_TTL_HOURS,
  );
  const link = `${baseUrl()}/set-password?token=${token}`;
  const portalLabel = role === "STUDENT" ? "student" : "staff";

  if (reset) {
    await sendMail({
      to: email,
      subject: "Reset your School Portal password",
      html: `
        <p>Hi ${name},</p>
        <p>We received a request to reset the password for your School Portal account. Click the link below to choose a new one:</p>
        <p><a href="${link}">${link}</a></p>
        <p>This link expires in ${RESET_TTL_HOURS} hour and can be used once. If you didn't ask for this, you can ignore this email -- your password will not change.</p>
      `,
    });
    return;
  }

  await sendMail({
    to: email,
    subject: "Set up your School Portal password",
    html: `
      <p>Hi ${name},</p>
      <p>An account has been created for you on the School Portal as a ${portalLabel}. Click the link below to set your password and sign in:</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link expires in ${SETUP_TTL_HOURS} hours. If you weren't expecting this email, you can ignore it.</p>
    `,
  });
}

export type SetupTokenCheck =
  | { ok: true; userId: string; email: string; name: string }
  | { ok: false; reason: "not_found" | "expired" | "used" };

export async function checkSetupToken(token: string): Promise<SetupTokenCheck> {
  const record = await prisma.passwordSetupToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!record) return { ok: false, reason: "not_found" };
  if (record.usedAt) return { ok: false, reason: "used" };
  if (record.expiresAt < new Date()) return { ok: false, reason: "expired" };
  return {
    ok: true,
    userId: record.userId,
    email: record.user.email,
    name: record.user.name,
  };
}
