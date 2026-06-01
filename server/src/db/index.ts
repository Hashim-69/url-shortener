import { Pool } from 'pg';
import { config } from '../config';
import { initSchema } from './schema';

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
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

export async function initializeDb() {
  await initSchema(pool);
}

export default pool;
