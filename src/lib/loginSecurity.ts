import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Brute-force protection for password sign-in. Every check is recorded in
// the database (so limits survive restarts and apply across processes):
//  - 5 wrong passwords for one email within 15 minutes locks that email for
//    15 minutes (counted from the 5th failure);
//  - 20 wrong passwords from one IP within 15 minutes blocks that IP.
// Attempts made while locked are not recorded, so a lock can't be extended
// indefinitely by hammering it.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_ACCOUNT = 5;
const MAX_FAILS_PER_IP = 20;

// bcrypt-compare against this when the email doesn't exist, so a wrong email
// takes as long as a wrong password and can't be told apart by timing.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

type Lock = { locked: false } | { locked: true; retryAfterSec: number };

async function lockFor(
  where: { identifier: string } | { ip: string },
  max: number,
): Promise<Lock> {
  const since = new Date(Date.now() - WINDOW_MS);
  const recent = await prisma.loginAttempt.findMany({
    where: { ...where, success: false, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: max,
    select: { createdAt: true },
  });
  if (recent.length < max) return { locked: false };
  const unlockAt = recent[recent.length - 1].createdAt.getTime() + WINDOW_MS;
  return { locked: true, retryAfterSec: Math.max(1, Math.ceil((unlockAt - Date.now()) / 1000)) };
}

export async function checkLock(identifier: string, ip: string): Promise<Lock> {
  const account = await lockFor({ identifier }, MAX_FAILS_PER_ACCOUNT);
  if (account.locked) return account;
  if (ip !== "unknown") return lockFor({ ip }, MAX_FAILS_PER_IP);
  return { locked: false };
}

export function lockedMessage(retryAfterSec: number) {
  const minutes = Math.max(1, Math.ceil(retryAfterSec / 60));
  return `Too many failed attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

export async function recordFailure(identifier: string, ip: string) {
  await prisma.loginAttempt.create({
    data: { identifier, ip: ip === "unknown" ? null : ip, success: false },
  });
  if (Math.random() < 0.02) {
    await prisma.loginAttempt.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } },
    });
  }
}

export async function clearFailures(identifier: string) {
  await prisma.loginAttempt.deleteMany({ where: { identifier } });
}

export async function verifyPassword(email: string, password: string, ip: string) {
  const identifier = email.trim().toLowerCase();

  const lock = await checkLock(identifier, ip);
  if (lock.locked) {
    return { ok: false as const, reason: "locked" as const, retryAfterSec: lock.retryAfterSec };
  }

  const user = await prisma.user.findUnique({ where: { email: identifier } });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !valid) {
    await recordFailure(identifier, ip);
    return { ok: false as const, reason: "invalid" as const };
  }

  await clearFailures(identifier);
  return { ok: true as const, user };
}
