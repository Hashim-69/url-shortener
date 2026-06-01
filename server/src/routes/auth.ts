import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db';
import { config } from '../config';
import { generateApiKey } from '../services/link';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', (req: AuthRequest, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: 'Email, password, and name are required' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const apiKey = generateApiKey();

  const result = db.prepare(
    'INSERT INTO users (email, password_hash, name, api_key) VALUES (?, ?, ?, ?)'
  ).run(email, passwordHash, name, apiKey);

  const token = jwt.sign({ userId: result.lastInsertRowid }, config.jwtSecret, { expiresIn: '7d' });

  res.status(201).json({
    token,
    apiKey,
    user: { id: result.lastInsertRowid, email, name },
  });
});

router.post('/login', (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });

  res.json({
    token,
    apiKey: user.api_key,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = db.prepare('SELECT id, email, name, api_key, created_at FROM users WHERE id = ?').get(req.userId) as any;
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
});

router.get('/keys', authenticate, (req: AuthRequest, res: Response) => {
  const user = db.prepare('SELECT api_key FROM users WHERE id = ?').get(req.userId) as any;
  res.json({ apiKey: user.api_key });
});

router.post('/keys/regenerate', authenticate, (req: AuthRequest, res: Response) => {
  const newKey = generateApiKey();
  db.prepare('UPDATE users SET api_key = ? WHERE id = ?').run(newKey, req.userId);
  res.json({ apiKey: newKey });
});

export default router;
