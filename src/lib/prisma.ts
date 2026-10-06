import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { auditExtension } from "@/lib/audit";

function createClient() {
  // DATABASE_URL uses the mysql:// scheme so the Prisma CLI (migrate/config)
  // accepts it, but the underlying `mariadb` driver this adapter wraps only
  // parses its own mariadb:// scheme -- translate just for the adapter.
  const adapterUrl = process.env.DATABASE_URL!.replace(/^mysql:\/\//, "mariadb://");
  const base = new PrismaClient({ adapter: new PrismaMariaDb(adapterUrl) });
  // Every change made by a signed-in person is recorded in AuditLog (src/lib/audit.ts).
  return base.$extends(auditExtension(base));
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
