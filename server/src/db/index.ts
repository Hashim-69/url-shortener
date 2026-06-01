import { Pool } from 'pg';
import { config } from '../config';
import { initSchema } from './schema';

const ssl = config.databaseUrl.includes('supabase.co')
  ? { rejectUnauthorized: false }
  : undefined;

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  ssl,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (config.isProduction && duration > 1000) {
    console.warn('Slow query', { text, duration });
  }
  return res;
}

let dbReady: Promise<void> | null = null;

export async function initializeDb() {
  if (!dbReady) {
    dbReady = initSchema(pool);
  }
  return dbReady;
}

export default pool;
