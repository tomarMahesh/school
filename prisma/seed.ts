import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function seedAdmin() {
  const email = "admin@school.local";
  const password = "ChangeMe123!";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, name: "Site Admin", role: "ADMIN", passwordHash },
  });

  console.log(`Created admin user: ${email} / ${password}`);
}

async function seedClassroom() {
  const teacherEmail = "teacher@school.local";
  const studentEmail = "student@school.local";
  const password = "ChangeMe123!";

  let klass = await prisma.class.findUnique({ where: { name: "Grade 5A" } });
  if (!klass) {
    klass = await prisma.class.create({ data: { name: "Grade 5A" } });
    console.log(`Created class: ${klass.name}`);
  }

  let teacherUser = await prisma.user.findUnique({
    where: { email: teacherEmail },
    include: { teacher: true },
  });
  if (!teacherUser) {
    const passwordHash = await bcrypt.hash(password, 10);
    teacherUser = await prisma.user.create({
      data: {
        email: teacherEmail,
        name: "Jane Teacher",
        role: "TEACHER",
        passwordHash,
        teacher: { create: { subject: "General", classes: { connect: { id: klass.id } } } },
      },
      include: { teacher: true },
    });
    console.log(`Created teacher user: ${teacherEmail} / ${password}`);
  }

  let studentUser = await prisma.user.findUnique({
    where: { email: studentEmail },
    include: { student: true },
  });
  if (!studentUser) {
    const passwordHash = await bcrypt.hash(password, 10);
    studentUser = await prisma.user.create({
      data: {
        email: studentEmail,
        name: "Sam Student",
        role: "STUDENT",
        passwordHash,
        student: { create: { classId: klass.id } },
      },
      include: { student: true },
    });
    console.log(`Created student user: ${studentEmail} / ${password}`);
  }
}

async function main() {
  await seedAdmin();
  await seedClassroom();
  console.log("Seed complete. All demo accounts use password: ChangeMe123!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
