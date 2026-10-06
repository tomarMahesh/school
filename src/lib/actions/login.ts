"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { errorFields, logger } from "@/lib/logger";
import { signIn } from "@/lib/auth";
import {
  clientIpFromHeaders,
  lockedMessage,
  verifyPassword,
} from "@/lib/loginSecurity";
import {
  CHALLENGE_COOKIE,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_SENDS,
  OTP_RESEND_COOLDOWN_MS,
  createChallenge,
  loadActiveChallenge,
  otpMatches,
  reissueCode,
} from "@/lib/twoFactor";

export type LoginState = { error?: string; info?: string; restart?: boolean };

const INVALID = "Invalid email or password.";

async function setChallengeCookie(id: string) {
  (await cookies()).set(CHALLENGE_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin/login",
    maxAge: 10 * 60,
  });
}

async function clearChallengeCookie() {
  (await cookies()).delete({ name: CHALLENGE_COOKIE, path: "/admin/login" });
}

export async function loginAction(
  redirectTo: string,
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const ip = clientIpFromHeaders(await headers());
  const result = await verifyPassword(email, password, ip);
  if (!result.ok) {
    logger.warn(result.reason === "locked" ? "login_locked" : "login_failed", { email, ip });
    return { error: result.reason === "locked" ? lockedMessage(result.retryAfterSec) : INVALID };
  }

  const { user } = result;

  if (user.role === "ADMIN") {
    if (!user.twoFactorPhone) {
      logger.warn("admin_login_blocked_no_phone", { email: user.email });
      return {
        error:
          "Admin accounts need two-factor sign-in, but no phone number is set up for this account. Contact the system owner.",
      };
    }
    let challengeId: string;
    try {
      challengeId = await createChallenge(user.id, user.twoFactorPhone);
    } catch (err) {
      logger.error("admin_code_send_failed", { email: user.email, ...errorFields(err) });
      return { error: "We couldn't send the verification code. Please try again shortly." };
    }
    logger.info("admin_code_sent", { email: user.email });
    await setChallengeCookie(challengeId);
    redirect("/admin/login/verify");
  }

  logger.info("login_ok", { email: user.email, role: user.role });
  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (err) {
    if (err instanceof AuthError) return { error: INVALID };
    throw err; // the redirect on success
  }
  return {};
}

export async function verifyOtpAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  const id = (await cookies()).get(CHALLENGE_COOKIE)?.value;

  const challenge = await loadActiveChallenge(id);
  if (!challenge) {
    await clearChallengeCookie();
    return { error: "Your sign-in session expired. Please sign in again.", restart: true };
  }
  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code." };

  // Count the attempt first, atomically, so parallel guesses can't exceed the limit.
  const counted = await prisma.loginChallenge.updateMany({
    where: { id: challenge.id, attempts: { lt: OTP_MAX_ATTEMPTS }, verifiedAt: null, consumedAt: null },
    data: { attempts: { increment: 1 } },
  });
  if (counted.count !== 1) {
    logger.warn("admin_code_locked", { email: challenge.user.email });
    await prisma.loginChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } });
    await clearChallengeCookie();
    return { error: "Too many incorrect codes. Please sign in again.", restart: true };
  }

  if (!otpMatches(challenge.id, code, challenge.otpHash)) {
    const left = OTP_MAX_ATTEMPTS - (challenge.attempts + 1);
    logger.warn("admin_code_wrong", { email: challenge.user.email, attemptsLeft: Math.max(left, 0) });
    if (left <= 0) {
      await prisma.loginChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } });
      await clearChallengeCookie();
      return { error: "Too many incorrect codes. Please sign in again.", restart: true };
    }
    return { error: `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.` };
  }

  await prisma.loginChallenge.update({
    where: { id: challenge.id },
    data: { verifiedAt: new Date() },
  });
  await clearChallengeCookie();

  logger.info("admin_login_success", { email: challenge.user.email });
  try {
    await signIn("credentials", { challengeId: challenge.id, redirectTo: "/admin" });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Could not complete sign-in. Please sign in again.", restart: true };
    }
    throw err; // the redirect on success
  }
  return {};
}

export async function resendOtpAction(
  _prev: LoginState,
  _formData: FormData,
): Promise<LoginState> {
  const id = (await cookies()).get(CHALLENGE_COOKIE)?.value;
  const challenge = await loadActiveChallenge(id);
  if (!challenge || !challenge.user.twoFactorPhone) {
    await clearChallengeCookie();
    return { error: "Your sign-in session expired. Please sign in again.", restart: true };
  }

  if (challenge.sendCount >= OTP_MAX_SENDS) {
    return { error: "You've requested the maximum number of codes. Please sign in again." };
  }
  const waitMs = OTP_RESEND_COOLDOWN_MS - (Date.now() - challenge.lastSentAt.getTime());
  if (waitMs > 0) {
    return { error: `Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting another code.` };
  }

  try {
    await reissueCode(challenge.id, challenge.user.twoFactorPhone);
  } catch (err) {
    logger.error("admin_code_resend_failed", { email: challenge.user.email, ...errorFields(err) });
    return { error: "We couldn't send the verification code. Please try again shortly." };
  }
  return { info: "A new code has been sent." };
}
