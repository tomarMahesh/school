import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import type { Role } from "../src/generated/prisma/enums";

const PASSWORD = "ChangeMe123!";

async function seedAdmin() {
  const email = "admin@school.local";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  await prisma.user.create({
    data: { email, name: "Site Admin", role: "ADMIN", passwordHash },
  });
  console.log(`Created admin user: ${email} / ${PASSWORD}`);
}

async function seedStaffMember(opts: {
  email: string;
  name: string;
  role: Role;
  designation: string;
  subjects?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: opts.email } });
  if (existing) {
    console.log(`Staff already exists: ${opts.email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  await prisma.user.create({
    data: {
      email: opts.email,
      name: opts.name,
      role: opts.role,
      passwordHash,
      staff: {
        create: {
          designation: opts.designation,
          subjects: opts.subjects,
        },
      },
    },
  });
  console.log(`Created ${opts.role.toLowerCase()} user: ${opts.email} / ${PASSWORD}`);
}

async function seedClassroom() {
  let klass = await prisma.class.findUnique({ where: { name: "Grade 5A" } });
  if (!klass) {
    klass = await prisma.class.create({ data: { name: "Grade 5A" } });
    console.log(`Created class: ${klass.name}`);
  }

  await seedStaffMember({
    email: "principal@school.local",
    name: "Priya Principal",
    role: "PRINCIPAL",
    designation: "Principal",
  });

  await seedStaffMember({
    email: "peon@school.local",
    name: "Raju Peon",
    role: "STAFF",
    designation: "Peon",
  });

  const teacherEmail = "teacher@school.local";
  let teacherUser = await prisma.user.findUnique({ where: { email: teacherEmail } });
  if (!teacherUser) {
    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    teacherUser = await prisma.user.create({
      data: {
        email: teacherEmail,
        name: "Jane Teacher",
        role: "TEACHER",
        passwordHash,
        staff: {
          create: {
            designation: "Mathematics Teacher",
            subjects: "Mathematics",
            classes: { connect: { id: klass.id } },
          },
        },
      },
    });
    console.log(`Created teacher user: ${teacherEmail} / ${PASSWORD}`);
  }

  const studentEmail = "student@school.local";
  const studentUser = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (!studentUser) {
    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    await prisma.user.create({
      data: {
        email: studentEmail,
        name: "Sam Student",
        role: "STUDENT",
        passwordHash,
        student: { create: { classId: klass.id } },
      },
    });
    console.log(`Created student user: ${studentEmail} / ${PASSWORD}`);
  }
}

async function main() {
  await seedAdmin();
  await seedClassroom();
  console.log(`Seed complete. All demo accounts use password: ${PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
