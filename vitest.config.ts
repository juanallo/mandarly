import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globalSetup: ['./tests/global-setup.ts'],
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx', 'tests/integration/**/*.test.ts'],
    // Use separate database for vitest tests
    env: {
      DATABASE_URL: '.data/vitest.db',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],  // Only consider src files
      exclude: [
        'src/components/ui/**',         // shadcn components (pre-tested library code)
        'src/app/**',                   // Next.js pages/routes (covered by E2E tests)
        'src/lib/db/**',                // DB layer (covered by integration tests)
        'src/components/providers.tsx', // React Query wrapper
        'src/types/**',                 // Type definitions only
        'src/components/layout/**',     // Layout components (presentational, E2E tested)
        'src/components/presets/**',    // Preset components (presentational)
        'src/components/projects/project-card.tsx',  // Presentational card
        'src/components/projects/project-form.tsx',  // Form component
        'src/components/tasks/status-history-timeline.tsx', // Presentational timeline
        'src/components/tasks/task-filters.tsx',     // Presentational filter UI
        'src/components/tasks/task-list.tsx',        // Presentational list
        'src/hooks/**',                 // React Query hooks (API wrappers)
        'src/lib/constants.ts',         // Constants only, no logic
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
