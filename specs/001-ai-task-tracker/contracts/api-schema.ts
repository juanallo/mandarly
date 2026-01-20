/**
 * API Schema Contracts for Mandarly
 * 
 * These Zod schemas define the API contract for all endpoints.
 * Used for request validation and response typing.
 */

import { z } from 'zod';

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export const TaskStatus = z.enum([
  'pending',
  'running', 
  'completed',
  'failed',
  'paused',
  'disconnected'
]);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const EnvironmentType = z.enum(['local', 'worktree', 'remote']);
export type EnvironmentType = z.infer<typeof EnvironmentType>;

export const AIVendor = z.enum([
  'claude',      // Anthropic Claude (via API, Claude.ai, etc.)
  'chatgpt',     // OpenAI ChatGPT
  'gemini',      // Google Gemini
  'cursor',      // Cursor IDE
  'copilot',     // GitHub Copilot
  'windsurf',    // Codeium Windsurf
  'cody',        // Sourcegraph Cody
  'aider',       // Aider CLI
  'other'        // Custom/other AI tool
]);
export type AIVendor = z.infer<typeof AIVendor>;

// =============================================================================
// ENVIRONMENT CONFIG SCHEMAS
// =============================================================================

export const LocalEnvironmentConfig = z.object({
  type: z.literal('local'),
});

export const WorktreeEnvironmentConfig = z.object({
  type: z.literal('worktree'),
  path: z.string().min(1, 'Worktree path is required'),
  branch: z.string().optional(),
});

export const RemoteEnvironmentConfig = z.object({
  type: z.literal('remote'),
  connectionType: z.enum(['ssh', 'url']),
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().positive().optional(),
  user: z.string().optional(),
});

export const EnvironmentConfig = z.discriminatedUnion('type', [
  LocalEnvironmentConfig,
  WorktreeEnvironmentConfig,
  RemoteEnvironmentConfig,
]);
export type EnvironmentConfig = z.infer<typeof EnvironmentConfig>;

// =============================================================================
// ENTITY SCHEMAS
// =============================================================================

// --- Project ---

export const ProjectSchema = z.object({
  id: z.string().cuid2(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const ProjectWithTaskCount = ProjectSchema.extend({
  taskCount: z.number().int().nonnegative(),
  activeTaskCount: z.number().int().nonnegative(),
});
export type ProjectWithTaskCount = z.infer<typeof ProjectWithTaskCount>;

// --- Task ---

export const TaskSchema = z.object({
  id: z.string().cuid2(),
  description: z.string().min(1).max(2000),
  status: TaskStatus,
  projectId: z.string().cuid2().nullable(),
  environmentType: EnvironmentType,
  environmentConfig: EnvironmentConfig,
  aiVendor: z.string().min(1),
  presetId: z.string().cuid2().nullable(),
  parentTaskId: z.string().cuid2().nullable(),
  createdAt: z.string().datetime(),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  errorMessage: z.string().max(2000).nullable(),
  branchName: z.string().max(250).nullable(),
});
export type Task = z.infer<typeof TaskSchema>;

export const TaskWithProject = TaskSchema.extend({
  project: ProjectSchema.nullable(),
});
export type TaskWithProject = z.infer<typeof TaskWithProject>;

// --- Config Preset ---

export const ConfigPresetSchema = z.object({
  id: z.string().cuid2(),
  name: z.string().min(1).max(50),
  environmentType: EnvironmentType,
  environmentConfig: EnvironmentConfig,
  aiVendor: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ConfigPreset = z.infer<typeof ConfigPresetSchema>;

// --- Status History ---

export const StatusHistorySchema = z.object({
  id: z.string().cuid2(),
  taskId: z.string().cuid2(),
  status: TaskStatus,
  message: z.string().max(500).nullable(),
  timestamp: z.string().datetime(),
});
export type StatusHistory = z.infer<typeof StatusHistorySchema>;

// =============================================================================
// API REQUEST SCHEMAS
// =============================================================================

// --- Tasks ---

export const CreateTaskRequest = z.object({
  description: z.string().min(1).max(2000),
  projectId: z.string().cuid2().optional(),
  environmentType: EnvironmentType,
  environmentConfig: EnvironmentConfig,
  aiVendor: z.string().min(1),
  presetId: z.string().cuid2().optional(),
  branchName: z.string().max(250).optional(),
});
export type CreateTaskRequest = z.infer<typeof CreateTaskRequest>;

export const UpdateTaskRequest = z.object({
  description: z.string().min(1).max(2000).optional(),
  projectId: z.string().cuid2().nullable().optional(),
  status: TaskStatus.optional(),
  errorMessage: z.string().max(2000).nullable().optional(),
  branchName: z.string().max(250).nullable().optional(),
});
export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequest>;

export const RerunTaskRequest = z.object({
  taskId: z.string().cuid2(),
  modifications: z.object({
    description: z.string().min(1).max(2000).optional(),
    projectId: z.string().cuid2().nullable().optional(),
    environmentType: EnvironmentType.optional(),
    environmentConfig: EnvironmentConfig.optional(),
    aiVendor: z.string().min(1).optional(),
    branchName: z.string().max(250).nullable().optional(),
  }).optional(),
});
export type RerunTaskRequest = z.infer<typeof RerunTaskRequest>;

export const ListTasksQuery = z.object({
  projectId: z.string().cuid2().optional(),
  status: TaskStatus.optional(),
  branchName: z.string().max(250).optional(),
  aiVendor: AIVendor.optional(),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.enum(['createdAt', 'updatedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type ListTasksQuery = z.infer<typeof ListTasksQuery>;

// --- Projects ---

export const CreateProjectRequest = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});
export type CreateProjectRequest = z.infer<typeof CreateProjectRequest>;

export const UpdateProjectRequest = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
});
export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequest>;

export const ListProjectsQuery = z.object({
  search: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ListProjectsQuery = z.infer<typeof ListProjectsQuery>;

// --- Config Presets ---

export const CreatePresetRequest = z.object({
  name: z.string().min(1).max(50),
  environmentType: EnvironmentType,
  environmentConfig: EnvironmentConfig,
  aiVendor: z.string().min(1),
});
export type CreatePresetRequest = z.infer<typeof CreatePresetRequest>;

export const UpdatePresetRequest = z.object({
  name: z.string().min(1).max(50).optional(),
  environmentType: EnvironmentType.optional(),
  environmentConfig: EnvironmentConfig.optional(),
  aiVendor: z.string().min(1).optional(),
});
export type UpdatePresetRequest = z.infer<typeof UpdatePresetRequest>;

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

export const PaginatedResponse = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
    hasMore: z.boolean(),
  });

export const TaskListResponse = PaginatedResponse(TaskWithProject);
export type TaskListResponse = z.infer<typeof TaskListResponse>;

export const ProjectListResponse = PaginatedResponse(ProjectWithTaskCount);
export type ProjectListResponse = z.infer<typeof ProjectListResponse>;

export const PresetListResponse = PaginatedResponse(ConfigPresetSchema);
export type PresetListResponse = z.infer<typeof PresetListResponse>;

export const ErrorResponse = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.string()).optional(),
  }),
});
export type ErrorResponse = z.infer<typeof ErrorResponse>;

// =============================================================================
// API ENDPOINTS
// =============================================================================

/**
 * API Route Definitions
 * 
 * Tasks:
 *   GET    /api/tasks          - List tasks (paginated, filterable)
 *   POST   /api/tasks          - Create new task
 *   GET    /api/tasks/:id      - Get task by ID
 *   PATCH  /api/tasks/:id      - Update task
 *   DELETE /api/tasks/:id      - Delete task
 *   POST   /api/tasks/:id/rerun - Re-run task (creates new task)
 *   GET    /api/tasks/:id/history - Get status history for task
 * 
 * Projects:
 *   GET    /api/projects       - List projects (with task counts)
 *   POST   /api/projects       - Create new project
 *   GET    /api/projects/:id   - Get project by ID
 *   PATCH  /api/projects/:id   - Update project
 *   DELETE /api/projects/:id   - Delete project
 *   GET    /api/projects/:id/tasks - Get tasks for project
 * 
 * Presets:
 *   GET    /api/presets        - List all presets
 *   POST   /api/presets        - Create new preset
 *   GET    /api/presets/:id    - Get preset by ID
 *   PATCH  /api/presets/:id    - Update preset
 *   DELETE /api/presets/:id    - Delete preset
 * 
 * Dashboard:
 *   GET    /api/dashboard      - Get dashboard stats (active tasks, recent, etc.)
 */

export const DashboardStats = z.object({
  totalTasks: z.number().int().nonnegative(),
  activeTasks: z.number().int().nonnegative(),
  completedToday: z.number().int().nonnegative(),
  failedToday: z.number().int().nonnegative(),
  recentTasks: z.array(TaskWithProject),
  tasksByStatus: z.record(TaskStatus, z.number().int().nonnegative()),
  tasksByEnvironment: z.record(EnvironmentType, z.number().int().nonnegative()),
});
export type DashboardStats = z.infer<typeof DashboardStats>;
