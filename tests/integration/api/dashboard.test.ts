import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db/client';
import { tasks, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { GET } from '@/app/api/dashboard/route';

describe('GET /api/dashboard', () => {
  let testProjectId: string;
  let testTaskIds: string[] = [];

  beforeEach(async () => {
    // Create test project
    const [project] = await db
      .insert(projects)
      .values({
        name: 'Dashboard Test Project',
        description: 'Test project for dashboard',
      })
      .returning();
    testProjectId = project.id;

    // Create diverse test tasks for dashboard stats
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const tasksToInsert = [
      {
        description: 'Active Task 1',
        status: 'running' as const,
        projectId: testProjectId,
        environmentType: 'local' as const,
        environmentConfig: { type: 'local' as const } as any,
        aiVendor: 'claude' as any,
        startedAt: today,
      },
      {
        description: 'Active Task 2',
        status: 'pending' as const,
        projectId: testProjectId,
        environmentType: 'worktree' as const,
        environmentConfig: { 
          type: 'worktree' as const, 
          path: '/path/to/worktree',
        } as any,
        aiVendor: 'cursor' as any,
      },
      {
        description: 'Completed Task Today',
        status: 'completed' as const,
        projectId: testProjectId,
        environmentType: 'remote' as const,
        environmentConfig: {
          type: 'remote' as const,
          connectionType: 'ssh' as const,
          host: 'test.com',
        } as any,
        aiVendor: 'chatgpt' as any,
        startedAt: today,
        completedAt: today,
      },
      {
        description: 'Failed Task Today',
        status: 'failed' as const,
        projectId: null,
        environmentType: 'local' as const,
        environmentConfig: { type: 'local' as const } as any,
        aiVendor: 'claude' as any,
        startedAt: today,
        completedAt: today,
        errorMessage: 'Test error',
      },
      {
        description: 'Old Completed Task',
        status: 'completed' as const,
        projectId: testProjectId,
        environmentType: 'local' as const,
        environmentConfig: { type: 'local' as const } as any,
        aiVendor: 'gemini' as any,
        startedAt: yesterday,
        completedAt: yesterday,
      },
      {
        description: 'Paused Task',
        status: 'paused' as const,
        projectId: testProjectId,
        environmentType: 'local' as const,
        environmentConfig: { type: 'local' as const } as any,
        aiVendor: 'copilot' as any,
        startedAt: yesterday,
      },
    ];

    const insertedTasksResult = await db.insert(tasks).values(tasksToInsert).returning();
    const insertedTasks = Array.isArray(insertedTasksResult) ? insertedTasksResult : [insertedTasksResult];
    testTaskIds = insertedTasks.map((t: any) => t.id);
  });

  afterEach(async () => {
    // Cleanup test data
    if (testTaskIds.length > 0) {
      for (const taskId of testTaskIds) {
        await db.delete(tasks).where(eq(tasks.id, taskId));
      }
    }
    if (testProjectId) {
      await db.delete(projects).where(eq(projects.id, testProjectId));
    }
    testTaskIds = [];
  });

  it('returns dashboard stats successfully', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalTasks');
    expect(data).toHaveProperty('activeTasks');
    expect(data).toHaveProperty('completedToday');
    expect(data).toHaveProperty('failedToday');
    expect(data).toHaveProperty('recentTasks');
    expect(data).toHaveProperty('tasksByStatus');
    expect(data).toHaveProperty('tasksByEnvironment');
  });

  it('calculates total tasks correctly', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(typeof data.totalTasks).toBe('number');
    expect(data.totalTasks).toBeGreaterThanOrEqual(6); // At least our test tasks
  });

  it('calculates active tasks correctly', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(typeof data.activeTasks).toBe('number');
    // Active = running + pending + paused
    expect(data.activeTasks).toBeGreaterThanOrEqual(3);
  });

  it('calculates completed today count', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(typeof data.completedToday).toBe('number');
    // Should count tasks completed today (at least 1 from our test data)
    expect(data.completedToday).toBeGreaterThanOrEqual(1);
  });

  it('calculates failed today count', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(typeof data.failedToday).toBe('number');
    // Should count tasks failed today (at least 1 from our test data)
    expect(data.failedToday).toBeGreaterThanOrEqual(1);
  });

  it('returns recent tasks array', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(Array.isArray(data.recentTasks)).toBe(true);
    expect(data.recentTasks.length).toBeGreaterThan(0);
    
    // Verify recent tasks structure
    const recentTask = data.recentTasks[0];
    expect(recentTask).toHaveProperty('id');
    expect(recentTask).toHaveProperty('description');
    expect(recentTask).toHaveProperty('status');
    expect(recentTask).toHaveProperty('createdAt');
  });

  it('limits recent tasks to reasonable number', async () => {
    const response = await GET();
    const data = await response.json();
    
    // Recent tasks should be limited (e.g., 10-20 max)
    expect(data.recentTasks.length).toBeLessThanOrEqual(20);
  });

  it('sorts recent tasks by creation date descending', async () => {
    const response = await GET();
    const data = await response.json();
    
    const recentTasks = data.recentTasks;
    // Verify descending order (most recent first)
    for (let i = 0; i < recentTasks.length - 1; i++) {
      const current = new Date(recentTasks[i].createdAt);
      const next = new Date(recentTasks[i + 1].createdAt);
      expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
    }
  });

  it('groups tasks by status correctly', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(typeof data.tasksByStatus).toBe('object');
    
    // Should have counts for various statuses
    if (data.tasksByStatus.running) {
      expect(data.tasksByStatus.running).toBeGreaterThanOrEqual(1);
    }
    if (data.tasksByStatus.pending) {
      expect(data.tasksByStatus.pending).toBeGreaterThanOrEqual(1);
    }
    if (data.tasksByStatus.completed) {
      expect(data.tasksByStatus.completed).toBeGreaterThanOrEqual(1);
    }
  });

  it('groups tasks by environment type correctly', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(typeof data.tasksByEnvironment).toBe('object');
    
    // Should have counts for various environment types
    expect(data.tasksByEnvironment.local).toBeGreaterThanOrEqual(1);
    expect(data.tasksByEnvironment.worktree).toBeGreaterThanOrEqual(1);
    expect(data.tasksByEnvironment.remote).toBeGreaterThanOrEqual(1);
  });

  it('includes project info in recent tasks when available', async () => {
    const response = await GET();
    const data = await response.json();
    
    const taskWithProject = data.recentTasks.find(
      (t: any) => t.projectId === testProjectId
    );
    
    if (taskWithProject) {
      expect(taskWithProject.project).toBeDefined();
      expect(taskWithProject.project.name).toBe('Dashboard Test Project');
    }
  });

  it('handles empty database gracefully', async () => {
    // Delete all test tasks temporarily
    for (const taskId of testTaskIds) {
      await db.delete(tasks).where(eq(tasks.id, taskId));
    }
    
    const response = await GET();
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.totalTasks).toBeGreaterThanOrEqual(0);
    expect(data.activeTasks).toBeGreaterThanOrEqual(0);
    expect(data.recentTasks).toBeInstanceOf(Array);
    expect(data.tasksByStatus).toBeInstanceOf(Object);
    expect(data.tasksByEnvironment).toBeInstanceOf(Object);
    
    // Restore tasks for cleanup
    const tasksToRestore = [
      {
        description: 'Restore task',
        status: 'pending' as const,
        projectId: testProjectId,
        environmentType: 'local' as const,
        environmentConfig: { type: 'local' as const } as any,
        aiVendor: 'claude' as any,
      },
    ];
    const restoredTasksResult = await db.insert(tasks).values(tasksToRestore).returning();
    const restoredTasks = Array.isArray(restoredTasksResult) ? restoredTasksResult : [restoredTasksResult];
    testTaskIds = restoredTasks.map((t: any) => t.id);
  });
});
