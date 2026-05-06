import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? (
  process.env.DATABASE_URL ? new PrismaClient() : undefined as unknown as PrismaClient
);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
