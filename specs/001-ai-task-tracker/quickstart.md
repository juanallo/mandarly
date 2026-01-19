# Quickstart: AI Task Tracker

**Feature**: 001-ai-task-tracker  
**Date**: 2026-01-18

## Prerequisites

- Node.js 20+ 
- pnpm (recommended) or npm
- Git

## Initial Setup

### 1. Create Next.js Project

```bash
# Create new Next.js app with TypeScript and Tailwind
npx create-next-app@latest ai-task-tracker --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd ai-task-tracker
```

### 2. Install Dependencies

```bash
# Core dependencies
pnpm add @tanstack/react-query zod react-hook-form @hookform/resolvers

# Database
pnpm add drizzle-orm better-sqlite3 @paralleldrive/cuid2
pnpm add -D drizzle-kit @types/better-sqlite3

# UI
pnpm add lucide-react class-variance-authority clsx tailwind-merge

# Dev dependencies
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
pnpm add -D playwright @playwright/test
```

### 3. Initialize shadcn/ui

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Select options:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
# - Where is your global CSS file: src/app/globals.css
# - Configure import alias: @/components
# - Configure components.json: Yes

# Add core components
npx shadcn-ui@latest add button input label card dialog sheet table badge tabs command form select textarea separator skeleton tooltip
```

### 4. Add Indie UI Components

Create enhanced button component from Indie UI:

```bash
# Create component files
mkdir -p src/components/ui/indie
```

Copy the Stateful Button from https://ui.indie-starter.dev/ into `src/components/ui/indie/stateful-button.tsx`.

### 5. Database Setup

Create database directory and config:

```bash
mkdir -p .data
echo ".data/" >> .gitignore
```

Create `drizzle.config.ts`:

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: '.data/tracker.db',
  },
} satisfies Config;
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:sqlite",
    "db:migrate": "drizzle-kit push:sqlite",
    "db:studio": "drizzle-kit studio"
  }
}
```

### 6. Project Structure Setup

```bash
# Create directory structure
mkdir -p src/app/api/{tasks,projects,presets}
mkdir -p src/app/{tasks,projects,presets}
mkdir -p src/components/{ui,tasks,projects,presets,layout}
mkdir -p src/lib/{db,api}
mkdir -p src/hooks
mkdir -p src/types
mkdir -p tests/{unit,integration,e2e}
```

### 7. Environment Configuration

Create `.env.local`:

```bash
# Database
DATABASE_URL=".data/tracker.db"

# App
NEXT_PUBLIC_APP_NAME="AI Task Tracker"
```

## Key Files to Create

### Database Schema (`src/lib/db/schema.ts`)

See `data-model.md` for full Drizzle schema.

### API Schemas (`src/lib/api/schemas.ts`)

See `contracts/api-schema.ts` for Zod validation schemas.

### React Query Provider (`src/components/providers.tsx`)

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Root Layout (`src/app/layout.tsx`)

```typescript
import { Providers } from '@/components/providers';
import { Sidebar } from '@/components/layout/sidebar';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
```

## Development Workflow

### Start Development Server

```bash
pnpm dev
```

### Run Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm exec playwright test

# With UI
pnpm exec playwright test --ui
```

### Database Operations

```bash
# Generate migration after schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

## Testing Setup

### Vitest Config (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup (`tests/setup.ts`)

```typescript
import '@testing-library/jest-dom';
```

### Playwright Config (`playwright.config.ts`)

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
});
```

## Component Development Order

1. **Layout** - Sidebar, Header, Empty State
2. **Task List** - Card, List, Status Badge, Filters
3. **Task Form** - Create dialog, Environment selector, AI vendor picker
4. **Task Actions** - Re-run, Status updates
5. **Projects** - List, Card, Selector
6. **Presets** - List, Form, Quick-apply
7. **Dashboard** - Stats, Recent tasks

## Useful Commands

```bash
# Lint
pnpm lint

# Type check
pnpm tsc --noEmit

# Format
pnpm prettier --write .

# Build for production
pnpm build
```

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Indie UI](https://ui.indie-starter.dev/)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui) - Additional components
