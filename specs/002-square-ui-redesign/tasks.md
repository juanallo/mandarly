# Tasks: Square UI Redesign

**Input**: Design documents from `/specs/002-square-ui-redesign/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Unit and integration tests included per constitution requirements (80% coverage target).

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5, US6)
- Include exact file paths in descriptions

## Path Conventions

- **Single Next.js app**: `src/` at repository root
- **Components**: `src/components/`
- **Hooks**: `src/hooks/`
- **Pages**: `src/app/`
- **Tests**: `tests/unit/`, `tests/integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project configuration and shared utilities

- [X] T001 Create STATUS_CONFIG with colors, icons, labels for all 6 statuses in src/lib/constants.ts
- [X] T002 [P] Verify all existing dependencies are sufficient (no new packages needed)

---

## Phase 2: Foundational (Layout Components - Blocking)

**Purpose**: Core layout infrastructure that ALL pages depend on. MUST complete before user story work.

**⚠️ CRITICAL**: User Stories 1, 4, 5 cannot be fully tested until layout is in place.

### Sidebar Collapse Hook

- [X] T004 Create use-sidebar hook with localStorage persistence in src/hooks/use-sidebar.ts
- [X] T005 [P] Write unit test for use-sidebar hook in tests/unit/hooks/use-sidebar.test.ts

### Layout Integration

- [X] T006 Update root layout to use sidebar state in src/app/layout.tsx
- [X] T007 Add CSS variables for sidebar widths (expanded: 256px, collapsed: 64px) in src/app/globals.css

**Checkpoint**: Foundation ready - sidebar state management available globally

---

## Phase 3: User Story 2 - Enhanced Left Pane Sidebar (Priority: P1) 🎯 MVP

**Goal**: Modern collapsible sidebar with workspace branding, navigation sections, and user profile

**Independent Test**: Navigate between pages and toggle sidebar collapse. Verify tooltip on collapsed icons.

### Tests for User Story 2

- [X] T008 [P] [US2] Write unit test for sidebar collapse/expand behavior in tests/unit/components/sidebar.test.tsx
- [X] T009 [P] [US2] Write unit test for sidebar-toggle button in tests/unit/components/sidebar-toggle.test.tsx

### Implementation for User Story 2

- [X] T010 [P] [US2] Create sidebar-toggle component in src/components/layout/sidebar-toggle.tsx
- [X] T011 [P] [US2] Create user-nav component for bottom profile section in src/components/layout/user-nav.tsx
- [X] T012 [US2] Enhance sidebar with collapse functionality in src/components/layout/sidebar.tsx
- [X] T013 [US2] Add workspace branding section at top of sidebar in src/components/layout/sidebar.tsx
- [X] T014 [US2] Add grouped navigation sections (Main, Settings) in src/components/layout/sidebar.tsx
- [X] T015 [US2] Add user profile section at bottom using user-nav in src/components/layout/sidebar.tsx
- [X] T016 [US2] Add tooltip on hover for collapsed sidebar items in src/components/layout/sidebar.tsx
- [X] T017 [US2] Add smooth CSS transition animation (200ms) for collapse in src/components/layout/sidebar.tsx
- [X] T017b [US2] Verify sidebar renders correctly at tablet breakpoint (768px)

**Checkpoint**: Sidebar fully functional - collapsible with branding, sections, and profile

---

## Phase 4: User Story 3 - Application Header Bar (Priority: P1)

**Goal**: Persistent header with page title, breadcrumbs, search, and contextual actions

**Independent Test**: Navigate to nested page (e.g., /tasks/123) and verify breadcrumbs show hierarchy.

### Tests for User Story 3

- [X] T018 [P] [US3] Write unit test for breadcrumbs generation in tests/unit/components/breadcrumbs.test.tsx
- [X] T019 [P] [US3] Write unit test for header contextual actions in tests/unit/components/header.test.tsx

### Implementation for User Story 3

- [X] T020 [P] [US3] Create breadcrumbs component in src/components/layout/breadcrumbs.tsx
- [X] T021 [US3] Enhance header with page title display in src/components/layout/header.tsx
- [X] T022 [US3] Add breadcrumb navigation to header in src/components/layout/header.tsx
- [X] T023 [US3] Add search trigger button with keyboard hint (⌘K) in src/components/layout/header.tsx
- [X] T024 [US3] Add contextual action buttons prop to header in src/components/layout/header.tsx
- [X] T025 [US3] Add notification indicator placeholder in src/components/layout/header.tsx
- [X] T026 [US3] Add user avatar to header right side in src/components/layout/header.tsx
- [X] T027 [US3] Update all page components to pass contextual actions to header
- [X] T027b [US3] Verify header layout at mobile breakpoint (640px)

**Checkpoint**: Header fully functional - breadcrumbs, search, actions visible on all pages

---

## Phase 5: User Story 1 - Kanban Board View (Priority: P1)

**Goal**: Tasks displayed in status-based columns with visual cards

**Independent Test**: View tasks page and verify tasks grouped by status in horizontal columns.

### Tests for User Story 1

- [X] T028 [P] [US1] Write unit test for kanban-column component in tests/unit/components/kanban-column.test.tsx
- [X] T029 [P] [US1] Write unit test for kanban-board component in tests/unit/components/kanban-board.test.tsx
- [X] T030 [P] [US1] Write integration test for full kanban board in tests/integration/kanban.test.ts

### Implementation for User Story 1

- [X] T031 [P] [US1] Create kanban-column component in src/components/tasks/kanban-column.tsx
- [X] T032 [US1] Create kanban-board component in src/components/tasks/kanban-board.tsx
- [X] T033 [US1] Add column headers with status name, icon, and count badge in src/components/tasks/kanban-column.tsx
- [X] T034 [US1] Add horizontal scrolling for column overflow in src/components/tasks/kanban-board.tsx
- [X] T035 [US1] Add vertical scrolling within columns for task overflow in src/components/tasks/kanban-column.tsx
- [X] T036 [US1] Add empty state message for columns with zero tasks in src/components/tasks/kanban-column.tsx
- [X] T037 [US1] Update task-list to support kanban view mode in src/components/tasks/task-list.tsx
- [X] T038 [US1] Integrate kanban-board into tasks page in src/app/tasks/page.tsx
- [X] T038b [US1] Verify kanban columns scroll horizontally on narrow viewports

**Checkpoint**: Kanban board fully functional - tasks visible in status columns

---

## Phase 6: User Story 5 - Rich Task Cards (Priority: P2)

**Goal**: Enhanced task cards with color-coded status badges, icons, and improved layout

**Independent Test**: View any task card and verify status badge color, project tag, environment icon visible.

### Tests for User Story 5

- [ ] T039 [P] [US5] Write unit test for task-status-badge colors in tests/unit/components/task-status-badge.test.tsx
- [ ] T040 [P] [US5] Write unit test for enhanced task-card in tests/unit/components/task-card.test.tsx

### Implementation for User Story 5

- [ ] T041 [US5] Update task-status-badge with new color scheme in src/components/tasks/task-status-badge.tsx
- [ ] T042 [US5] Add status icons (Play, Pause, Check, X, Circle) to badges in src/components/tasks/task-status-badge.tsx
- [ ] T043 [US5] Enhance task-card layout with improved spacing in src/components/tasks/task-card.tsx
- [ ] T044 [US5] Add project name as tag/badge on task-card in src/components/tasks/task-card.tsx
- [ ] T045 [US5] Add environment type icon to task-card in src/components/tasks/task-card.tsx
- [ ] T046 [US5] Add AI vendor badge styling to task-card in src/components/tasks/task-card.tsx
- [ ] T047 [US5] Add subtle shadow and hover effect to task-card in src/components/tasks/task-card.tsx

**Checkpoint**: Task cards visually enhanced with all badges and icons

---

## Phase 7: User Story 4 - Dashboard Stats Cards (Priority: P2)

**Goal**: Stats cards with trend indicators comparing to previous period

**Independent Test**: View dashboard and verify stats cards show values with up/down trend arrows.

### Tests for User Story 4

- [ ] T048 [P] [US4] Write unit test for stats-card trend calculation in tests/unit/components/stats-card.test.tsx

### Implementation for User Story 4

- [ ] T049 [US4] Create stats-card component in src/components/dashboard/stats-card.tsx
- [ ] T050 [US4] Add trend indicator (up/down arrow with color) to stats-card in src/components/dashboard/stats-card.tsx
- [ ] T051 [US4] Add comparison text (vs last week) to stats-card in src/components/dashboard/stats-card.tsx
- [ ] T052 [US4] Add skeleton loading state to stats-card in src/components/dashboard/stats-card.tsx
- [ ] T053 [US4] Update dashboard API to include trend data in src/app/api/dashboard/route.ts
- [ ] T054 [US4] Update dashboard page to use stats-card component in src/app/page.tsx
- [ ] T055 [US4] Style stats cards row with responsive grid layout in src/app/page.tsx

**Checkpoint**: Dashboard shows stats with trend indicators

---

## Phase 8: User Story 6 - Command Palette Enhancement (Priority: P3)

**Goal**: Verify command palette works with new design (already implemented)

**Independent Test**: Press Cmd+K, search for task, verify navigation works.

### Implementation for User Story 6

- [ ] T056 [US6] Verify command-search styling matches Square UI design in src/components/layout/command-search.tsx
- [ ] T057 [US6] Add navigation items (Dashboard, Tasks, Projects, Presets) to command results in src/components/layout/command-search.tsx
- [ ] T058 [US6] Ensure keyboard shortcut hint visible in header search button

**Checkpoint**: Command palette fully functional and styled

---

## Phase 9: Responsive & Polish

**Purpose**: Mobile support and final visual polish across all user stories

### Mobile Responsiveness

- [ ] T059 Add mobile drawer behavior to sidebar in src/components/layout/sidebar.tsx
- [ ] T060 Add hamburger menu button to header for mobile in src/components/layout/header.tsx
- [ ] T061 Add responsive breakpoints for tablet/mobile in src/app/globals.css
- [ ] T062 Ensure kanban columns stack or scroll horizontally on mobile in src/components/tasks/kanban-board.tsx

### Visual Polish

- [ ] T063 [P] Verify consistent border-radius (8px cards, 6px badges) across all components
- [ ] T064 [P] Verify consistent shadow usage (shadow-sm base, shadow-md hover)
- [ ] T065 [P] Add smooth page transitions if not present
- [ ] T066 Run full visual review against Square UI reference screenshots

### Final Validation

- [ ] T067 Run full test suite and verify 80% coverage target
- [ ] T068 Run quickstart.md validation checklist
- [ ] T068b Verify all existing features accessible (create task, view task, edit task, projects, presets) - SC-006 regression check
- [ ] T069 Test keyboard navigation (Tab, Enter, Escape, Cmd+K)
- [ ] T070 Verify WCAG 2.1 AA color contrast compliance

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational - BLOCKING)
    ↓
┌───┴───┬───────┬───────┐
↓       ↓       ↓       ↓
Phase 3 Phase 4 Phase 5  (Can run in parallel)
(US2)   (US3)   (US1)
    ↓       ↓       ↓
    └───┬───┴───────┘
        ↓
┌───────┴───────┐
↓               ↓
Phase 6      Phase 7   (Can run in parallel)
(US5)        (US4)
    ↓           ↓
    └─────┬─────┘
          ↓
      Phase 8 (US6)
          ↓
      Phase 9 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US2 (Sidebar) | Phase 2 | Foundation complete |
| US3 (Header) | Phase 2 | Foundation complete |
| US1 (Kanban) | Phase 2 | Foundation complete |
| US5 (Task Cards) | US1 (for context) | Phase 5 complete |
| US4 (Stats Cards) | Phase 2 | Foundation complete |
| US6 (Command) | US2, US3 | Layout complete |

### Parallel Opportunities

**Within Phase 2:**
- T004, T005 can run in parallel

**Within Phase 3 (US2):**
- T008, T009 tests can run in parallel
- T010, T011 components can run in parallel

**Within Phase 4 (US3):**
- T018, T019 tests can run in parallel
- T020 can start immediately

**Within Phase 5 (US1):**
- T028, T029, T030 tests can run in parallel
- T031 can start immediately

**Across Phases:**
- Phase 3, 4, 5 can run in parallel after Phase 2
- Phase 6, 7 can run in parallel after Phase 5

---

## Parallel Example: User Story 1 (Kanban)

```bash
# Launch all tests in parallel:
Task T028: "Write unit test for kanban-column in tests/unit/components/kanban-column.test.tsx"
Task T029: "Write unit test for kanban-board in tests/unit/components/kanban-board.test.tsx"
Task T030: "Write integration test in tests/integration/kanban.test.ts"

# Then launch component creation:
Task T031: "Create kanban-column component in src/components/tasks/kanban-column.tsx"

# After T031 completes:
Task T032: "Create kanban-board component in src/components/tasks/kanban-board.tsx"
```

---

## Implementation Strategy

### MVP First (P1 User Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 2 (Sidebar)
4. Complete Phase 4: User Story 3 (Header)
5. Complete Phase 5: User Story 1 (Kanban)
6. **STOP and VALIDATE**: Test all P1 stories independently
7. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US2 (Sidebar) → Test → Can demo layout
3. Add US3 (Header) → Test → Full navigation experience
4. Add US1 (Kanban) → Test → Core feature complete (MVP!)
5. Add US5 (Task Cards) → Test → Visual polish
6. Add US4 (Stats Cards) → Test → Dashboard enhanced
7. Add US6 + Responsive → Test → Complete feature

### Suggested MVP Scope

**Minimum Viable Product = Phases 1-5 (T001-T038b)**
- Collapsible sidebar with branding
- Header with breadcrumbs and search
- Kanban board view for tasks
- ~40 tasks, independently testable

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No schema changes - all work is presentation layer
