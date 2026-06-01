import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import db from '../db';

export interface AuthRequest extends Request {
  userId?: number;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'No authorization header' });
    return;
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  const user = db.prepare('SELECT id, api_key FROM users WHERE api_key = ?').get(token) as { id: number; api_key: string } | undefined;
  if (user) {
    req.userId = user.id;
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token or API key' });
  }
}
