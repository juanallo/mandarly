import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TEST_DB_PATH = path.join(process.cwd(), '.data', 'vitest.db');

/**
 * Vitest global setup - runs once before all tests
 * Cleans up the test database and runs migrations
 */
export async function setup() {
  // Ensure .data directory exists
  const dataDir = path.dirname(TEST_DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Remove existing test database for a fresh start
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
    console.log('Cleaned up existing vitest database');
  }

  // Also remove SQLite WAL/journal files if they exist
  for (const ext of ['-wal', '-shm', '-journal']) {
    const walPath = TEST_DB_PATH + ext;
    if (fs.existsSync(walPath)) {
      fs.unlinkSync(walPath);
    }
  }

  // Set the DATABASE_URL for this process and run migrations
  process.env.DATABASE_URL = TEST_DB_PATH;

  console.log('Running database migrations for vitest...');
  execSync('npm run db:migrate', {
    env: { ...process.env, DATABASE_URL: TEST_DB_PATH },
    stdio: 'inherit',
  });
  console.log('Vitest database ready at:', TEST_DB_PATH);
}
