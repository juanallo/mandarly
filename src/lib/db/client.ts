import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { join, dirname } from 'path';
import { mkdirSync, existsSync } from 'fs';

const dbPath = process.env.DATABASE_URL || join(process.cwd(), '.data', 'tracker.db');

// Ensure the database directory exists
const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
