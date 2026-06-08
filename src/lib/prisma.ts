import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Create a new connection pool using your environment variable
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });

// Wrap the pool in the Prisma adapter
const adapter = new PrismaPg(pool);

// Attach it to the global object to prevent connection limits in dev mode
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Initialize the Prisma Client WITH the adapter
export const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;