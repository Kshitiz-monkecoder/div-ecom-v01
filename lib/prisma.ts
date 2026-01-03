import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Get environment variables - Turso uses TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
// But we'll also check for DATABASE_URL and DATABASE_TOKEN for flexibility
const databaseUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const databaseToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_TOKEN;

if (!databaseUrl) {
  console.error("Environment variables check:");
  console.error("TURSO_DATABASE_URL:", process.env.TURSO_DATABASE_URL ? "✓ Set" : "✗ NOT SET");
  console.error("DATABASE_URL:", process.env.DATABASE_URL ? "✓ Set" : "✗ NOT SET");
  console.error("TURSO_AUTH_TOKEN:", process.env.TURSO_AUTH_TOKEN ? "✓ Set" : "✗ NOT SET");
  console.error("DATABASE_TOKEN:", process.env.DATABASE_TOKEN ? "✓ Set" : "✗ NOT SET");
  throw new Error(
    "Database URL environment variable is not set.\n" +
    "Please ensure you have a .env.local file in the ecom directory with:\n" +
    "TURSO_DATABASE_URL=libsql://your-database-name.turso.io\n" +
    "TURSO_AUTH_TOKEN=your_token_here\n" +
    "OR\n" +
    "DATABASE_URL=libsql://your-database-name.turso.io\n" +
    "DATABASE_TOKEN=your_token_here"
  );
}

// Create Prisma adapter directly with connection config
// PrismaLibSql accepts the config object directly, not a client instance
const adapter = new PrismaLibSql({
  url: databaseUrl,
  authToken: databaseToken || undefined,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with adapter
// In Prisma 7, when using an adapter, we pass the adapter to PrismaClient
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

