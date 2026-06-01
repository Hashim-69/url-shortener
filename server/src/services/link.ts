import { customAlphabet } from 'nanoid';
import { query } from '../db';
import { v4 as uuidv4 } from 'uuid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

export interface CreateLinkInput {
  userId: number;
  originalUrl: string;
  customSlug?: string;
  title?: string;
  expiresAt?: string;
}

export async function createLink(input: CreateLinkInput) {
  const shortCode = input.customSlug || nanoid();

  const existing = await query('SELECT id FROM links WHERE short_code = $1', [shortCode]);
  if (existing.rows.length > 0) {
    throw new Error('Short code already in use');
  }

  const result = await query(
    `INSERT INTO links (user_id, short_code, original_url, title, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, short_code, original_url, title, expires_at`,
    [input.userId, shortCode, input.originalUrl, input.title || '', input.expiresAt || null]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    shortCode: row.short_code,
    originalUrl: row.original_url,
    title: row.title,
    expiresAt: row.expires_at ? row.expires_at.toISOString() : null,
  };
}

export async function getLinksByUser(userId: number) {
  const result = await query(
    `SELECT l.*,
      (SELECT COUNT(*) FROM clicks WHERE link_id = l.id) as click_count
     FROM links l
     WHERE l.user_id = $1
     ORDER BY l.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getLinkById(linkId: number, userId: number) {
  const result = await query(
    'SELECT * FROM links WHERE id = $1 AND user_id = $2',
    [linkId, userId]
  );
  return result.rows[0] || null;
}

export async function getLinkByShortCode(shortCode: string) {
  const result = await query(
    'SELECT * FROM links WHERE short_code = $1 AND is_active = 1',
    [shortCode]
  );
  return result.rows[0] || null;
}

export async function updateLink(linkId: number, userId: number, updates: {
  originalUrl?: string;
  title?: string;
  expiresAt?: string | null;
  isActive?: boolean;
}) {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.originalUrl !== undefined) {
    fields.push(`original_url = $${paramIndex++}`);
    values.push(updates.originalUrl);
  }
  if (updates.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(updates.title);
  }
  if (updates.expiresAt !== undefined) {
    fields.push(`expires_at = $${paramIndex++}`);
    values.push(updates.expiresAt);
  }
  if (updates.isActive !== undefined) {
    fields.push(`is_active = $${paramIndex++}`);
    values.push(updates.isActive ? 1 : 0);
  }

  if (fields.length === 0) return null;

  values.push(linkId, userId);
  await query(
    `UPDATE links SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex}`,
    values
  );

  return getLinkById(linkId, userId);
}

export async function deleteLink(linkId: number, userId: number) {
  await query('DELETE FROM clicks WHERE link_id = $1', [linkId]);
  const result = await query('DELETE FROM links WHERE id = $1 AND user_id = $2', [linkId, userId]);
  return result.rowCount !== null && result.rowCount > 0;
}

export function generateApiKey(): string {
  return uuidv4();
}
