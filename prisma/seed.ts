import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = "admin@school.local";
  const password = "ChangeMe123!";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name: "Site Admin",
      role: "ADMIN",
      passwordHash,
    },
  });

  console.log(`Created admin user: ${email} / ${password}`);
  console.log("Log in at /admin/login, then change this password.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
