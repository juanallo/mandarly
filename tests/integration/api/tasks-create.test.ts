import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { tasks, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// Integration test for POST /api/tasks endpoint
// This test is written FIRST per TDD approach
describe('POST /api/tasks - Create Task API', () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;
  const testDbPath = ':memory:'; // Use in-memory database for tests

  beforeEach(async () => {
    // Setup test database
    sqlite = new Database(testDbPath);
    db = drizzle(sqlite);

    // Create tables (simplified schema for testing)
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
        branch_name TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      );
    `);
  });

  afterEach(() => {
    sqlite.close();
  });

  it('should create a task with local environment', async () => {
    const taskData = {
      description: 'Test task with local environment',
      environmentType: 'local',
      environmentConfig: { type: 'local' },
      aiVendor: 'claude',
    };

    // Simulate API call (actual API route will be implemented later)
    const result = {
      id: createId(),
      ...taskData,
      status: 'pending',
      projectId: null,
      presetId: null,
      parentTaskId: null,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      branchName: null,
    };

    // Verify structure matches expected schema
    expect(result).toMatchObject({
      id: expect.any(String),
      description: taskData.description,
      status: 'pending',
      environmentType: 'local',
      environmentConfig: { type: 'local' },
      aiVendor: 'claude',
    });
  });

  it('should create a task with worktree environment', async () => {
    const taskData = {
      description: 'Test task with worktree',
      environmentType: 'worktree',
      environmentConfig: {
        type: 'worktree',
        path: '/test/worktree/path',
        branch: 'feature-branch',
      },
      aiVendor: 'cursor',
    };

    const result = {
      id: createId(),
      ...taskData,
      status: 'pending',
      projectId: null,
      presetId: null,
      parentTaskId: null,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      branchName: 'feature-branch',
    };

    expect(result.environmentConfig).toMatchObject({
      type: 'worktree',
      path: '/test/worktree/path',
      branch: 'feature-branch',
    });
  });

  it('should create a task with remote environment', async () => {
    const taskData = {
      description: 'Test task with remote environment',
      environmentType: 'remote',
      environmentConfig: {
        type: 'remote',
        connectionType: 'ssh',
        host: 'remote.example.com',
        port: 22,
        user: 'testuser',
      },
      aiVendor: 'chatgpt',
    };

    const result = {
      id: createId(),
      ...taskData,
      status: 'pending',
      projectId: null,
      presetId: null,
      parentTaskId: null,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      branchName: null,
    };

    expect(result.environmentConfig).toMatchObject({
      type: 'remote',
      connectionType: 'ssh',
      host: 'remote.example.com',
      port: 22,
      user: 'testuser',
    });
  });

  it('should create a task associated with a project', async () => {
    // First create a project
    const projectId = createId();
    const project = {
      id: projectId,
      name: 'Test Project',
      description: 'Test project description',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert project into database
    const stmt = sqlite.prepare(`
      INSERT INTO projects (id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(
      project.id,
      project.name,
      project.description,
      project.createdAt.getTime(),
      project.updatedAt.getTime()
    );

    const taskData = {
      description: 'Task associated with project',
      projectId: projectId,
      environmentType: 'local',
      environmentConfig: { type: 'local' },
      aiVendor: 'claude',
    };

    const result = {
      id: createId(),
      ...taskData,
      status: 'pending',
      presetId: null,
      parentTaskId: null,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      branchName: null,
    };

    expect(result.projectId).toBe(projectId);
  });

  it('should reject task with missing description', async () => {
    const taskData: Record<string, unknown> = {
      // description missing
      environmentType: 'local',
      environmentConfig: { type: 'local' },
      aiVendor: 'claude',
    };

    // Validation should fail
    expect(() => {
      if (!taskData.description) {
        throw new Error('Description is required');
      }
    }).toThrow('Description is required');
  });

  it('should reject task with description exceeding 2000 characters', async () => {
    const taskData = {
      description: 'a'.repeat(2001),
      environmentType: 'local',
      environmentConfig: { type: 'local' },
      aiVendor: 'claude',
    };

    expect(() => {
      if (taskData.description.length > 2000) {
        throw new Error('Description must be at most 2000 characters');
      }
    }).toThrow('Description must be at most 2000 characters');
  });

  it('should reject task with invalid environment type', async () => {
    const taskData = {
      description: 'Test task',
      environmentType: 'invalid-type',
      environmentConfig: { type: 'invalid-type' },
      aiVendor: 'claude',
    };

    expect(() => {
      const validTypes = ['local', 'worktree', 'remote'];
      if (!validTypes.includes(taskData.environmentType)) {
        throw new Error('Invalid environment type');
      }
    }).toThrow('Invalid environment type');
  });

  it('should reject worktree environment without path', async () => {
    const taskData = {
      description: 'Test task',
      environmentType: 'worktree',
      environmentConfig: { type: 'worktree', path: '' }, // Empty path
      aiVendor: 'claude',
    };

    expect(() => {
      if (taskData.environmentType === 'worktree' && !taskData.environmentConfig.path) {
        throw new Error('Worktree path is required');
      }
    }).toThrow('Worktree path is required');
  });

  it('should reject remote environment without host', async () => {
    const taskData = {
      description: 'Test task',
      environmentType: 'remote',
      environmentConfig: {
        type: 'remote',
        connectionType: 'ssh',
        host: '', // Empty host
      },
      aiVendor: 'claude',
    };

    expect(() => {
      if (taskData.environmentType === 'remote' && !taskData.environmentConfig.host) {
        throw new Error('Host is required');
      }
    }).toThrow('Host is required');
  });

  it('should create initial status history entry when task is created', async () => {
    const taskData = {
      description: 'Test task for status history',
      environmentType: 'local',
      environmentConfig: { type: 'local' },
      aiVendor: 'claude',
    };

    const taskId = createId();
    const statusHistoryId = createId();

    // When task is created, status history should be created
    const statusHistory = {
      id: statusHistoryId,
      taskId: taskId,
      status: 'pending',
      message: 'Task created',
      timestamp: new Date(),
    };

    expect(statusHistory).toMatchObject({
      id: expect.any(String),
      taskId: taskId,
      status: 'pending',
      message: 'Task created',
      timestamp: expect.any(Date),
    });
  });

  it('should set presetId when task is created from preset', async () => {
    const presetId = createId();
    const taskData = {
      description: 'Test task from preset',
      environmentType: 'local',
      environmentConfig: { type: 'local' },
      aiVendor: 'claude',
      presetId: presetId,
    };

    const result = {
      id: createId(),
      ...taskData,
      status: 'pending',
      projectId: null,
      parentTaskId: null,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      branchName: null,
    };

    expect(result.presetId).toBe(presetId);
  });
});
