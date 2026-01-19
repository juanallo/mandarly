import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Playwright global setup - runs once before all tests
 * Cleans up the test database and runs migrations to ensure a fresh state
 */
export default async function globalSetup() {
  const testDbPath = path.join(process.cwd(), '.data', 'test.db');

  // Ensure .data directory exists
  const dataDir = path.dirname(testDbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Remove existing test database for a fresh start
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
    console.log('Cleaned up existing test database');
  }

  // Also remove SQLite WAL/journal files if they exist
  for (const ext of ['-wal', '-shm', '-journal']) {
    const walPath = testDbPath + ext;
    if (fs.existsSync(walPath)) {
      fs.unlinkSync(walPath);
    }
  }

  // Run migrations to create tables in the test database
  console.log('Running migrations on test database...');
  execSync('npm run db:migrate', {
    env: { ...process.env, DATABASE_URL: testDbPath },
    stdio: 'inherit',
  });

  console.log('Test database ready at:', testDbPath);
}
