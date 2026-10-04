import { prisma } from "@/lib/prisma";

/** The current academic year, falling back to the most recently
 * started one if none is explicitly marked current. */
export async function getCurrentAcademicYear() {
  const current = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  if (current) return current;
  return prisma.academicYear.findFirst({ orderBy: { startDate: "desc" } });
}
