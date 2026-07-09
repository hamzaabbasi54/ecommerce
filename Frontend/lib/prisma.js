import { PrismaClient } from '@prisma/client';

// In development, Next.js hot-reloads and re-runs files on every save.
// Without this guard, each reload creates a NEW PrismaClient, eventually
// exhausting the database connection pool and crashing.
// We store the client on `globalThis` so it persists across hot reloads.

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
