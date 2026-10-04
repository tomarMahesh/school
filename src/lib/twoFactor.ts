import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";

export const CHALLENGE_COOKIE = "admin_2fa";
export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_MAX_SENDS = 3;
export const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
// After the code is verified, the session must be issued within this window.
export const VERIFIED_GRACE_MS = 2 * 60 * 1000;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set.");
  return s;
}

function generateOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function hashOtp(challengeId: string, otp: string) {
  return createHmac("sha256", secret()).update(`${challengeId}:${otp}`).digest("hex");
}

export function otpMatches(challengeId: string, otp: string, storedHash: string) {
  const a = Buffer.from(hashOtp(challengeId, otp), "hex");
  const b = Buffer.from(storedHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function smsText(otp: string) {
  return `${otp} is your admin sign-in code. It expires in 5 minutes. Never share it with anyone.`;
}

/** Creates a challenge and texts the code. Removes the challenge if the SMS fails. */
export async function createChallenge(userId: string, phone: string) {
  const id = randomBytes(24).toString("hex");
  const otp = generateOtp();
  await prisma.loginChallenge.create({
    data: {
      id,
      userId,
      otpHash: hashOtp(id, otp),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  try {
    await sendSms(phone, smsText(otp));
  } catch (err) {
    await prisma.loginChallenge.delete({ where: { id } }).catch(() => {});
    throw err;
  }
  return id;
}

/** Issues a fresh code on an existing challenge (resend). */
export async function reissueCode(challengeId: string, phone: string) {
  const otp = generateOtp();
  await prisma.loginChallenge.update({
    where: { id: challengeId },
    data: {
      otpHash: hashOtp(challengeId, otp),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      attempts: 0,
      sendCount: { increment: 1 },
      lastSentAt: new Date(),
    },
  });
  await sendSms(phone, smsText(otp));
}

/** The challenge, if it can still accept a code: exists, unused, unexpired. */
export async function loadActiveChallenge(id: string | undefined) {
  if (!id) return null;
  const challenge = await prisma.loginChallenge.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!challenge) return null;
  if (challenge.consumedAt || challenge.verifiedAt) return null;
  if (challenge.expiresAt < new Date()) return null;
  return challenge;
}
