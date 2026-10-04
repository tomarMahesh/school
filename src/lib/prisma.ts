import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// DATABASE_URL uses the mysql:// scheme so the Prisma CLI (migrate/config)
// accepts it, but the underlying `mariadb` driver this adapter wraps only
// parses its own mariadb:// scheme -- translate just for the adapter.
const adapterUrl = process.env.DATABASE_URL!.replace(/^mysql:\/\//, "mariadb://");
const adapter = new PrismaMariaDb(adapterUrl);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
