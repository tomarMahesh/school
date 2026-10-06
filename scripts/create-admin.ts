// Creates the first admin on a fresh server (instead of the demo seed, which
// uses a known default password). The admin picks their own password through
// a one-time link, and the phone receives their sign-in codes.
//
// Usage:  npx tsx scripts/create-admin.ts <email> "<Full Name>" <phone>
import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { prisma } from "../src/lib/prisma";
import { issuePasswordSetupToken } from "../src/lib/passwordSetup";
import { maskPhone, normalizePhone } from "../src/lib/sms";

async function main() {
  const [rawEmail, name, rawPhone] = process.argv.slice(2);
  if (!rawEmail || !name || !rawPhone) {
    console.error('Usage: npx tsx scripts/create-admin.ts <email> "<Full Name>" <phone>');
    process.exit(1);
  }

  const email = rawEmail.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    console.error("That doesn't look like a valid email address.");
    process.exit(1);
  }
  const phone = normalizePhone(rawPhone);
  if (!phone) {
    console.error("That doesn't look like a valid phone number.");
    process.exit(1);
  }
  if (await prisma.user.findUnique({ where: { email } })) {
    console.error("A user with that email already exists.");
    process.exit(1);
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: name.trim(),
      role: "ADMIN",
      twoFactorPhone: phone,
      // Unusable until the admin sets their own password via the link below.
      passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"), 10),
    },
  });

  const token = await issuePasswordSetupToken(user.id, 24);
  const base = (process.env.APP_URL || "http://localhost:3020").replace(/\/$/, "");

  console.log(`Admin created: ${user.email} (codes go to ${maskPhone(phone)})`);
  console.log("");
  console.log("Open this link within 24 hours to choose the password:");
  console.log(`${base}/set-password?token=${token}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
