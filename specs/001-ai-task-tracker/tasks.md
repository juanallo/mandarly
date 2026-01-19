# Tasks: AI Task Tracker

**Input**: Design documents from `/specs/001-ai-task-tracker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-schema.ts, quickstart.md

**Tests**: Test-first development per constitution. Tests written before implementation in each user story phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per plan.md

- [X] T001 Create Next.js project with TypeScript, Tailwind, App Router, src directory using create-next-app
- [X] T002 Install core dependencies: @tanstack/react-query, zod, react-hook-form, @hookform/resolvers, lucide-react, class-variance-authority, clsx, tailwind-merge
- [X] T003 [P] Install database dependencies: drizzle-orm, better-sqlite3, @paralleldrive/cuid2, drizzle-kit, @types/better-sqlite3
- [X] T004 [P] Install dev dependencies: vitest, @testing-library/react, @testing-library/jest-dom, jsdom, @playwright/test
- [X] T005 Initialize shadcn/ui with default style and add core components (button, input, label, card, dialog, sheet, table, badge, tabs, command, form, select, textarea, separator, skeleton, tooltip)
- [X] T006 Create directory structure per plan.md: src/app/api/{tasks,projects,presets}, src/components/{ui,tasks,projects,presets,layout}, src/lib/{db,api}, src/hooks, src/types, tests/{unit,integration,e2e}
- [X] T007 [P] Create .data/ directory for SQLite and add to .gitignore
- [X] T008 [P] Create .env.local with DATABASE_URL and NEXT_PUBLIC_APP_NAME

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Create drizzle.config.ts at project root with SQLite configuration pointing to .data/tracker.db
- [X] T010 Create database schema with all entities (projects, tasks, configPresets, statusHistory) in src/lib/db/schema.ts per data-model.md Drizzle schema
- [X] T011 Create database client singleton in src/lib/db/client.ts with better-sqlite3 connection
- [X] T012 Run initial database migration with drizzle-kit push:sqlite
- [X] T013 Create shared TypeScript types in src/types/index.ts exporting Task, Project, ConfigPreset, StatusHistory, EnvironmentConfig types
- [X] T014 Create API schemas by copying contracts/api-schema.ts to src/lib/api/schemas.ts
- [X] T015 Create utility functions (cn helper for classnames) in src/lib/utils.ts
- [X] T016 Create app constants (TaskStatus, EnvironmentType, AIVendor enums) in src/lib/constants.ts
- [X] T017 Create React Query provider component in src/components/providers.tsx with QueryClientProvider
- [X] T018 Create root layout in src/app/layout.tsx with Providers wrapper and basic flex layout structure
- [X] T019 Create Sidebar component in src/components/layout/sidebar.tsx with navigation links to /, /tasks, /projects, /presets
- [X] T020 [P] Create Header component in src/components/layout/header.tsx with app title and search trigger
- [X] T021 [P] Create EmptyState component in src/components/layout/empty-state.tsx for empty list states
- [X] T022 Add package.json scripts for db:generate, db:migrate, db:studio, test, and e2e
- [X] T023 Create vitest.config.ts with coverage thresholds (80% minimum), jsdom environment, and path aliases
- [X] T024 Create playwright.config.ts with webServer configuration and test directory setup
- [X] T025 Create tests/setup.ts with @testing-library/jest-dom imports
- [X] T026 [P] Create GitHub Actions CI workflow in .github/workflows/ci.yml with lint, type-check, test, and coverage gates

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View All Active Tasks (Priority: P1) 🎯 MVP

**Goal**: As a developer, I can see all my active tasks across different projects and environments in a single consolidated view.

**Independent Test**: Create several tasks via database seeding, view dashboard, verify all tasks appear grouped by project with status and environment indicated. Verify empty state when no tasks exist.

### Tests for User Story 1 (Write FIRST, verify they FAIL)

- [X] T027 [P] [US1] Unit test for TaskStatusBadge component in tests/unit/components/task-status-badge.test.tsx
- [X] T028 [P] [US1] Unit test for TaskCard component in tests/unit/components/task-card.test.tsx
- [X] T029 [P] [US1] Integration test for GET /api/tasks endpoint in tests/integration/api/tasks.test.ts
- [X] T030 [US1] Integration test for dashboard data fetching in tests/integration/api/dashboard.test.ts

### Implementation for User Story 1

- [X] T031 [US1] Create TaskStatusBadge component in src/components/tasks/task-status-badge.tsx with color-coded status display
- [X] T032 [P] [US1] Create TaskCard component in src/components/tasks/task-card.tsx displaying description, status, environment, AI vendor, timestamps
- [X] T033 [P] [US1] Create TaskFilters component in src/components/tasks/task-filters.tsx with status, project, environment, AI vendor filter options
- [X] T034 [US1] Create TaskList component in src/components/tasks/task-list.tsx composing TaskCard and TaskFilters with grouping by project
- [X] T035 [US1] Create GET /api/tasks route handler in src/app/api/tasks/route.ts with pagination, filtering, sorting per ListTasksQuery schema
- [X] T036 [US1] Create useTasks hook in src/hooks/use-tasks.ts with React Query for fetching tasks with filters
- [X] T037 [US1] Create GET /api/dashboard route handler in src/app/api/dashboard/route.ts returning DashboardStats (totalTasks, activeTasks, completedToday, tasksByStatus, recentTasks)
- [X] T038 [US1] Create useDashboard hook in src/hooks/use-dashboard.ts with React Query for dashboard stats
- [X] T039 [US1] Create Dashboard page in src/app/page.tsx showing task overview stats, recent tasks, and quick access to task list
- [X] T040 [US1] Create Tasks list page in src/app/tasks/page.tsx with full TaskList component and filtering

**Checkpoint**: User Story 1 complete - can view all tasks in dashboard and list view

---

## Phase 4: User Story 2 - Create and Configure a New Task (Priority: P1) 🎯 MVP

**Goal**: As a developer, I can create a new task specifying description, execution environment (local/worktree/remote), and AI vendor.

**Independent Test**: Open create task form, fill in description, select environment type, configure environment details, select AI vendor, submit. Verify task appears in task list with correct configuration.

### Tests for User Story 2 (Write FIRST, verify they FAIL)

- [X] T041 [P] [US2] Unit test for EnvironmentSelector component in tests/unit/components/environment-selector.test.tsx
- [X] T042 [P] [US2] Unit test for TaskForm validation in tests/unit/components/task-form.test.tsx
- [X] T043 [P] [US2] Integration test for POST /api/tasks endpoint in tests/integration/api/tasks-create.test.ts
- [X] T044 [US2] E2E test for task creation flow in tests/e2e/create-task.spec.ts

### Implementation for User Story 2

- [X] T045 [US2] Create EnvironmentSelector component in src/components/tasks/environment-selector.tsx with local/worktree/remote tabs and type-specific config fields
- [X] T046 [P] [US2] Create AIVendorPicker component in src/components/tasks/ai-vendor-picker.tsx with grid of vendor options (claude, chatgpt, gemini, cursor, copilot, windsurf, cody, aider, other)
- [X] T047 [P] [US2] Create ProjectSelector component in src/components/projects/project-selector.tsx with dropdown to select existing project or none
- [X] T048 [US2] Create TaskForm component in src/components/tasks/task-form.tsx composing description input, EnvironmentSelector, AIVendorPicker, ProjectSelector with react-hook-form and Zod validation
- [X] T049 [US2] Create POST /api/tasks route handler in src/app/api/tasks/route.ts validating CreateTaskRequest, inserting task, creating initial StatusHistory entry
- [X] T050 [US2] Create useCreateTask mutation hook in src/hooks/use-tasks.ts with optimistic update and cache invalidation
- [X] T051 [US2] Create create task page in src/app/tasks/new/page.tsx with TaskForm and success redirect to task detail
- [X] T052 [US2] Add "New Task" button to Sidebar and Tasks page header linking to /tasks/new
- [X] T053 [US2] Create GET /api/tasks/[id] route handler in src/app/api/tasks/[id]/route.ts for fetching single task with project
- [X] T054 [US2] Create task detail page in src/app/tasks/[id]/page.tsx displaying full task information and configuration

**Checkpoint**: User Story 2 complete - can create tasks with full configuration

---

## Phase 5: User Story 3 - Re-run a Previous Task (Priority: P2)

**Goal**: As a developer, I can re-run a completed or failed task, creating a new task with the same or modified configuration.

**Independent Test**: Complete a task, click re-run, verify form pre-populated with original config, modify AI vendor, submit. Verify new task created with parentTaskId referencing original.

### Tests for User Story 3 (Write FIRST, verify they FAIL)

- [X] T055 [P] [US3] Integration test for POST /api/tasks/[id]/rerun endpoint in tests/integration/api/tasks-rerun.test.ts
- [X] T056 [US3] Unit test for RerunTaskSheet pre-fill logic in tests/unit/components/rerun-task-sheet.test.tsx

### Implementation for User Story 3

- [X] T057 [US3] Create RerunTaskSheet component in src/components/tasks/rerun-task-sheet.tsx as slide-over panel with pre-filled TaskForm for modifications
- [X] T058 [US3] Create POST /api/tasks/[id]/rerun route handler in src/app/api/tasks/[id]/rerun/route.ts validating RerunTaskRequest, creating new task with parentTaskId set
- [X] T059 [US3] Create useRerunTask mutation hook in src/hooks/use-tasks.ts with cache invalidation
- [X] T060 [US3] Add "Re-run" button to TaskCard and task detail page that opens RerunTaskSheet
- [X] T061 [US3] Display parent task link on task detail page when task is a re-run (parentTaskId exists)

**Checkpoint**: User Story 3 complete - can re-run any task with modifications

---

## Phase 6: User Story 4 - Track Task Status Changes (Priority: P2)

**Goal**: As a developer, task statuses automatically reflect current state (pending, running, completed, failed, paused, disconnected) with status history tracked.

**Independent Test**: Create task (pending), start it (running), complete it (completed). View status history showing all transitions with timestamps.

### Tests for User Story 4 (Write FIRST, verify they FAIL)

- [X] T062 [P] [US4] Unit test for status state machine transitions in tests/unit/lib/status-transitions.test.ts
- [X] T063 [P] [US4] Integration test for PATCH /api/tasks/[id] status updates in tests/integration/api/tasks-update.test.ts
- [X] T064 [US4] Unit test for TaskStatusActions valid transition display in tests/unit/components/task-status-actions.test.tsx

### Implementation for User Story 4

- [X] T065 [US4] Create status transition validator in src/lib/status-transitions.ts enforcing valid state machine paths
- [X] T066 [US4] Create PATCH /api/tasks/[id] route handler in src/app/api/tasks/[id]/route.ts validating UpdateTaskRequest, validating transition, updating status, creating StatusHistory entry
- [X] T067 [US4] Create useUpdateTask mutation hook in src/hooks/use-tasks.ts with optimistic status update
- [X] T068 [US4] Create TaskStatusActions component in src/components/tasks/task-status-actions.tsx with Start, Complete, Fail, Pause buttons based on current status and valid transitions
- [X] T069 [US4] Create GET /api/tasks/[id]/history route handler in src/app/api/tasks/[id]/history/route.ts returning StatusHistory entries ordered by timestamp
- [X] T070 [US4] Create useTaskHistory hook in src/hooks/use-tasks.ts for fetching status history
- [X] T071 [US4] Create StatusHistoryTimeline component in src/components/tasks/status-history-timeline.tsx displaying status changes with timestamps and messages
- [X] T072 [US4] Add TaskStatusActions and StatusHistoryTimeline to task detail page in src/app/tasks/[id]/page.tsx
- [X] T073 [US4] Update TaskCard to show duration for running tasks (time since startedAt)

**Checkpoint**: User Story 4 complete - can track and view status changes with full history

---

## Phase 7: User Story 5 - Manage Project Organization (Priority: P3)

**Goal**: As a developer, I can organize tasks into projects for grouping related work and easier navigation.

**Independent Test**: Create a project, create tasks assigned to it, filter tasks by project, delete project and verify tasks become unassigned.

### Tests for User Story 5 (Write FIRST, verify they FAIL)

- [X] T074 [P] [US5] Integration test for projects CRUD API in tests/integration/api/projects.test.ts
- [X] T075 [US5] Integration test for project delete with running tasks rejection in tests/integration/api/projects-delete.test.ts

### Implementation for User Story 5

- [X] T076 [US5] Create ProjectCard component in src/components/projects/project-card.tsx showing name, description, task count, active task count
- [X] T077 [P] [US5] Create ProjectForm component in src/components/projects/project-form.tsx with name and description fields using react-hook-form
- [X] T078 [US5] Create GET /api/projects route handler in src/app/api/projects/route.ts returning projects with task counts per ProjectListResponse
- [X] T079 [US5] Create POST /api/projects route handler in src/app/api/projects/route.ts validating CreateProjectRequest
- [X] T080 [US5] Create GET /api/projects/[id] route handler in src/app/api/projects/[id]/route.ts returning project with task counts
- [X] T081 [US5] Create PATCH /api/projects/[id] route handler in src/app/api/projects/[id]/route.ts validating UpdateProjectRequest
- [X] T082 [US5] Create DELETE /api/projects/[id] route handler in src/app/api/projects/[id]/route.ts (sets tasks' projectId to null, prevents delete if running tasks exist)
- [X] T083 [US5] Create useProjects hook in src/hooks/use-projects.ts with list, create, update, delete mutations
- [X] T084 [US5] Create Projects list page in src/app/projects/page.tsx with ProjectCard grid and create dialog
- [X] T085 [US5] Create GET /api/projects/[id]/tasks route handler in src/app/api/projects/[id]/tasks/route.ts returning paginated tasks for project
- [X] T086 [US5] Create Project detail page in src/app/projects/[id]/page.tsx showing project info and task list filtered to project

**Checkpoint**: User Story 5 complete - can create, edit, delete projects and organize tasks

---

## Phase 8: User Story 6 - Save and Reuse Execution Configurations (Priority: P3)

**Goal**: As a developer, I can save environment/AI vendor combinations as presets for quick task creation.

**Independent Test**: Create a preset with worktree environment and Claude AI, create new task, select preset, verify fields auto-populated.

### Tests for User Story 6 (Write FIRST, verify they FAIL)

- [X] T087 [P] [US6] Integration test for presets CRUD API in tests/integration/api/presets.test.ts
- [X] T088 [US6] Unit test for preset auto-fill in TaskForm in tests/unit/components/task-form-preset.test.tsx

### Implementation for User Story 6

- [X] T089 [US6] Create PresetCard component in src/components/presets/preset-card.tsx showing name, environment type, AI vendor with quick-apply button
- [X] T090 [P] [US6] Create PresetForm component in src/components/presets/preset-form.tsx with name, EnvironmentSelector, AIVendorPicker fields
- [X] T091 [US6] Create GET /api/presets route handler in src/app/api/presets/route.ts returning all presets
- [X] T092 [US6] Create POST /api/presets route handler in src/app/api/presets/route.ts validating CreatePresetRequest (unique name)
- [X] T093 [US6] Create GET /api/presets/[id] route handler in src/app/api/presets/[id]/route.ts
- [X] T094 [US6] Create PATCH /api/presets/[id] route handler in src/app/api/presets/[id]/route.ts validating UpdatePresetRequest
- [X] T095 [US6] Create DELETE /api/presets/[id] route handler in src/app/api/presets/[id]/route.ts
- [X] T096 [US6] Create usePresets hook in src/hooks/use-presets.ts with list, create, update, delete mutations
- [X] T097 [US6] Create Presets management page in src/app/presets/page.tsx with PresetCard grid and create dialog
- [X] T098 [US6] Add preset selector to TaskForm in src/components/tasks/task-form.tsx that auto-fills environment and AI vendor when preset selected
- [X] T099 [US6] Add "Save as Preset" button to TaskForm that opens PresetForm dialog with current configuration pre-filled

**Checkpoint**: User Story 6 complete - can save, manage, and apply configuration presets

---

## Phase 9: Edge Case Handling

**Purpose**: Implement robustness for edge cases defined in spec.md

- [X] T100 [P] Create environment validation utility in src/lib/environment-validator.ts to check worktree path existence and remote reachability
- [X] T101 [P] Add "stale environment" warning badge to TaskCard when worktree path no longer exists (G3)
- [X] T102 Add environment re-validation on task detail page load with warning UI and "Update Environment" action
- [X] T103 [P] Create AI vendor availability checker in src/lib/vendor-validator.ts with fallback suggestions (G4)
- [X] T104 Add vendor warning to TaskCard and task detail when configured vendor may be unavailable
- [X] T105 Implement "disconnected" status handling UI with retry button for remote environment tasks (G2)
- [X] T106 Add connection status indicator to TaskCard for remote environment tasks
- [X] T107 Create concurrent task detector in src/lib/concurrent-task-detector.ts checking for running tasks with same environment AND same branch (or no branch)
- [X] T108 Add concurrent task warning banner to task creation form when conflict detected, allowing user to proceed

---

## Phase 10: Onboarding & First-Use Experience

**Purpose**: Achieve SC-006 (90% first-use success without documentation)

- [X] T109 [P] Enhance EmptyState components with clear CTAs per OB-001 (create first task, create first project)
- [X] T110 [P] Add inline help tooltips to EnvironmentSelector explaining local/worktree/remote options (OB-002)
- [X] T111 [P] Add inline help tooltips to AIVendorPicker with brief descriptions of each vendor (OB-002)
- [X] T112 Create OnboardingTour component in src/components/layout/onboarding-tour.tsx using shadcn Dialog for first-time user guidance (OB-003)
- [X] T113 Add localStorage flag to track first-visit and trigger onboarding tour
- [X] T114 Add placeholder text with examples to all form inputs (description, worktree path, remote host) per OB-004

---

## Phase 11: PWA & Offline Support

**Purpose**: Full Progressive Web App with offline capability per plan.md

- [X] T115 Install next-pwa package and configure in next.config.js with service worker generation
- [X] T116 Create public/manifest.json with app name, icons, theme colors, and display mode
- [X] T117 [P] Add PWA meta tags and manifest link to src/app/layout.tsx
- [X] T118 [P] Create app icons (192x192, 512x512) in public/icons/ directory
- [X] T119 Configure service worker caching strategy: cache-first for static assets, network-first for API routes
- [X] T120 Add offline fallback page in src/app/offline/page.tsx for when network unavailable
- [X] T121 Test PWA installation on desktop and mobile browsers

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T122 [P] Implement Command+K search dialog in src/components/layout/command-search.tsx searching tasks and projects
- [X] T123 [P] Add DELETE /api/tasks/[id] route handler in src/app/api/tasks/[id]/route.ts with cascade delete of status history
- [X] T124 [P] Create useDeleteTask mutation hook in src/hooks/use-tasks.ts
- [X] T125 Add delete confirmation dialog and button to task detail page
- [X] T126 [P] Create JSON export endpoint POST /api/export in src/app/api/export/route.ts exporting tasks and projects per FR-013
- [X] T127 Add export button to dashboard or settings area
- [X] T128 Implement loading skeletons for TaskList, ProjectCard, Dashboard using shadcn Skeleton
- [X] T129 [P] Add error boundary and error handling UI for API failures
- [X] T130 [P] Create Indie UI enhanced components directory at src/components/ui/indie/ with StatefulButton from ui.indie-starter.dev
- [X] T131 Replace standard buttons with StatefulButton for async actions (create, save, delete)
- [X] T132 Add responsive design adjustments for mobile/tablet viewports
- [X] T133 Run quickstart.md validation - verify all setup steps work correctly
- [X] T134 Performance review: verify task list renders <100ms for 100 tasks per plan.md requirements

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 and US2 (P1): Can run in parallel after Foundational
  - US3 and US4 (P2): Can run in parallel, may integrate with US1/US2 but independently testable
  - US5 and US6 (P3): Can run in parallel, independently testable
- **Edge Cases (Phase 9)**: Can start after US1-US4, adds robustness (includes concurrent task detection)
- **Onboarding (Phase 10)**: Can start after US1-US2, improves first-use experience
- **PWA (Phase 11)**: Can start after Foundational, independent of user stories
- **Polish (Phase 12)**: Ideally after all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Tasks API read + Dashboard - no dependencies on other stories
- **User Story 2 (P1)**: Tasks API write + Create form - no dependencies on other stories
- **User Story 3 (P2)**: Rerun API - uses task detail from US1/US2 but independently testable
- **User Story 4 (P2)**: Status updates - uses TaskCard from US1 but independently testable
- **User Story 5 (P3)**: Projects CRUD - ProjectSelector used by US2 but can stub initially
- **User Story 6 (P3)**: Presets CRUD - PresetSelector used by US2 but can stub initially

### Test-First Workflow (Per Constitution)

Within each user story phase:
1. Write test tasks FIRST (marked with "Write FIRST, verify they FAIL")
2. Run tests - confirm they fail (Red)
3. Implement production code tasks
4. Run tests - confirm they pass (Green)
5. Refactor if needed

### Within Each User Story

- **Tests FIRST** (write and verify they fail before implementation)
- Components before pages
- API routes before hooks
- Hooks before page integration
- Core implementation before enhancements

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003 + T004 (dependency installs)
- T007 + T008 (config files)

**Phase 2 (Foundational)**:
- T020 + T021 (Header + EmptyState)
- T023 + T024 + T025 (test configs)
- T026 (CI can run in parallel with test setup)

**Phase 3-8 (User Stories)**:
- All test tasks within a story marked [P] can run in parallel
- T032 + T033 (TaskCard + TaskFilters)
- T045 + T046 + T047 (EnvironmentSelector + AIVendorPicker + ProjectSelector)
- T076 + T077 (ProjectCard + ProjectForm)
- T089 + T090 (PresetCard + PresetForm)

**Phase 9 (Edge Cases)**:
- T100 + T101 + T103 (validators and warnings in parallel)

**Phase 10 (Onboarding)**:
- T109 + T110 + T111 (empty states and tooltips in parallel)

**Phase 11 (PWA)**:
- T117 + T118 (meta tags and icons in parallel)

**Phase 12 (Polish)**:
- T122 + T123 + T124 (search, delete API)
- T129 + T130 (error handling, Indie UI)

---

## Parallel Example: Phase 1 Setup

```bash
# Install all dependency groups in parallel:
Task T002: "Install core dependencies"
Task T003: "Install database dependencies" 
Task T004: "Install dev dependencies"

# Create config files in parallel:
Task T007: "Create .data/ directory"
Task T008: "Create .env.local"
```

## Parallel Example: User Story 2 (Test-First)

```bash
# Write all tests in parallel FIRST:
Task T041: "Unit test for EnvironmentSelector"
Task T042: "Unit test for TaskForm validation"
Task T043: "Integration test for POST /api/tasks"

# Then implement components in parallel:
Task T045: "EnvironmentSelector in src/components/tasks/environment-selector.tsx"
Task T046: "AIVendorPicker in src/components/tasks/ai-vendor-picker.tsx"
Task T047: "ProjectSelector in src/components/projects/project-selector.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - includes test infrastructure and CI)
3. Complete Phase 3: User Story 1 (View tasks) - tests first, then implementation
4. Complete Phase 4: User Story 2 (Create tasks) - tests first, then implementation
5. **STOP and VALIDATE**: Run full test suite, verify 80%+ coverage
6. Deploy/demo if ready - users can create and view tasks

### Incremental Delivery

1. Setup + Foundational → Foundation ready (with CI pipeline)
2. Add US1 + US2 → Tests pass → Deploy (MVP: Create and View tasks)
3. Add US3 + US4 → Tests pass → Deploy (Enhanced: Re-run and Status tracking)
4. Add US5 + US6 → Tests pass → Deploy (Full: Projects and Presets)
5. Edge Cases + Onboarding → Deploy (Robust + User-friendly)
6. PWA phase → Deploy (Installable + Offline capable)
7. Polish phase → Final release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (including CI)
2. Once Foundational is done:
   - Developer A: User Story 1 (Task viewing) - tests → implementation
   - Developer B: User Story 2 (Task creation) - tests → implementation
3. Next iteration:
   - Developer A: User Story 3 (Re-run)
   - Developer B: User Story 4 (Status tracking)
4. Final iteration:
   - Developer A: User Story 5 (Projects) + Edge Cases
   - Developer B: User Story 6 (Presets) + Onboarding

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Test-First**: Write tests before implementation per constitution (Red-Green-Refactor)
- **Coverage Gate**: Maintain 80%+ code coverage per constitution requirement
- **CI Pipeline**: All tests must pass in CI before merging
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All file paths are relative to repository root after project creation
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
