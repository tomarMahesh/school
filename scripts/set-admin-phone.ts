// Sets (or changes) the phone that receives an admin's sign-in codes.
// Usage:  npm run admin:set-phone -- admin@school.local 9876543210
//
// Deliberately a server-side script, not a web page: if anyone who knew the
// admin password could register their own phone, two-factor would protect
// nothing. Only someone with access to the server can change it.
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { maskPhone, normalizePhone } from "../src/lib/sms";

async function main() {
  const [email, rawPhone] = process.argv.slice(2);
  if (!email || !rawPhone) {
    console.error("Usage: npm run admin:set-phone -- <admin-email> <phone>");
    process.exit(1);
  }

  const phone = normalizePhone(rawPhone);
  if (!phone) {
    console.error("That doesn't look like a valid phone number.");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || user.role !== "ADMIN") {
    console.error("No admin account found with that email.");
    process.exit(1);
  }

  await prisma.user.update({ where: { id: user.id }, data: { twoFactorPhone: phone } });
  console.log(`Sign-in codes for ${user.email} will now go to ${maskPhone(phone)}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
