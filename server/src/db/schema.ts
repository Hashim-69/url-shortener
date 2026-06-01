import Database from 'better-sqlite3';

export function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      api_key TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      short_code TEXT UNIQUE NOT NULL,
      original_url TEXT NOT NULL,
      title TEXT DEFAULT '',
      expires_at TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link_id INTEGER NOT NULL,
      ip_address TEXT,
      referrer TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code);
    CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
    CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON clicks(link_id);
    CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON clicks(created_at);
  `);
}
