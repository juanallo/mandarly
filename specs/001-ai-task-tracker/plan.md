# Implementation Plan: AI Task Tracker

**Branch**: `001-ai-task-tracker` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-task-tracker/spec.md`

## Summary

Build a Next.js web application to track AI-assisted projects and tasks across multiple environments (local, worktree, remote). The application uses shadcn/ui with Indie UI components for a modern, accessible interface. Local storage via SQLite provides persistence without external database dependencies. Tasks can be configured with different AI vendors and execution environments, re-run with modifications, and organized into projects.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Framework**: Next.js 14+ (App Router)  
**UI Library**: shadcn/ui + Indie UI components + Tailwind CSS  
**Primary Dependencies**: 
- `next` - React framework
- `shadcn/ui` - UI component library (via npx shadcn-ui)
- `@tanstack/react-query` - Server state management
- `zod` - Schema validation
- `react-hook-form` - Form handling
- `drizzle-orm` + `better-sqlite3` - Local SQLite database
- `lucide-react` - Icons

**Storage**: SQLite (local file-based via better-sqlite3)  
**Testing**: Vitest (unit), Playwright (e2e), Testing Library (components)  
**Target Platform**: Web (Desktop-first, responsive)  
**Project Type**: Web application (single Next.js project)  
**Performance Goals**: 
- Page load < 2s
- Task list render < 100ms for 100 tasks
- Search results < 200ms
**Constraints**: 
- Local-first (no cloud dependency)
- Single user
- Full PWA with service worker for offline capability (works offline after initial load, caches static assets and API responses)
**Scale/Scope**: 
- 1000+ tasks over time
- 50+ projects
- 10+ configuration presets

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. Code Quality** | ✅ PASS | TypeScript for type safety, ESLint + Prettier for consistency, component-based architecture with separation of concerns |
| **II. Testing Standards** | ✅ PASS | Test-first approach with Vitest (unit), Testing Library (components), Playwright (e2e). Coverage target: 80% |
| **III. UX Consistency** | ✅ PASS | Using shadcn/ui design system + Indie UI for consistent patterns. WCAG 2.1 AA compliance through shadcn's accessible components |
| **IV. Performance Requirements** | ✅ PASS | SQLite for fast local queries, React Query for caching, lazy loading for large lists. Metrics monitored via Next.js analytics |

**All gates pass. Proceeding with design.**

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-task-tracker/
├── plan.md              # This file
├── research.md          # Technology decisions and rationale
├── data-model.md        # Entity definitions and relationships
├── quickstart.md        # Developer setup guide
├── contracts/           # API route schemas
│   └── api-schema.ts    # Zod schemas for all endpoints
└── checklists/
    └── requirements.md  # Spec validation checklist
```

### Source Code (repository root)

```text
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Dashboard (task overview)
│   ├── tasks/
│   │   ├── page.tsx          # Task list view
│   │   ├── [id]/
│   │   │   └── page.tsx      # Task detail view
│   │   └── new/
│   │       └── page.tsx      # Create task form
│   ├── projects/
│   │   ├── page.tsx          # Project list
│   │   └── [id]/
│   │       └── page.tsx      # Project detail with tasks
│   ├── presets/
│   │   └── page.tsx          # Configuration presets
│   └── api/                   # API routes
│       ├── tasks/
│       │   └── route.ts
│       ├── projects/
│       │   └── route.ts
│       └── presets/
│           └── route.ts
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── tasks/
│   │   ├── task-card.tsx
│   │   ├── task-list.tsx
│   │   ├── task-form.tsx
│   │   ├── task-status-badge.tsx
│   │   └── task-filters.tsx
│   ├── projects/
│   │   ├── project-card.tsx
│   │   └── project-selector.tsx
│   ├── presets/
│   │   ├── preset-card.tsx
│   │   └── preset-form.tsx
│   └── layout/
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── empty-state.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema definitions
│   │   ├── client.ts         # Database client
│   │   └── migrations/       # Database migrations
│   ├── api/
│   │   └── client.ts         # API client hooks
│   ├── utils.ts              # Utility functions
│   └── constants.ts          # App constants (status, env types)
├── hooks/
│   ├── use-tasks.ts
│   ├── use-projects.ts
│   └── use-presets.ts
└── types/
    └── index.ts              # Shared TypeScript types

tests/
├── unit/
│   ├── lib/
│   └── components/
├── integration/
│   └── api/
└── e2e/
    ├── tasks.spec.ts
    └── projects.spec.ts
```

**Structure Decision**: Single Next.js project with App Router. All code in `src/` for clarity. SQLite database stored in `.data/` directory (gitignored). Tests mirror source structure.

## Complexity Tracking

No constitution violations. Design follows simplicity principles:
- Single project (not monorepo)
- Local SQLite (not Postgres/external DB)
- No additional patterns beyond React Query for data fetching
