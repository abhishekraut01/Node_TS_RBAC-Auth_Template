
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { ENV } from '../configs/env.js';
import { AppError } from '../utils/AppError.js';

const connectionString = ENV.DATABASE_URL;

if (!connectionString) {
  throw new AppError(500, 'DATABASE_URL environment variable is not set');
}

const pool = new pg.Pool({
  connectionString,
  max: ENV.DB_POOL_SIZE,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (ENV.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
