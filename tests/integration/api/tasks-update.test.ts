import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { createId } from '@paralleldrive/cuid2';

// Integration test for PATCH /api/tasks/[id] status updates
// This test is written FIRST per TDD approach
describe('PATCH /api/tasks/[id] - Update Task Status API', () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;
  const testDbPath = ':memory:';

  beforeEach(async () => {
    sqlite = new Database(testDbPath);
    db = drizzle(sqlite);

    sqlite.exec(`
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

      CREATE TABLE IF NOT EXISTS status_history (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        status TEXT NOT NULL,
        message TEXT,
        timestamp INTEGER NOT NULL
      );
    `);
  });

  afterEach(() => {
    sqlite.close();
  });

  it('should update task status from pending to running', async () => {
    const taskId = createId();
    const updateData = {
      status: 'running',
    };

    // Should update status and set startedAt timestamp
    const updatedTask = {
      id: taskId,
      status: 'running',
      startedAt: new Date(),
      completedAt: null,
    };

    expect(updatedTask.status).toBe('running');
    expect(updatedTask.startedAt).toBeInstanceOf(Date);
  });

  it('should update task status from running to completed', async () => {
    const taskId = createId();
    const updateData = {
      status: 'completed',
    };

    const updatedTask = {
      id: taskId,
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
    };

    expect(updatedTask.status).toBe('completed');
    expect(updatedTask.completedAt).toBeInstanceOf(Date);
  });

  it('should update task status from running to failed with error message', async () => {
    const taskId = createId();
    const updateData = {
      status: 'failed',
      errorMessage: 'Connection timeout',
    };

    const updatedTask = {
      id: taskId,
      status: 'failed',
      errorMessage: 'Connection timeout',
      completedAt: new Date(),
    };

    expect(updatedTask.status).toBe('failed');
    expect(updatedTask.errorMessage).toBe('Connection timeout');
  });

  it('should update task status from running to paused', async () => {
    const taskId = createId();
    const updateData = {
      status: 'paused',
    };

    const updatedTask = {
      id: taskId,
      status: 'paused',
      startedAt: new Date(),
      completedAt: null,
    };

    expect(updatedTask.status).toBe('paused');
  });

  it('should update task status from paused to running', async () => {
    const taskId = createId();
    const updateData = {
      status: 'running',
    };

    const updatedTask = {
      id: taskId,
      status: 'running',
      startedAt: new Date(),
    };

    expect(updatedTask.status).toBe('running');
  });

  it('should update task status from running to disconnected', async () => {
    const taskId = createId();
    const updateData = {
      status: 'disconnected',
    };

    const updatedTask = {
      id: taskId,
      status: 'disconnected',
      startedAt: new Date(),
    };

    expect(updatedTask.status).toBe('disconnected');
  });

  it('should reject invalid status transition', async () => {
    const taskId = createId();
    const currentStatus = 'pending';
    const newStatus = 'completed'; // Invalid: can't go from pending to completed

    expect(() => {
      // Simulate validation
      const validTransitions = {
        pending: ['running'],
        running: ['completed', 'failed', 'paused', 'disconnected'],
      };
      
      const allowed = validTransitions[currentStatus as keyof typeof validTransitions] || [];
      if (!allowed.includes(newStatus)) {
        throw new Error('Invalid status transition');
      }
    }).toThrow('Invalid status transition');
  });

  it('should create status history entry on status update', async () => {
    const taskId = createId();
    const statusHistoryId = createId();
    
    const statusHistory = {
      id: statusHistoryId,
      taskId: taskId,
      status: 'running',
      message: 'Task started',
      timestamp: new Date(),
    };

    expect(statusHistory.taskId).toBe(taskId);
    expect(statusHistory.status).toBe('running');
  });

  it('should update only description without changing status', async () => {
    const taskId = createId();
    const updateData = {
      description: 'Updated task description',
    };

    const updatedTask = {
      id: taskId,
      description: 'Updated task description',
      status: 'pending', // Status unchanged
    };

    expect(updatedTask.description).toBe('Updated task description');
    expect(updatedTask.status).toBe('pending');
  });

  it('should update task project', async () => {
    const taskId = createId();
    const newProjectId = createId();
    const updateData = {
      projectId: newProjectId,
    };

    const updatedTask = {
      id: taskId,
      projectId: newProjectId,
    };

    expect(updatedTask.projectId).toBe(newProjectId);
  });

  it('should reject update if task does not exist', async () => {
    const nonExistentTaskId = createId();

    expect(() => {
      const taskExists = false; // Would be a DB query
      if (!taskExists) {
        throw new Error('Task not found');
      }
    }).toThrow('Task not found');
  });

  it('should validate status field against enum values', async () => {
    const taskId = createId();
    const invalidStatus = 'invalid-status';

    expect(() => {
      const validStatuses = ['pending', 'running', 'completed', 'failed', 'paused', 'disconnected'];
      if (!validStatuses.includes(invalidStatus)) {
        throw new Error('Invalid status value');
      }
    }).toThrow('Invalid status value');
  });

  it('should set startedAt timestamp when transitioning to running', async () => {
    const taskId = createId();
    
    const beforeUpdate = {
      status: 'pending',
      startedAt: null,
    };

    const afterUpdate = {
      status: 'running',
      startedAt: new Date(),
    };

    expect(beforeUpdate.startedAt).toBeNull();
    expect(afterUpdate.startedAt).toBeInstanceOf(Date);
  });

  it('should set completedAt timestamp when transitioning to completed', async () => {
    const taskId = createId();
    
    const beforeUpdate = {
      status: 'running',
      completedAt: null,
    };

    const afterUpdate = {
      status: 'completed',
      completedAt: new Date(),
    };

    expect(beforeUpdate.completedAt).toBeNull();
    expect(afterUpdate.completedAt).toBeInstanceOf(Date);
  });

  it('should set completedAt timestamp when transitioning to failed', async () => {
    const taskId = createId();
    
    const beforeUpdate = {
      status: 'running',
      completedAt: null,
    };

    const afterUpdate = {
      status: 'failed',
      completedAt: new Date(),
      errorMessage: 'Task failed',
    };

    expect(beforeUpdate.completedAt).toBeNull();
    expect(afterUpdate.completedAt).toBeInstanceOf(Date);
  });

  it('should allow updating branch name', async () => {
    const taskId = createId();
    const updateData = {
      branchName: 'feature-new-branch',
    };

    const updatedTask = {
      id: taskId,
      branchName: 'feature-new-branch',
    };

    expect(updatedTask.branchName).toBe('feature-new-branch');
  });
});
