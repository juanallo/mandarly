import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db/client';
import { tasks, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Helper to make API request
async function apiRequest(path: string, options?: RequestInit) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}${path}`, options);
  return response;
}

describe('GET /api/tasks', () => {
  let testProjectId: string;
  let testTaskIds: string[] = [];

  beforeEach(async () => {
    // Create test project
    const [project] = await db
      .insert(projects)
      .values({
        name: 'Test Project',
        description: 'Test project for API tests',
      })
      .returning();
    testProjectId = project.id;

    // Create test tasks
    const tasksToInsert = [
      {
        description: 'Task 1 - Pending',
        status: 'pending' as const,
        projectId: testProjectId,
        environmentType: 'local' as const,
        environmentConfig: { type: 'local' as const } as any,
        aiVendor: 'claude' as any,
        branchName: 'feature/test-1',
      },
      {
        description: 'Task 2 - Running',
        status: 'running' as const,
        projectId: testProjectId,
        environmentType: 'worktree' as const,
        environmentConfig: { 
          type: 'worktree' as const, 
          path: '/path/to/worktree',
          branch: 'feature/test-2',
        } as any,
        aiVendor: 'cursor' as any,
        branchName: 'feature/test-2',
        startedAt: new Date(),
      },
      {
        description: 'Task 3 - Completed',
        status: 'completed' as const,
        projectId: null,
        environmentType: 'remote' as const,
        environmentConfig: {
          type: 'remote' as const,
          connectionType: 'ssh' as const,
          host: 'test-server.com',
        } as any,
        aiVendor: 'chatgpt' as any,
        branchName: 'main',
        startedAt: new Date('2026-01-18T10:00:00Z'),
        completedAt: new Date('2026-01-18T11:00:00Z'),
      },
    ];

    const insertedTasksResult = await db.insert(tasks).values(tasksToInsert).returning();
    const insertedTasks = Array.isArray(insertedTasksResult) ? insertedTasksResult : [insertedTasksResult];
    testTaskIds = insertedTasks.map((t: any) => t.id);
  });

  afterEach(async () => {
    // Cleanup test data
    if (testTaskIds.length > 0) {
      await db.delete(tasks).where(eq(tasks.projectId, testProjectId));
    }
    if (testProjectId) {
      await db.delete(projects).where(eq(projects.id, testProjectId));
    }
    testTaskIds = [];
  });

  it('returns all tasks by default', async () => {
    const response = await apiRequest('/api/tasks');
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.items).toBeInstanceOf(Array);
    expect(data.items.length).toBeGreaterThanOrEqual(3);
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('limit');
    expect(data).toHaveProperty('offset');
  });

  it('filters tasks by project', async () => {
    const response = await apiRequest(`/api/tasks?projectId=${testProjectId}`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.items.length).toBe(2); // Only 2 tasks belong to this project
    data.items.forEach((task: any) => {
      expect(task.projectId).toBe(testProjectId);
    });
  });

  it('filters tasks by status', async () => {
    const response = await apiRequest('/api/tasks?status=running');
    expect(response.status).toBe(200);

    const data = await response.json();
    data.items.forEach((task: any) => {
      expect(task.status).toBe('running');
    });
  });

  it('filters tasks by AI vendor', async () => {
    const response = await apiRequest('/api/tasks?aiVendor=claude');
    expect(response.status).toBe(200);

    const data = await response.json();
    data.items.forEach((task: any) => {
      expect(task.aiVendor).toBe('claude');
    });
  });

  it('filters tasks by branch name', async () => {
    const response = await apiRequest('/api/tasks?branchName=feature/test-1');
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.items.length).toBeGreaterThanOrEqual(1);
    data.items.forEach((task: any) => {
      expect(task.branchName).toBe('feature/test-1');
    });
  });

  it('supports pagination with limit and offset', async () => {
    const response = await apiRequest('/api/tasks?limit=2&offset=0');
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.items.length).toBeLessThanOrEqual(2);
    expect(data.limit).toBe(2);
    expect(data.offset).toBe(0);
  });

  it('supports search in task description', async () => {
    const response = await apiRequest('/api/tasks?search=Pending');
    expect(response.status).toBe(200);

    const data = await response.json();
    data.items.forEach((task: any) => {
      expect(task.description.toLowerCase()).toContain('pending');
    });
  });

  it('supports sorting by createdAt', async () => {
    const response = await apiRequest('/api/tasks?sortBy=createdAt&sortOrder=asc');
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.items).toBeInstanceOf(Array);
    // Verify ascending order
    for (let i = 0; i < data.items.length - 1; i++) {
      const current = new Date(data.items[i].createdAt);
      const next = new Date(data.items[i + 1].createdAt);
      expect(current.getTime()).toBeLessThanOrEqual(next.getTime());
    }
  });

  it('includes project information in response', async () => {
    const response = await apiRequest(`/api/tasks?projectId=${testProjectId}`);
    expect(response.status).toBe(200);

    const data = await response.json();
    const taskWithProject = data.items.find((t: any) => t.projectId === testProjectId);
    expect(taskWithProject).toBeDefined();
    expect(taskWithProject.project).toBeDefined();
    expect(taskWithProject.project.name).toBe('Test Project');
  });

  it('returns 400 for invalid query parameters', async () => {
    const response = await apiRequest('/api/tasks?limit=invalid');
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it('handles empty results gracefully', async () => {
    const response = await apiRequest('/api/tasks?status=paused');
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.items).toBeInstanceOf(Array);
    expect(data.total).toBeGreaterThanOrEqual(0);
  });
});
