import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db/client';
import { tasks, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

describe('Kanban Board Integration', () => {
  let testProjectId: string;

  beforeEach(async () => {
    // Create test project
    const [project] = await db
      .insert(projects)
      .values({
        name: 'Kanban Test Project',
        description: 'Test project for kanban board',
      })
      .returning();
    testProjectId = project.id;
  });

  afterEach(async () => {
    // Clean up test data
    if (testProjectId) {
      await db.delete(tasks).where(eq(tasks.projectId, testProjectId));
      await db.delete(projects).where(eq(projects.id, testProjectId));
    }
  });

  it('should group tasks by status correctly', async () => {
    // Insert tasks with different statuses
    await db.insert(tasks).values([
      {
        description: 'Pending Task 1',
        status: 'pending' as const,
        projectId: testProjectId,
        environmentType: 'local' as const,
        environmentConfig: { type: 'local' as const } as any,
        aiVendor: 'claude' as any,
      },
      {
        description: 'Running Task 1',
        status: 'running' as const,
        projectId: testProjectId,
        environmentType: 'local' as const,
        environmentConfig: { type: 'local' as const } as any,
        aiVendor: 'claude' as any,
        startedAt: new Date(),
      },
      {
        description: 'Completed Task 1',
        status: 'completed' as const,
        projectId: testProjectId,
        environmentType: 'local' as const,
        environmentConfig: { type: 'local' as const } as any,
        aiVendor: 'claude' as any,
        startedAt: new Date(),
        completedAt: new Date(),
      },
    ]);

    // Fetch all tasks
    const allTasks = await db.select().from(tasks).where(eq(tasks.projectId, testProjectId));

    expect(allTasks).toHaveLength(3);

    // Group by status
    const tasksByStatus = allTasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    }, {} as Record<string, typeof allTasks>);

    expect(tasksByStatus['pending']).toHaveLength(1);
    expect(tasksByStatus['running']).toHaveLength(1);
    expect(tasksByStatus['completed']).toHaveLength(1);
  });

  it('should handle multiple tasks in same status', async () => {
    // Insert multiple tasks with same status
    await db.insert(tasks).values([
      {
        description: 'Pending Task 1',
        status: 'pending' as const,
        projectId: testProjectId,
        environmentType: 'local' as const,
        environmentConfig: { type: 'local' as const } as any,
        aiVendor: 'claude' as any,
      },
      {
        description: 'Pending Task 2',
        status: 'pending' as const,
        projectId: testProjectId,
        environmentType: 'local' as const,
        environmentConfig: { type: 'local' as const } as any,
        aiVendor: 'claude' as any,
      },
      {
        description: 'Pending Task 3',
        status: 'pending' as const,
        projectId: testProjectId,
        environmentType: 'local' as const,
        environmentConfig: { type: 'local' as const } as any,
        aiVendor: 'claude' as any,
      },
    ]);

    const pendingTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, testProjectId));

    const pending = pendingTasks.filter(t => t.status === 'pending');
    expect(pending).toHaveLength(3);
  });

  it('should handle empty status columns', async () => {
    // Insert tasks only for some statuses
    await db.insert(tasks).values([
      {
        description: 'Running Task 1',
        status: 'running' as const,
        projectId: testProjectId,
        environmentType: 'local' as const,
        environmentConfig: { type: 'local' as const } as any,
        aiVendor: 'claude' as any,
        startedAt: new Date(),
      },
    ]);

    const allTasks = await db.select().from(tasks).where(eq(tasks.projectId, testProjectId));

    // Should only have running tasks
    expect(allTasks).toHaveLength(1);
    expect(allTasks[0].status).toBe('running');

    // Other statuses should be empty
    const pendingTasks = allTasks.filter((t) => t.status === 'pending');
    expect(pendingTasks).toHaveLength(0);
  });

  it('should handle all 6 task statuses', async () => {
    // Insert one task for each status
    const statusValues = [
      { status: 'pending' as const, startedAt: null, completedAt: null },
      { status: 'running' as const, startedAt: new Date(), completedAt: null },
      { status: 'paused' as const, startedAt: new Date(), completedAt: null },
      { status: 'completed' as const, startedAt: new Date(), completedAt: new Date() },
      { status: 'failed' as const, startedAt: new Date(), completedAt: null },
      { status: 'disconnected' as const, startedAt: null, completedAt: null },
    ];

    await db.insert(tasks).values(
      statusValues.map((s) => ({
        description: `${s.status} Task`,
        status: s.status,
        projectId: testProjectId,
        environmentType: 'local' as const,
        environmentConfig: { type: 'local' as const } as any,
        aiVendor: 'claude' as any,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
      }))
    );

    const allTasks = await db.select().from(tasks).where(eq(tasks.projectId, testProjectId));

    expect(allTasks).toHaveLength(6);

    // Verify each status has exactly one task
    const statuses = ['pending', 'running', 'paused', 'completed', 'failed', 'disconnected'];
    statuses.forEach((status) => {
      const statusTasks = allTasks.filter((t) => t.status === status);
      expect(statusTasks).toHaveLength(1);
    });
  });
});
