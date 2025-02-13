import { PrismaClient } from "@prisma/client";

export function createPrismaClient() {
  const databaseProvider = process.env.DATABASE_PROVIDER || "postgresql";
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return new PrismaClient({
    log: ["warn", "error"],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof createPrismaClient>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? createPrismaClient();

export default prisma;
export { Prisma } from "@prisma/client";

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
