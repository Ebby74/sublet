import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || '';

  if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    return createPostgresClient(databaseUrl);
  }

  if (databaseUrl.startsWith('file:')) {
    return createSqliteClient(databaseUrl);
  }

  throw new Error(
    'DATABASE_URL must start with "postgresql://", "postgres://", or "file:". ' +
    `Got: "${databaseUrl || '(empty)'}"`
  );
}

function createPostgresClient(databaseUrl: string): PrismaClient {
  const { PrismaPg } = require('@prisma/adapter-pg');
  const { Pool } = require('pg');

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

function createSqliteClient(databaseUrl: string): PrismaClient {
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const Database = require('better-sqlite3');

  const dbPath = databaseUrl.replace('file:', '');
  const sqlite = new Database(dbPath);
  const adapter = new PrismaBetterSqlite3(sqlite);

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
