import { defineConfig, devices } from '@playwright/test';

// Use a separate port for e2e tests to avoid conflicts with local dev server
const E2E_PORT = 3001;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  // Clean up test database before each run
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npx next dev --port ${E2E_PORT}`,
    url: `http://localhost:${E2E_PORT}`,
    reuseExistingServer: !process.env.CI,
    // Use separate database and build directory for e2e tests
    // This allows running e2e tests while dev server is running
    env: {
      DATABASE_URL: '.data/test.db',
      NEXT_DIST_DIR: '.next-e2e',
    },
  },
});
