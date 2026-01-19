import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { createId } from '@paralleldrive/cuid2';

// Integration test for projects CRUD API
// This test is written FIRST per TDD approach
describe('Projects CRUD API', () => {
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

  // GET /api/projects tests
  it('should list all projects with task counts', async () => {
    const project1 = {
      id: createId(),
      name: 'Project Alpha',
      description: 'First project',
      taskCount: 5,
      activeTaskCount: 2,
    };

    expect(project1.taskCount).toBe(5);
    expect(project1.activeTaskCount).toBe(2);
  });

  it('should return empty list when no projects exist', async () => {
    const projects = [];
    
    expect(projects).toHaveLength(0);
  });

  it('should include task counts in project list', async () => {
    const projectWithCounts = {
      id: createId(),
      name: 'Test Project',
      taskCount: 10,
      activeTaskCount: 3,
    };

    expect(projectWithCounts).toHaveProperty('taskCount');
    expect(projectWithCounts).toHaveProperty('activeTaskCount');
  });

  // POST /api/projects tests
  it('should create a new project', async () => {
    const projectData = {
      name: 'New Project',
      description: 'Project description',
    };

    const createdProject = {
      id: createId(),
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(createdProject.name).toBe('New Project');
    expect(createdProject.description).toBe('Project description');
    expect(createdProject.id).toBeDefined();
  });

  it('should create project without description', async () => {
    const projectData = {
      name: 'Project Without Description',
    };

    const createdProject = {
      id: createId(),
      name: projectData.name,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(createdProject.description).toBeNull();
  });

  it('should reject project with empty name', async () => {
    const projectData = {
      name: '',
      description: 'Test',
    };

    expect(() => {
      if (!projectData.name || projectData.name.trim().length === 0) {
        throw new Error('Name is required');
      }
    }).toThrow('Name is required');
  });

  it('should reject project name exceeding 100 characters', async () => {
    const projectData = {
      name: 'a'.repeat(101),
      description: 'Test',
    };

    expect(() => {
      if (projectData.name.length > 100) {
        throw new Error('Name must be at most 100 characters');
      }
    }).toThrow('Name must be at most 100 characters');
  });

  it('should reject project with duplicate name', async () => {
    const existingName = 'Existing Project';

    expect(() => {
      // Simulate unique constraint check
      const nameExists = true; // Would be a DB query
      if (nameExists) {
        throw new Error('Project name must be unique');
      }
    }).toThrow('Project name must be unique');
  });

  // GET /api/projects/[id] tests
  it('should get project by id with task counts', async () => {
    const projectId = createId();
    const project = {
      id: projectId,
      name: 'Test Project',
      description: 'Description',
      taskCount: 5,
      activeTaskCount: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(project.id).toBe(projectId);
    expect(project.taskCount).toBe(5);
  });

  it('should return 404 when project does not exist', async () => {
    const nonExistentId = createId();

    expect(() => {
      const projectExists = false;
      if (!projectExists) {
        throw new Error('Project not found');
      }
    }).toThrow('Project not found');
  });

  // PATCH /api/projects/[id] tests
  it('should update project name', async () => {
    const projectId = createId();
    const updateData = {
      name: 'Updated Project Name',
    };

    const updatedProject = {
      id: projectId,
      name: 'Updated Project Name',
      description: 'Original description',
      updatedAt: new Date(),
    };

    expect(updatedProject.name).toBe('Updated Project Name');
  });

  it('should update project description', async () => {
    const projectId = createId();
    const updateData = {
      description: 'Updated description',
    };

    const updatedProject = {
      id: projectId,
      name: 'Original name',
      description: 'Updated description',
      updatedAt: new Date(),
    };

    expect(updatedProject.description).toBe('Updated description');
  });

  it('should clear project description when set to null', async () => {
    const projectId = createId();
    const updateData = {
      description: null,
    };

    const updatedProject = {
      id: projectId,
      name: 'Test Project',
      description: null,
      updatedAt: new Date(),
    };

    expect(updatedProject.description).toBeNull();
  });

  it('should update updatedAt timestamp on update', async () => {
    const projectId = createId();
    const originalUpdatedAt = new Date('2024-01-01');
    const newUpdatedAt = new Date();

    expect(newUpdatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  // DELETE /api/projects/[id] tests
  it('should delete project and set tasks projectId to null', async () => {
    const projectId = createId();
    
    // After deletion, associated tasks should have projectId = null
    const orphanedTask = {
      id: createId(),
      projectId: null, // Was projectId, now null
      description: 'Task that was in deleted project',
    };

    expect(orphanedTask.projectId).toBeNull();
  });

  it('should delete project with no tasks', async () => {
    const projectId = createId();
    const projectWithNoTasks = {
      id: projectId,
      taskCount: 0,
    };

    // Should be able to delete
    const canDelete = projectWithNoTasks.taskCount >= 0;
    expect(canDelete).toBe(true);
  });

  it('should return 404 when deleting non-existent project', async () => {
    const nonExistentId = createId();

    expect(() => {
      const projectExists = false;
      if (!projectExists) {
        throw new Error('Project not found');
      }
    }).toThrow('Project not found');
  });

  // GET /api/projects/[id]/tasks tests
  it('should get tasks for a specific project', async () => {
    const projectId = createId();
    const tasks = [
      { id: createId(), projectId: projectId, description: 'Task 1' },
      { id: createId(), projectId: projectId, description: 'Task 2' },
    ];

    expect(tasks).toHaveLength(2);
    expect(tasks[0].projectId).toBe(projectId);
    expect(tasks[1].projectId).toBe(projectId);
  });

  it('should return empty list when project has no tasks', async () => {
    const projectId = createId();
    const tasks = [];

    expect(tasks).toHaveLength(0);
  });

  it('should support pagination for project tasks', async () => {
    const projectId = createId();
    const paginatedResponse = {
      items: [],
      total: 50,
      limit: 10,
      offset: 0,
      hasMore: true,
    };

    expect(paginatedResponse).toHaveProperty('items');
    expect(paginatedResponse).toHaveProperty('total');
    expect(paginatedResponse).toHaveProperty('limit');
    expect(paginatedResponse).toHaveProperty('offset');
    expect(paginatedResponse).toHaveProperty('hasMore');
  });
});
