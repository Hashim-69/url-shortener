import { customAlphabet } from 'nanoid';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

export interface CreateLinkInput {
  userId: number;
  originalUrl: string;
  customSlug?: string;
  title?: string;
  expiresAt?: string;
}

export function createLink(input: CreateLinkInput) {
  const shortCode = input.customSlug || nanoid();

  const existing = db.prepare('SELECT id FROM links WHERE short_code = ?').get(shortCode);
  if (existing) {
    throw new Error('Short code already in use');
  }

  const stmt = db.prepare(`
    INSERT INTO links (user_id, short_code, original_url, title, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    input.userId,
    shortCode,
    input.originalUrl,
    input.title || '',
    input.expiresAt || null
  );

  return {
    id: result.lastInsertRowid,
    shortCode,
    originalUrl: input.originalUrl,
    title: input.title || '',
    expiresAt: input.expiresAt || null,
  };
}

export function getLinksByUser(userId: number) {
  return db.prepare(`
    SELECT l.*, 
      (SELECT COUNT(*) FROM clicks WHERE link_id = l.id) as click_count
    FROM links l 
    WHERE l.user_id = ? 
    ORDER BY l.created_at DESC
  `).all(userId);
}

export function getLinkById(linkId: number, userId: number) {
  return db.prepare(
    'SELECT * FROM links WHERE id = ? AND user_id = ?'
  ).get(linkId, userId) as any;
}

export function getLinkByShortCode(shortCode: string) {
  return db.prepare(
    'SELECT * FROM links WHERE short_code = ? AND is_active = 1'
  ).get(shortCode) as any;
}

export function updateLink(linkId: number, userId: number, updates: { originalUrl?: string; title?: string; expiresAt?: string | null; isActive?: boolean }) {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.originalUrl !== undefined) {
    fields.push('original_url = ?');
    values.push(updates.originalUrl);
  }
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.expiresAt !== undefined) {
    fields.push('expires_at = ?');
    values.push(updates.expiresAt);
  }
  if (updates.isActive !== undefined) {
    fields.push('is_active = ?');
    values.push(updates.isActive ? 1 : 0);
  }

  if (fields.length === 0) return null;

  values.push(linkId, userId);
  db.prepare(
    `UPDATE links SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`
  ).run(...values);

  return getLinkById(linkId, userId);
}

export function deleteLink(linkId: number, userId: number) {
  db.prepare('DELETE FROM clicks WHERE link_id = ?').run(linkId);
  const result = db.prepare('DELETE FROM links WHERE id = ? AND user_id = ?').run(linkId, userId);
  return result.changes > 0;
}

export function generateApiKey(): string {
  return uuidv4();
}
