import { Request, Response, NextFunction } from 'express';

const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    let entry = requestCounts.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      requestCounts.set(key, entry);
    }

    entry.count++;

    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count).toString());

    if (entry.count > maxRequests) {
      res.status(429).json({ error: 'Too many requests, please try again later' });
      return;
    }

    next();
  };
}
