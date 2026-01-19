import { InferSelectModel } from 'drizzle-orm';
import * as schema from '@/lib/db/schema';

// Database entity types
export type Task = InferSelectModel<typeof schema.tasks>;
export type Project = InferSelectModel<typeof schema.projects>;
export type ConfigPreset = InferSelectModel<typeof schema.configPresets>;
export type StatusHistory = InferSelectModel<typeof schema.statusHistory>;

// Environment configuration types
export type EnvironmentConfig = 
  | { type: 'local' }
  | { type: 'worktree'; path: string; branch?: string }
  | { type: 'remote'; connectionType: 'ssh' | 'url'; host: string; port?: number; user?: string };

// Status enum type
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'disconnected';

// Environment type enum
export type EnvironmentType = 'local' | 'worktree' | 'remote';

// AI Vendor enum type
export type AIVendor = 'claude' | 'chatgpt' | 'gemini' | 'cursor' | 'copilot' | 'windsurf' | 'cody' | 'aider' | 'other';
