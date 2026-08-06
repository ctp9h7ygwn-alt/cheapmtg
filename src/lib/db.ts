import { Pool, QueryResultRow } from 'pg';

const globalForDb = global as unknown as { dbPool: Pool };

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  'postgres://postgres:postgres@localhost:5432/cheapmtg';

const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

export const pool =
  globalForDb.dbPool ||
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.dbPool = pool;
}

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]) {
  const hasDbEnv =
    !!process.env.DATABASE_URL ||
    !!process.env.POSTGRES_URL ||
    !!process.env.POSTGRES_PRISMA_URL ||
    !!process.env.POSTGRES_URL_NON_POOLING;

  if (process.env.VERCEL && !hasDbEnv) {
    console.warn('Database environment variable not set on Vercel build step.');
    return { rows: [] } as any;
  }

  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  return res;
}

