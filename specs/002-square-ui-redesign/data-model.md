# Data Model: Square UI Redesign

**Feature**: 002-square-ui-redesign  
**Date**: 2026-01-19

## Overview

**No schema changes required.** This is strictly a presentation layer update.

The existing data model fully supports all visual features. The redesign maps existing fields to enhanced UI elements.

## Existing Schema (Unchanged)

### Tasks Table

```typescript
tasks = {
  id: string (cuid2)
  description: string          // → Task card title
  status: enum                 // → Kanban column + status badge
  projectId: string | null     // → Project tag on card
  environmentType: enum        // → Environment icon
  environmentConfig: json      // → Environment details (not displayed)
  aiVendor: enum               // → AI vendor badge
  presetId: string | null      // → (not displayed in kanban)
  parentTaskId: string | null  // → (not displayed in kanban)
  createdAt: timestamp         // → Card timestamp
  startedAt: timestamp | null  // → Duration calculation
  completedAt: timestamp | null // → Completed timestamp
  errorMessage: string | null  // → Error display on failed tasks
  branchName: string | null    // → Branch badge on card
}
```

**Status Values (Kanban Columns):**
- `pending` → "Pending" column
- `running` → "In Progress" column
- `paused` → "Paused" column
- `completed` → "Completed" column
- `failed` → "Failed" column
- `disconnected` → "Disconnected" column

### Projects Table

```typescript
projects = {
  id: string (cuid2)
  name: string        // → Project tag, sidebar section
  description: string | null
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Config Presets Table

```typescript
configPresets = {
  id: string (cuid2)
  name: string
  environmentType: enum
  environmentConfig: json
  aiVendor: enum
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Status History Table

```typescript
statusHistory = {
  id: string (cuid2)
  taskId: string
  status: enum
  message: string | null
  timestamp: timestamp
}
```

## UI Field Mapping

### Task Card Display

| UI Element | Source Field | Display Format |
|------------|--------------|----------------|
| Title | `description` | Text, line-clamp-2 |
| Status Badge | `status` | Colored badge with icon |
| Project Tag | `project.name` | Small tag/badge |
| Environment Icon | `environmentType` | Icon (Laptop/Server/FolderGit) |
| AI Vendor Badge | `aiVendor` | Small outline badge |
| Created Date | `createdAt` | "Jan 19, 2026" or relative |
| Duration | `startedAt` → now | "Running for 2h 15m" |
| Error Message | `errorMessage` | Red alert box (if failed) |
| Branch | `branchName` | GitBranch icon + name |

### Kanban Column Mapping

| Status Value | Column Header | Icon | Color |
|--------------|---------------|------|-------|
| `pending` | Pending | `Circle` | Gray |
| `running` | In Progress | `Play` | Blue |
| `paused` | Paused | `Pause` | Yellow |
| `completed` | Completed | `CheckCircle` | Green |
| `failed` | Failed | `XCircle` | Red |
| `disconnected` | Disconnected | `Unplug` | Orange |

### Dashboard Stats Mapping

| Stat Card | Data Source | Trend Calculation |
|-----------|-------------|-------------------|
| Total Tasks | `COUNT(tasks)` | Compare to 7 days ago |
| Active Tasks | `COUNT(tasks WHERE status IN (pending, running, paused))` | Compare to yesterday |
| Completed Today | `COUNT(tasks WHERE completedAt >= today)` | Compare to yesterday |
| Failed Today | `COUNT(tasks WHERE status = failed AND updatedAt >= today)` | Compare to yesterday |

## API Endpoints (Unchanged)

All existing API endpoints remain unchanged:

- `GET /api/tasks` - List tasks (used for kanban board)
- `GET /api/tasks/:id` - Task details
- `GET /api/projects` - List projects (sidebar)
- `GET /api/dashboard` - Dashboard stats

### Dashboard Stats Enhancement

The `/api/dashboard` endpoint may need enhancement to return trend data:

```typescript
// Current response
{
  totalTasks: number;
  activeTasks: number;
  completedToday: number;
  failedToday: number;
  tasksByStatus: Record<string, number>;
  tasksByEnvironment: Record<string, number>;
  recentTasks: Task[];
}

// Enhanced response (add trends)
{
  // ... existing fields
  trends: {
    totalTasks: { current: number; previous: number; change: number };
    activeTasks: { current: number; previous: number; change: number };
    completedToday: { current: number; previous: number; change: number };
    failedToday: { current: number; previous: number; change: number };
  }
}
```

## Conclusion

The existing schema fully supports the Square UI redesign. The only potential API enhancement is adding trend calculations to the dashboard endpoint, which is a non-breaking addition.
