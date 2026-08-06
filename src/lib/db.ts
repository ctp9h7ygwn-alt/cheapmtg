import { Pool, QueryResultRow } from 'pg';

const globalForDb = global as unknown as { dbPool: Pool };

export const pool =
  globalForDb.dbPool ||
  new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      'postgres://postgres:postgres@localhost:5432/cheapmtg',
    max: 10,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.dbPool = pool;
}

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  return res;
}

