# Feature Specification: Mandarly

**Feature Branch**: `001-ai-task-tracker`  
**Created**: 2026-01-18  
**Status**: Draft  
**Input**: User description: "Build an application to track projects and tasks with different AIs. Tasks can run locally, in worktrees, or remote environments. Track status, re-run tasks, and configure execution (env/AI vendor)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View All Active Tasks (Priority: P1)

As a developer working with multiple AI assistants, I want to see all my active tasks across different projects and environments so I can understand what work is in progress and where.

**Why this priority**: This is the core value proposition - without visibility into current tasks, no other functionality is useful. This enables users to regain control over scattered AI work.

**Independent Test**: Can be fully tested by creating several tasks and viewing them in a consolidated list. Delivers immediate value by providing a single source of truth for all AI-assisted work.

**Acceptance Scenarios**:

1. **Given** I have tasks running in multiple environments (local, worktree, remote), **When** I open the task overview, **Then** I see all tasks grouped by project with their current status and environment clearly indicated.
2. **Given** I have no active tasks, **When** I open the task overview, **Then** I see an empty state with guidance on how to create a new task.
3. **Given** a task changes status in a remote environment, **When** I refresh the overview, **Then** the updated status is reflected within 30 seconds.

---

### User Story 2 - Create and Configure a New Task (Priority: P1)

As a developer, I want to create a new task and configure where it runs (environment) and which AI vendor to use, so I can start work with my preferred setup.

**Why this priority**: Creating tasks is essential for populating the tracker. Without task creation, the system has no data to track.

**Independent Test**: Can be tested by creating a task with specific environment and AI vendor settings, then verifying the configuration was saved correctly.

**Acceptance Scenarios**:

1. **Given** I want to start new work, **When** I create a task with a description, **Then** I can select the execution environment (local, worktree, or remote) and the AI vendor to use.
2. **Given** I have previously used configurations, **When** I create a new task, **Then** my recent configurations are suggested for quick selection.
3. **Given** I specify a worktree environment, **When** I create the task, **Then** I can specify the worktree path or select from detected worktrees.
4. **Given** I specify a remote environment, **When** I create the task, **Then** I can provide connection details or select from saved remote configurations.

---

### User Story 3 - Re-run a Previous Task (Priority: P2)

As a developer, I want to re-run a previously completed or failed task so I can retry with the same or modified configuration without re-entering all details.

**Why this priority**: Re-running tasks saves significant time when iterating on AI work or recovering from failures. Depends on having tasks to re-run (P1).

**Independent Test**: Can be tested by completing a task, then re-running it and verifying the original configuration is preserved while allowing modifications.

**Acceptance Scenarios**:

1. **Given** a completed task, **When** I choose to re-run it, **Then** a new task is created with the same description and configuration, allowing me to modify before starting.
2. **Given** a failed task, **When** I choose to re-run it, **Then** I can see what configuration was used and optionally change the AI vendor or environment.
3. **Given** I re-run a task with modifications, **When** the new task starts, **Then** both the original and new task are preserved in history with their respective configurations.

---

### User Story 4 - Track Task Status Changes (Priority: P2)

As a developer, I want tasks to automatically reflect their current status (pending, running, completed, failed, paused) so I always have accurate information without manual updates.

**Why this priority**: Automatic status tracking reduces manual overhead and ensures accuracy. Essential for the system to be trusted as a source of truth.

**Independent Test**: Can be tested by starting a task and observing status transitions from pending through completion or failure.

**Acceptance Scenarios**:

1. **Given** a task is created but not started, **When** I view it, **Then** its status shows as "pending".
2. **Given** a task is actively running, **When** I view the task list, **Then** it shows as "running" with an indication of how long it has been active.
3. **Given** a running task completes successfully, **When** I view it, **Then** its status shows as "completed" with completion timestamp.
4. **Given** a running task encounters an error, **When** the error occurs, **Then** its status shows as "failed" with error details visible.

---

### User Story 5 - Manage Project Organization (Priority: P3)

As a developer with many AI tasks, I want to organize tasks into projects so I can group related work and find tasks more easily.

**Why this priority**: Organization becomes important as task volume grows. Basic functionality works without projects, making this enhancement rather than core.

**Independent Test**: Can be tested by creating a project, adding tasks to it, and verifying tasks appear grouped under the project.

**Acceptance Scenarios**:

1. **Given** I have multiple unrelated tasks, **When** I create a new project, **Then** I can assign existing tasks to it.
2. **Given** a project exists, **When** I create a new task, **Then** I can associate it with that project.
3. **Given** I want to find a specific task, **When** I filter by project, **Then** I see only tasks belonging to that project.

---

### User Story 6 - Save and Reuse Execution Configurations (Priority: P3)

As a developer who frequently uses specific environment/AI combinations, I want to save configurations as presets so I can quickly apply them to new tasks.

**Why this priority**: Convenience feature that improves efficiency for power users. Core functionality works without presets.

**Independent Test**: Can be tested by saving a configuration preset and applying it to a new task.

**Acceptance Scenarios**:

1. **Given** I have a frequently used configuration, **When** I save it as a preset with a name, **Then** it appears in my list of saved configurations.
2. **Given** I have saved presets, **When** I create a new task, **Then** I can select a preset to auto-fill environment and AI vendor settings.
3. **Given** I want to update a preset, **When** I edit it, **Then** future tasks using that preset reflect the updated settings.

---

### Edge Cases

- What happens when a remote environment becomes unreachable during task execution?
  - The task status should change to "disconnected" with last known state, and retry options should be available when connection is restored.
  
- How does the system handle a worktree that no longer exists?
  - The task should be marked with a "stale environment" warning, and the user should be prompted to update the environment configuration or archive the task.
  
- What happens when an AI vendor specified in a configuration is no longer available?
  - The system should notify the user and suggest alternative available models while preserving the original configuration for reference.
  
- How are concurrent tasks in the same environment handled?
  - Each task is tracked independently. The system SHOULD warn when multiple running tasks target the same environment AND the same branch (or no branch specified), but allow the user to proceed. Tasks on different branches in the same environment do not trigger a warning.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create tasks with a description, execution environment (local/worktree/remote), and AI vendor selection.
- **FR-002**: System MUST track task status with states: pending, running, completed, failed, paused, and disconnected.
- **FR-003**: System MUST display all tasks in a consolidated view with filtering and sorting capabilities.
- **FR-004**: System MUST allow users to re-run any existing task, creating a new task instance with the original or modified configuration.
- **FR-005**: System MUST persist task history including configuration used, timestamps, and status transitions.
- **FR-006**: System MUST support three execution environment types: local (same machine), worktree (git worktree path), and remote (network-accessible environment).
- **FR-007**: System MUST allow users to organize tasks into projects for grouping related work.
- **FR-008**: System MUST allow users to save execution configurations as reusable presets.
- **FR-009**: System MUST allow users to manually update task status via UI controls (start, complete, fail, pause).
- **FR-010**: System MUST retain task history and configurations indefinitely (no auto-deletion). Users MAY manually delete individual tasks or projects.
- **FR-011**: System MUST allow users to configure remote environment details (host/label only; no credentials stored).
- **FR-012**: System MUST provide search functionality across task descriptions and project names.
- **FR-013**: System MUST allow users to export tasks and projects as a structured JSON file for backup and migration.

### Key Entities

- **Project**: A collection of related tasks. Has a name, description, and creation date. Contains zero or more tasks.

- **Task**: An individual unit of work with an AI assistant. Has a description, current status, creation/completion timestamps, associated project (optional), and execution configuration.

- **Execution Configuration**: Defines how a task runs. Includes environment type (local/worktree/remote), environment-specific details (path for worktree, connection info for remote), and selected AI vendor.

- **Configuration Preset**: A saved execution configuration that can be reused. Has a user-defined name and the full configuration details.

- **Status History**: A log of status changes for a task, including timestamp and any relevant details (error messages for failures, duration for completions).

- **AI Vendor**: Represents an AI tool/assistant (e.g., Claude, Cursor, Copilot, Gemini). Tracks which AI assistant was used for the task.

## Clarifications

### Session 2026-01-18

- Q: How are tasks created? → A: Manual entry only - users explicitly create each task in the app.
- Q: How are task status changes detected? → A: Manual only - user clicks to update status (start, complete, fail, pause).
- Q: Should users be able to export task history? → A: Yes, JSON export for tasks/projects.
- Q: What happens to task data after 90 days? → A: Keep forever - no auto-deletion, users can manually delete.
- Q: What remote credentials should be stored? → A: None - store only host/label for reference, no auth details.

## Assumptions

- Task creation is manual only; the system does not auto-detect or import tasks from AI tools.
- Users are developers familiar with concepts like git worktrees and remote development environments.
- AI vendor availability is determined by user-provided API keys or existing tool integrations.
- The system focuses on tracking and configuration; actual AI interactions happen through existing tools/IDEs.
- A single user uses the system (no multi-user collaboration in initial scope).
- Local storage is acceptable for MVP; no cloud sync required initially.

## Onboarding & First-Use Experience

To achieve high first-use success rates, the application MUST provide contextual guidance:

- **OB-001**: Empty states MUST include clear calls-to-action guiding users to create their first task or project.
- **OB-002**: The task creation form MUST include inline help text explaining environment types and AI vendor options.
- **OB-003**: First-time users SHOULD see a brief onboarding tooltip tour highlighting key features (dashboard, create task, projects).
- **OB-004**: All form fields MUST have placeholder text or examples demonstrating expected input format.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new task with full configuration in under 60 seconds.
- **SC-002**: Users can view the status of all active tasks across all environments in a single view within 5 seconds of opening the application.
- **SC-003**: Task status updates are reflected in the interface within 30 seconds of the actual status change.
- **SC-004**: Users can re-run a previous task with modified configuration in under 30 seconds.
- **SC-005**: Users can find a specific task from a history of 100+ tasks in under 10 seconds using search or filters.
- **SC-006**: 90% of users can successfully create and track their first task without documentation on first use.
- **SC-007**: Configuration presets reduce task creation time by at least 50% compared to manual configuration.
