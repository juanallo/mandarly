import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
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

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  description: text('description').notNull(),
  status: text('status', { enum: ['pending', 'running', 'completed', 'failed', 'paused', 'disconnected'] }).notNull().default('pending'),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  environmentType: text('environment_type', { enum: ['local', 'worktree', 'remote'] }).notNull(),
  environmentConfig: text('environment_config', { mode: 'json' }).notNull(),
  aiVendor: text('ai_vendor', { enum: ['claude', 'chatgpt', 'gemini', 'cursor', 'copilot', 'windsurf', 'cody', 'aider', 'other'] }).notNull(),
  presetId: text('preset_id').references(() => configPresets.id, { onDelete: 'set null' }),
  parentTaskId: text('parent_task_id').references((): any => tasks.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  errorMessage: text('error_message'),
  branchName: text('branch_name'),
});

export const statusHistory = sqliteTable('status_history', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['pending', 'running', 'completed', 'failed', 'paused', 'disconnected'] }).notNull(),
  message: text('message'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
