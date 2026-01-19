import { expect, afterEach, afterAll } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Close database connection after all tests in a file complete
// This runs in the same process as the tests, ensuring proper cleanup
afterAll(async () => {
  try {
    // Dynamic import to avoid loading if not used
    const clientModule = await import('../src/lib/db/client');
    if (clientModule.sqlite && typeof clientModule.sqlite.close === 'function' && clientModule.sqlite.open) {
      clientModule.sqlite.close();
    }
  } catch {
    // Module not loaded, nothing to close
  }
});
