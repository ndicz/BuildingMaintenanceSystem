import { PrismaClient } from "@prisma/client";
import { runtimeUrl } from "./dburl";

// Satu instance Prisma dipakai ulang selama dev server berjalan (hot reload).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const url = process.env.DATABASE_URL;
  return new PrismaClient(url ? { datasources: { db: { url: runtimeUrl(url) } } } : undefined);
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
