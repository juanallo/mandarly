import { defineConfig, devices } from '@playwright/experimental-ct-react';
import path from 'path';

export default defineConfig({
  testDir: './tests/visual/components',
  testMatch: /.*\.test\.vr\.(ts|tsx)$/,
  snapshotPathTemplate: '{testDir}/{testFile}-snapshots/{arg}{ext}',
  
  use: {
    ctPort: 3100,
    ctTemplateDir: './tests/visual',
    ctViteConfig: {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  // Screenshot comparison settings
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100, // Allow small pixel differences
      threshold: 0.2, // 20% color difference tolerance
    },
  },

  // CI optimizations
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // HTML reporter for better CI reports
  reporter: [
    ['html'],
    ['list'],
  ],
});
