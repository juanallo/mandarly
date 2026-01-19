import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { tasks, projects } from '@/lib/db/schema';
import { eq, sql, and, gte, desc } from 'drizzle-orm';

// GET /api/dashboard - Get dashboard statistics
export async function GET() {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total tasks count
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(tasks);

    // Active tasks count (pending, running, paused)
    const [{ active }] = await db
      .select({ active: sql<number>`count(*)` })
      .from(tasks)
      .where(
        sql`${tasks.status} IN ('pending', 'running', 'paused')`
      );

    // Completed today count
    const [{ completedToday }] = await db
      .select({ completedToday: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.status, 'completed'),
          gte(tasks.completedAt, today)
        )
      );

    // Failed today count
    const [{ failedToday }] = await db
      .select({ failedToday: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.status, 'failed'),
          gte(tasks.completedAt, today)
        )
      );

    // Recent tasks (last 10)
    const recentTasksRaw = await db
      .select({
        task: tasks,
        project: projects,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .orderBy(desc(tasks.createdAt))
      .limit(10);

    const recentTasks = recentTasksRaw.map(({ task, project }) => ({
      ...task,
      createdAt: task.createdAt.toISOString(),
      startedAt: task.startedAt?.toISOString() || null,
      completedAt: task.completedAt?.toISOString() || null,
      project: project ? {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      } : null,
    }));

    // Tasks by status
    const tasksByStatusRaw = await db
      .select({
        status: tasks.status,
        count: sql<number>`count(*)`,
      })
      .from(tasks)
      .groupBy(tasks.status);

    const tasksByStatus: Record<string, number> = {};
    tasksByStatusRaw.forEach((row) => {
      tasksByStatus[row.status] = Number(row.count);
    });

    // Tasks by environment
    const tasksByEnvironmentRaw = await db
      .select({
        environmentType: tasks.environmentType,
        count: sql<number>`count(*)`,
      })
      .from(tasks)
      .groupBy(tasks.environmentType);

    const tasksByEnvironment: Record<string, number> = {};
    tasksByEnvironmentRaw.forEach((row) => {
      tasksByEnvironment[row.environmentType] = Number(row.count);
    });

    return NextResponse.json({
      totalTasks: Number(total),
      activeTasks: Number(active),
      completedToday: Number(completedToday),
      failedToday: Number(failedToday),
      recentTasks,
      tasksByStatus,
      tasksByEnvironment,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch dashboard stats',
        },
      },
      { status: 500 }
    );
  }
}
