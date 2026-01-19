# Research: AI Task Tracker

**Feature**: 001-ai-task-tracker  
**Date**: 2026-01-18

## Technology Decisions

### 1. Framework: Next.js 14+ with App Router

**Decision**: Use Next.js 14+ with the App Router and React Server Components.

**Rationale**:
- Modern React patterns with Server Components for better performance
- Built-in routing with file-based App Router
- API routes co-located with the app
- Excellent TypeScript support
- Large ecosystem and community support
- Server Actions for form handling (optional)

**Alternatives Considered**:
- **Vite + React**: Simpler setup but requires additional routing configuration. No built-in API routes.
- **Remix**: Similar capabilities but smaller ecosystem. Would work well for this use case.
- **SvelteKit**: Great performance but different paradigm; team more familiar with React.

---

### 2. UI Components: shadcn/ui + Indie UI

**Decision**: Use shadcn/ui as the base component library with Indie UI for enhanced components and animations.

**Rationale**:
- shadcn/ui provides accessible, customizable components that we own (copy-paste, not npm dependency)
- Indie UI (https://ui.indie-starter.dev/) adds polished variants with animations:
  - Eye-catching buttons with shimmer effects
  - Stateful buttons for async operations
  - Modern card designs
  - Text animations for empty states
  - Loader components for async feedback
- Both built on Radix UI primitives ensuring accessibility
- Tailwind CSS for consistent styling
- Components can be modified without dependency constraints

**Key Components to Use**:

From **shadcn/ui**:
- `Button`, `Input`, `Select`, `Dialog`, `Sheet`
- `Table` for task lists
- `Form` with react-hook-form integration
- `Command` for search
- `Badge` for status indicators
- `Card` for task/project cards
- `Tabs` for view switching
- `Tooltip` for help text

From **Indie UI**:
- **Stateful Button**: For task actions (re-run, save) with loading/success/error states
- **Enhanced Cards**: Multi-layer cards for projects, cards with patterns for presets
- **Text Loader**: "Preparing..." states when loading
- **Separator** with section labels
- **Dots Loader**: For inline loading states

From **awesome-shadcn-ui** (if needed):
- `shadcn-timeline` - For task status history visualization
- `emblor` - Tag input for task labels
- `shadcn-calendar-component` - Date filtering

**Alternatives Considered**:
- **Material UI**: Larger bundle, less customizable, different aesthetic
- **Chakra UI**: Good but less modern feel, more opinionated
- **Radix Themes**: Good base but less community components

---

### 3. Database: SQLite with Drizzle ORM

**Decision**: Use SQLite via better-sqlite3 with Drizzle ORM for type-safe database access.

**Rationale**:
- Local-first requirement (no cloud database needed)
- Zero configuration - database is a single file
- Fast for the expected scale (1000s of tasks)
- Drizzle provides:
  - Type-safe queries
  - Migration support
  - Schema-first design
  - Lightweight (no heavy runtime)
- Works in Next.js API routes

**Alternatives Considered**:
- **PostgreSQL**: Overkill for single-user local app, requires running a server
- **Prisma**: Heavier ORM with more abstractions than needed
- **IndexedDB**: Browser-only, can't use in API routes
- **JSON files**: No query capabilities, poor for relational data

---

### 4. State Management: React Query (TanStack Query)

**Decision**: Use TanStack React Query for server state management.

**Rationale**:
- Excellent caching and invalidation for API data
- Optimistic updates for responsive UI
- Automatic background refetching
- Built-in loading/error states
- Works perfectly with Next.js App Router

**Alternatives Considered**:
- **SWR**: Similar but less features for mutations
- **Zustand**: Good for client state but not optimized for server state
- **Redux Toolkit Query**: More complex setup than needed

---

### 5. Form Handling: React Hook Form + Zod

**Decision**: Use React Hook Form with Zod for validation.

**Rationale**:
- Performant (minimal re-renders)
- First-class TypeScript support
- Zod schemas reusable for API validation
- shadcn/ui Form component built on react-hook-form
- Built-in integration with shadcn components

**Alternatives Considered**:
- **Formik**: More verbose, less performant
- **Native forms**: Less type safety, more boilerplate

---

### 6. Testing Strategy

**Decision**: Three-tier testing approach with Vitest, Testing Library, and Playwright.

**Rationale**:
- **Vitest**: Fast, Vite-compatible, excellent TypeScript support for unit tests
- **Testing Library**: Best practices for component testing (user-centric)
- **Playwright**: Reliable e2e testing with good debugging

**Test Coverage Targets**:
- Unit tests: lib/, hooks/, utils (80%+ coverage)
- Component tests: Critical UI components
- E2E tests: P1 user journeys (view tasks, create task, re-run task)

---

## Component Mapping

| Feature | shadcn/ui Component | Indie UI Enhancement | Notes |
|---------|---------------------|---------------------|-------|
| Task list | Table, Card | Cards with pattern | Filterable, sortable |
| Task status | Badge | - | Color-coded by status |
| Create task | Form, Dialog | Stateful Button | Multi-step with vendor & preset selection |
| Re-run task | Button, Sheet | Stateful Button | Side panel with config |
| Search | Command | - | Cmd+K shortcut |
| Projects | Card | Multi-layer Cards | Expandable with task count |
| Presets | Card | Cards with pattern | Quick-apply buttons |
| Empty states | - | Text Animation | Engaging onboarding |
| Loading | Skeleton | Dots Loader, Text Loader | Context-appropriate |
| Navigation | - | Sidebar pattern | Collapsible |

---

## Environment Configuration

**AI Vendors (predefined list)**:
- **Claude** - Anthropic Claude (via API, Claude.ai, Claude Code)
- **ChatGPT** - OpenAI ChatGPT
- **Gemini** - Google Gemini
- **Cursor** - Cursor IDE with AI
- **Copilot** - GitHub Copilot
- **Windsurf** - Codeium Windsurf
- **Cody** - Sourcegraph Cody
- **Aider** - Aider CLI tool
- **Other** - Custom/other AI tools

**Execution Environments**:
- **Local**: Current machine, default terminal
- **Worktree**: Git worktree path (validated)
- **Remote**: SSH connection or URL (stored securely)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| SQLite file corruption | Automatic backups before migrations |
| Large task history slowing UI | Virtual scrolling for lists, pagination |
| Remote env connection failures | Graceful degradation, "disconnected" status |
| Indie UI components not fitting | All components customizable, can modify |
