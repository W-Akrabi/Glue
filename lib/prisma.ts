import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const libsql = createClient({
  url: `file:${process.cwd()}/prisma/dev.db`,
});

const adapter = new PrismaLibSql(libsql);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter } as any);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
