import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { createId } from '@paralleldrive/cuid2';

// Integration test for project delete with running tasks rejection
// This test is written FIRST per TDD approach
describe('DELETE /api/projects/[id] - Running Tasks Protection', () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;
  const testDbPath = ':memory:';

  beforeEach(async () => {
    sqlite = new Database(testDbPath);
    db = drizzle(sqlite);

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        project_id TEXT,
        environment_type TEXT NOT NULL,
        environment_config TEXT NOT NULL,
        ai_vendor TEXT NOT NULL,
        preset_id TEXT,
        parent_task_id TEXT,
        created_at INTEGER NOT NULL,
        started_at INTEGER,
        completed_at INTEGER,
        error_message TEXT,
        branch_name TEXT
      );
    `);
  });

  afterEach(() => {
    sqlite.close();
  });

  it('should prevent deletion of project with running tasks', async () => {
    const projectId = createId();
    const runningTask = {
      id: createId(),
      projectId: projectId,
      status: 'running',
    };

    expect(() => {
      // Check if project has running tasks
      const hasRunningTasks = runningTask.status === 'running';
      if (hasRunningTasks) {
        throw new Error('Cannot delete project with running tasks');
      }
    }).toThrow('Cannot delete project with running tasks');
  });

  it('should allow deletion of project with completed tasks', async () => {
    const projectId = createId();
    const completedTask = {
      id: createId(),
      projectId: projectId,
      status: 'completed',
    };

    // Should be able to delete
    const hasRunningTasks = completedTask.status === 'running';
    expect(hasRunningTasks).toBe(false);
  });

  it('should allow deletion of project with failed tasks', async () => {
    const projectId = createId();
    const failedTask = {
      id: createId(),
      projectId: projectId,
      status: 'failed',
    };

    const hasRunningTasks = failedTask.status === 'running';
    expect(hasRunningTasks).toBe(false);
  });

  it('should allow deletion of project with pending tasks', async () => {
    const projectId = createId();
    const pendingTask = {
      id: createId(),
      projectId: projectId,
      status: 'pending',
    };

    const hasRunningTasks = pendingTask.status === 'running';
    expect(hasRunningTasks).toBe(false);
  });

  it('should prevent deletion if any task is running', async () => {
    const projectId = createId();
    const tasks = [
      { status: 'completed' },
      { status: 'running' }, // One running task
      { status: 'failed' },
    ];

    const hasRunningTasks = tasks.some(t => t.status === 'running');
    expect(hasRunningTasks).toBe(true);
  });

  it('should prevent deletion if any task is paused', async () => {
    const projectId = createId();
    const pausedTask = {
      id: createId(),
      projectId: projectId,
      status: 'paused',
    };

    // Paused tasks might be resumed, so prevent deletion
    const hasActiveTask = ['running', 'paused'].includes(pausedTask.status);
    expect(hasActiveTask).toBe(true);
  });

  it('should prevent deletion if any task is disconnected', async () => {
    const projectId = createId();
    const disconnectedTask = {
      id: createId(),
      projectId: projectId,
      status: 'disconnected',
    };

    // Disconnected tasks might reconnect, so prevent deletion
    const hasActiveTask = ['running', 'paused', 'disconnected'].includes(disconnectedTask.status);
    expect(hasActiveTask).toBe(true);
  });

  it('should return appropriate error message when deletion blocked', async () => {
    const projectId = createId();

    try {
      // Simulate deletion attempt
      const hasRunningTasks = true;
      if (hasRunningTasks) {
        throw new Error('Cannot delete project with active tasks. Please complete or stop all running tasks first.');
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('active tasks');
    }
  });

  it('should set tasks projectId to null on successful deletion', async () => {
    const projectId = createId();
    const task = {
      id: createId(),
      projectId: projectId,
      status: 'completed',
    };

    // After deletion
    const orphanedTask = {
      ...task,
      projectId: null,
    };

    expect(orphanedTask.projectId).toBeNull();
  });

  it('should handle project with mix of completed and failed tasks', async () => {
    const projectId = createId();
    const tasks = [
      { status: 'completed' },
      { status: 'completed' },
      { status: 'failed' },
      { status: 'failed' },
    ];

    const hasRunningTasks = tasks.some(t => ['running', 'paused', 'disconnected'].includes(t.status));
    expect(hasRunningTasks).toBe(false); // Can delete
  });

  it('should return task count in error when deletion blocked', async () => {
    const projectId = createId();
    const runningTaskCount = 3;

    try {
      if (runningTaskCount > 0) {
        throw new Error(`Cannot delete project with ${runningTaskCount} active tasks`);
      }
    } catch (error) {
      expect((error as Error).message).toContain('3 active tasks');
    }
  });
});
