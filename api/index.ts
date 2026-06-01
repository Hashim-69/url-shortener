import { initializeDb } from '../server/src/db';

export default async function handler(req: any, res: any) {
  try {
    await initializeDb();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed', details: String(err) });
    return;
  }

  const app = (await import('../server/src/app')).default;
  return app(req, res);
}
