import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  const secret = crypto.randomBytes(32).toString('hex');
  const envContent = [
    `PORT=3001`,
    `NODE_ENV=development`,
    `JWT_SECRET=${secret}`,
    `DATABASE_URL=postgresql://postgres:password@localhost:5432/url-shortener`,
    `CORS_ORIGIN=*`,
  ].join('\n') + '\n';
  fs.writeFileSync(envPath, envContent);
  dotenv.config({ path: envPath });
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
  databaseUrl: process.env.DATABASE_URL || '',
  isProduction: process.env.NODE_ENV === 'production',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
