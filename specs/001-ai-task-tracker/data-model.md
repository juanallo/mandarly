# Data Model: Mandarly

**Feature**: 001-ai-task-tracker  
**Date**: 2026-01-18

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     Project     │       │ ConfigPreset    │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ name            │       │ name            │
│ description     │       │ environmentType │
│ createdAt       │       │ environmentConfig│
│ updatedAt       │       │ aiVendor        │
└────────┬────────┘       │ createdAt       │
         │                │ updatedAt       │
         │ 1:N            └────────┬────────┘
         │                         │
         ▼                         │ referenced by
┌─────────────────┐               │
│      Task       │◄──────────────┘
│─────────────────│
│ id (PK)         │
│ description     │
│ status          │
│ projectId (FK)  │──────┐
│ environmentType │      │
│ environmentConfig│     │
│ aiVendor        │      │
│ presetId (FK)   │      │
│ parentTaskId(FK)│──────┤ (re-run reference)
│ createdAt       │      │
│ startedAt       │      │
│ completedAt     │      │
│ errorMessage    │      │
└────────┬────────┘      │
         │               │
         │ 1:N           │
         ▼               │
┌─────────────────┐      │
│  StatusHistory  │      │
│─────────────────│      │
│ id (PK)         │      │
│ taskId (FK)     │──────┘
│ status          │
│ message         │
│ timestamp       │
└─────────────────┘
```

## Entities

### Project

A collection of related tasks for organizational purposes.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string (UUID) | PK, required | Unique identifier |
| name | string | required, max 100 | Display name |
| description | string | nullable, max 500 | Optional description |
| createdAt | datetime | required, default now | Creation timestamp |
| updatedAt | datetime | required, auto-update | Last modification |

**Indexes**:
- Primary: `id`
- `name` (for search)

**Business Rules**:
- Name must be unique
- Cannot delete project with active (running) tasks
- Deleting project sets tasks' projectId to null (orphans tasks, doesn't delete)

---

### Task

An individual unit of work with an AI assistant.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string (UUID) | PK, required | Unique identifier |
| description | string | required, max 2000 | Task description/prompt |
| status | enum | required, default 'pending' | Current status |
| projectId | string (UUID) | FK → Project, nullable | Parent project |
| environmentType | enum | required | 'local' \| 'worktree' \| 'remote' |
| environmentConfig | JSON | required | Type-specific config |
| aiVendor | enum | required | AI vendor/tool identifier |
| presetId | string (UUID) | FK → ConfigPreset, nullable | Source preset (if used) |
| parentTaskId | string (UUID) | FK → Task, nullable | Original task (if re-run) |
| createdAt | datetime | required, default now | Creation timestamp |
| startedAt | datetime | nullable | When task started running |
| completedAt | datetime | nullable | When task finished |
| errorMessage | string | nullable, max 2000 | Error details if failed |
| branchName | string | nullable, max 250 | Git branch associated with task |

**Status Enum Values**:
- `pending` - Created but not started
- `running` - Currently executing
- `completed` - Finished successfully
- `failed` - Finished with error
- `paused` - Manually paused
- `disconnected` - Lost connection to environment

**Environment Config Schema** (by type):

```typescript
// Local
{ type: 'local' }

// Worktree
{ 
  type: 'worktree',
  path: string,        // Absolute path to worktree
  branch?: string      // Optional branch name
}

// Remote
{
  type: 'remote',
  connectionType: 'ssh' | 'url',
  host: string,
  port?: number,
  user?: string,
  // Credentials stored separately for security
}
```

**Indexes**:
- Primary: `id`
- `projectId` (for filtering by project)
- `status` (for filtering by status)
- `createdAt` (for sorting)
- `branchName` (for filtering by branch)
- Composite: `(status, createdAt)` (for "recent active" queries)

**Business Rules**:
- Status transitions must follow valid paths (see State Machine below)
- Re-running a task creates a new task with parentTaskId set
- environmentConfig must validate against environmentType schema
- Cannot modify task while status is 'running'

---

### ConfigPreset

A saved execution configuration for quick reuse.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string (UUID) | PK, required | Unique identifier |
| name | string | required, unique, max 50 | Display name |
| environmentType | enum | required | 'local' \| 'worktree' \| 'remote' |
| environmentConfig | JSON | required | Type-specific config |
| aiVendor | enum | required | AI vendor/tool identifier |
| createdAt | datetime | required, default now | Creation timestamp |
| updatedAt | datetime | required, auto-update | Last modification |

**Indexes**:
- Primary: `id`
- Unique: `name`

**Business Rules**:
- Name must be unique across all presets
- Deleting preset does not affect tasks that used it (presetId preserved for history)
- Updating preset does not retroactively change tasks

---

### StatusHistory

A log of status changes for audit/history purposes.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string (UUID) | PK, required | Unique identifier |
| taskId | string (UUID) | FK → Task, required | Parent task |
| status | enum | required | Status at this point |
| message | string | nullable, max 500 | Optional context |
| timestamp | datetime | required, default now | When change occurred |

**Indexes**:
- Primary: `id`
- `taskId` (for task history lookup)
- Composite: `(taskId, timestamp)` (for ordered history)

**Business Rules**:
- Created automatically on task status change
- Immutable (never updated or deleted)
- Retained for at least 90 days per FR-010

---

## State Machine: Task Status

```
                    ┌──────────────┐
                    │   pending    │
                    └──────┬───────┘
                           │ start
                           ▼
                    ┌──────────────┐
            ┌───────│   running    │───────┐
            │       └──────┬───────┘       │
            │ pause        │ complete      │ fail
            ▼              ▼               ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │    paused    │ │  completed   │ │    failed    │
     └──────┬───────┘ └──────────────┘ └──────────────┘
            │ resume
            ▼
     ┌──────────────┐
     │   running    │
     └──────────────┘

Special: disconnected
- Can transition from 'running' when connection lost
- Can transition to 'running' when connection restored
- Can transition to 'failed' if unrecoverable
```

**Valid Transitions**:
| From | To | Trigger |
|------|-----|---------|
| pending | running | User starts task |
| running | completed | Task finishes successfully |
| running | failed | Task encounters error |
| running | paused | User pauses task |
| running | disconnected | Connection lost |
| paused | running | User resumes task |
| disconnected | running | Connection restored |
| disconnected | failed | User marks as failed |

---

## Drizzle Schema (TypeScript)

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  description: text('description').notNull(),
  status: text('status', { enum: ['pending', 'running', 'completed', 'failed', 'paused', 'disconnected'] }).notNull().default('pending'),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  environmentType: text('environment_type', { enum: ['local', 'worktree', 'remote'] }).notNull(),
  environmentConfig: text('environment_config', { mode: 'json' }).notNull(),
  aiVendor: text('ai_vendor', { enum: ['claude', 'chatgpt', 'gemini', 'cursor', 'copilot', 'windsurf', 'cody', 'aider', 'other'] }).notNull(),
  presetId: text('preset_id').references(() => configPresets.id, { onDelete: 'set null' }),
  parentTaskId: text('parent_task_id').references(() => tasks.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  errorMessage: text('error_message'),
  branchName: text('branch_name'),
});

export const configPresets = sqliteTable('config_presets', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  environmentType: text('environment_type', { enum: ['local', 'worktree', 'remote'] }).notNull(),
  environmentConfig: text('environment_config', { mode: 'json' }).notNull(),
  aiVendor: text('ai_vendor', { enum: ['claude', 'chatgpt', 'gemini', 'cursor', 'copilot', 'windsurf', 'cody', 'aider', 'other'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const statusHistory = sqliteTable('status_history', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['pending', 'running', 'completed', 'failed', 'paused', 'disconnected'] }).notNull(),
  message: text('message'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
```

---

## Validation Rules Summary

| Entity | Field | Rule |
|--------|-------|------|
| Project | name | Required, 1-100 chars, unique |
| Project | description | Optional, max 500 chars |
| Task | description | Required, 1-2000 chars |
| Task | environmentConfig | Must match environmentType schema |
| Task | aiVendor | Must be valid AI vendor identifier |
| ConfigPreset | name | Required, 1-50 chars, unique |
| StatusHistory | - | Immutable after creation |
