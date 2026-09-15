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

async function seedMasters() {
  const mathematics = await prisma.subject.upsert({
    where: { name: "Mathematics" },
    update: {},
    create: { name: "Mathematics", code: "MATH" },
  });
  await prisma.subject.upsert({
    where: { name: "Science" },
    update: {},
    create: { name: "Science", code: "SCI" },
  });

  const sectionA = await prisma.section.upsert({
    where: { name: "A" },
    update: {},
    create: { name: "A" },
  });

  await prisma.academicYear.upsert({
    where: { name: "2026-2027" },
    update: {},
    create: {
      name: "2026-2027",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-04-30"),
      isCurrent: true,
    },
  });

  console.log("Seeded masters: subjects, section A, academic year 2026-2027");
  return { mathematics, sectionA };
}

async function seedStaffMember(opts: {
  email: string;
  name: string;
  role: Role;
  designation: string;
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
      staff: { create: { designation: opts.designation } },
    },
  });
  console.log(`Created ${opts.role.toLowerCase()} user: ${opts.email} / ${PASSWORD}`);
}

async function seedClassroom(mathematicsId: string, sectionAId: string) {
  let klass = await prisma.class.findUnique({ where: { name: "Grade 5A" } });
  if (!klass) {
    klass = await prisma.class.create({
      data: { name: "Grade 5A", sectionId: sectionAId },
    });
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
  const teacherUser = await prisma.user.findUnique({ where: { email: teacherEmail } });
  if (!teacherUser) {
    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    await prisma.user.create({
      data: {
        email: teacherEmail,
        name: "Jane Teacher",
        role: "TEACHER",
        passwordHash,
        staff: {
          create: {
            designation: "Mathematics Teacher",
            subjects: { connect: { id: mathematicsId } },
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
  const { mathematics, sectionA } = await seedMasters();
  await seedClassroom(mathematics.id, sectionA.id);
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
