import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  const appEnv = process.env.APP_ENV || "development";
  const factory = new PrismaMariaDb(process.env.DATABASE_URL!);

  const logLevels: Array<"query" | "info" | "warn" | "error"> =
    appEnv === "production"
      ? ["error"]
      : appEnv === "staging"
        ? ["error", "warn"]
        : ["query", "info", "warn", "error"];

  prismaInstance = new PrismaClient({
    adapter: factory,
    log: logLevels,
  });

  if (appEnv !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }
}

export const prisma = prismaInstance;
