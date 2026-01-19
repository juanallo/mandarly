# Implementation Plan: Square UI Redesign

**Branch**: `002-square-ui-redesign` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-square-ui-redesign/spec.md`

## Summary

Redesign the AI Task Tracker interface using Square UI design patterns to create a modern, polished task management experience. This is a **presentation layer update only** - no schema changes. Key deliverables include a kanban board layout, collapsible sidebar, enhanced header with breadcrumbs, and improved visual styling for task cards and stats.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Next.js 16  
**Primary Dependencies**: shadcn/ui, Tailwind CSS 4, Radix UI, Lucide React, cmdk  
**Storage**: SQLite via Drizzle ORM (unchanged)  
**Testing**: Vitest (unit/integration), Playwright (e2e)  
**Target Platform**: Web (desktop, tablet, mobile responsive)  
**Project Type**: Next.js App Router web application  
**Performance Goals**: <200ms sidebar toggle, <150ms command palette, <2s dashboard load  
**Constraints**: No schema changes, maintain backward compatibility, WCAG 2.1 AA accessibility  
**Scale/Scope**: ~15 component files to create/modify

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Code Quality** | ✅ PASS | Self-documenting components, consistent patterns, shadcn/ui conventions |
| **II. Testing Standards** | ✅ PASS | Unit tests for new components, integration tests for kanban, 80% coverage target |
| **III. UX Consistency** | ✅ PASS | Square UI design system applied consistently, WCAG 2.1 AA compliance |
| **IV. Performance** | ✅ PASS | Animation targets defined (<200ms), no heavy libraries added |

**Post-Design Re-check**: All principles maintained. No violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/002-square-ui-redesign/
├── plan.md              # This file
├── research.md          # Component analysis and decisions
├── data-model.md        # Schema mapping (no changes)
├── quickstart.md        # Implementation guide
├── contracts/           # Component prop types and API schemas
│   └── api-schema.ts
└── checklists/
    └── requirements.md  # Spec validation checklist
```

### Source Code (components to create/modify)

```text
src/
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx          # MODIFY: Add collapse, sections, profile
│   │   ├── header.tsx           # MODIFY: Add breadcrumbs, actions, avatar
│   │   ├── breadcrumbs.tsx      # NEW: Breadcrumb navigation
│   │   ├── user-nav.tsx         # NEW: User profile in sidebar
│   │   ├── sidebar-toggle.tsx   # NEW: Collapse button
│   │   ├── command-search.tsx   # EXISTING: Already implemented
│   │   └── empty-state.tsx      # EXISTING: No changes
│   ├── dashboard/
│   │   └── stats-card.tsx       # NEW: Stats with trends
│   ├── tasks/
│   │   ├── kanban-board.tsx     # NEW: Kanban container
│   │   ├── kanban-column.tsx    # NEW: Status column
│   │   ├── task-card.tsx        # MODIFY: Enhanced styling
│   │   ├── task-status-badge.tsx # MODIFY: New colors/icons
│   │   └── task-list.tsx        # MODIFY: Add kanban view option
│   └── ui/
│       └── ... (shadcn - no changes)
├── app/
│   ├── page.tsx                 # MODIFY: Use stats-card component
│   ├── tasks/
│   │   └── page.tsx             # MODIFY: Use kanban-board
│   └── layout.tsx               # MODIFY: Pass sidebar state
├── hooks/
│   └── use-sidebar.ts           # NEW: Sidebar collapse state hook
└── lib/
    └── constants.ts             # MODIFY: Add status color config

tests/
├── unit/
│   ├── components/
│   │   ├── sidebar.test.tsx     # NEW
│   │   ├── kanban-board.test.tsx # NEW
│   │   └── stats-card.test.tsx  # NEW
│   └── hooks/
│       └── use-sidebar.test.ts  # NEW
└── integration/
    └── kanban.test.ts           # NEW
```

**Structure Decision**: Single Next.js web application. All changes within existing `src/` structure. New components follow existing naming conventions.

## Implementation Phases

### Phase 1: Layout Foundation (P1 User Stories)

**Goal**: Implement enhanced sidebar and header

| Component | Type | Description |
|-----------|------|-------------|
| `use-sidebar.ts` | NEW | Hook for collapse state with localStorage |
| `sidebar-toggle.tsx` | NEW | Collapse/expand button |
| `sidebar.tsx` | MODIFY | Add sections, profile, collapse functionality |
| `breadcrumbs.tsx` | NEW | Path-based breadcrumb navigation |
| `user-nav.tsx` | NEW | User profile dropdown |
| `header.tsx` | MODIFY | Add breadcrumbs, contextual actions |

**Tests Required**:
- Sidebar collapse/expand behavior
- Sidebar state persistence in localStorage
- Breadcrumb generation from pathname
- Header contextual actions rendering

### Phase 2: Kanban Board (P1 User Story)

**Goal**: Implement kanban layout for tasks

| Component | Type | Description |
|-----------|------|-------------|
| `kanban-board.tsx` | NEW | Container with horizontal scroll |
| `kanban-column.tsx` | NEW | Status column with header and tasks |
| `task-list.tsx` | MODIFY | Add kanban view toggle |
| `tasks/page.tsx` | MODIFY | Integrate kanban board |

**Tests Required**:
- Tasks grouped by status in columns
- Column headers show correct counts
- Empty columns render with message
- Column scrolling for overflow

### Phase 3: Enhanced Cards (P2 User Stories)

**Goal**: Improve visual design of cards

| Component | Type | Description |
|-----------|------|-------------|
| `stats-card.tsx` | NEW | Dashboard stats with trends |
| `task-card.tsx` | MODIFY | Enhanced styling, badges |
| `task-status-badge.tsx` | MODIFY | New color scheme, icons |
| `page.tsx` (dashboard) | MODIFY | Use stats-card component |
| `constants.ts` | MODIFY | Status color configuration |

**Tests Required**:
- Stats card trend calculation
- Task card displays all fields correctly
- Status badge colors match spec

### Phase 4: Responsive & Polish (P3)

**Goal**: Mobile support and final polish

| Component | Type | Description |
|-----------|------|-------------|
| `sidebar.tsx` | MODIFY | Mobile drawer behavior |
| `header.tsx` | MODIFY | Hamburger menu for mobile |
| CSS globals | MODIFY | Responsive breakpoints |

**Tests Required**:
- Mobile sidebar drawer opens/closes
- Responsive layout at all breakpoints
- Keyboard navigation (Cmd+K)

## Complexity Tracking

> No constitution violations requiring justification.

| Decision | Rationale |
|----------|-----------|
| Custom kanban vs library | Simpler, no drag-drop needed, fewer dependencies |
| localStorage for sidebar | Client-only state, no server persistence needed |
| Inline kanban columns | 6 fixed statuses, no dynamic columns needed |

## Design References

- **Tasks Dashboard**: https://square-ui-tasks.vercel.app/
- **Task Management**: https://square-ui-task-management.vercel.app/
- **Source Components**: https://github.com/ln-dev7/square-ui/tree/master/templates/tasks/components

## Related Artifacts

| Document | Purpose |
|----------|---------|
| [research.md](./research.md) | Component analysis and technology decisions |
| [data-model.md](./data-model.md) | Schema mapping (confirms no changes) |
| [quickstart.md](./quickstart.md) | Step-by-step implementation guide |
| [contracts/api-schema.ts](./contracts/api-schema.ts) | Component props and API types |

## Next Steps

Run `/speckit.tasks` to generate the task breakdown from this plan.
