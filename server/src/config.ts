import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  const secret = crypto.randomBytes(32).toString('hex');
  const envContent = `PORT=3001\nJWT_SECRET=${secret}\nDATABASE_PATH=./data/url-shortener.db\n`;
  fs.writeFileSync(envPath, envContent);
  dotenv.config({ path: envPath });
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
  dbPath: path.resolve(__dirname, '..', process.env.DATABASE_PATH || './data/url-shortener.db'),
  isProduction: process.env.NODE_ENV === 'production',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
