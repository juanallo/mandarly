import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { tasks, projects } from '@/lib/db/schema';
import { eq, sql, and, gte, desc } from 'drizzle-orm';

// Helper function to calculate trend
function calculateTrend(current: number, previous: number): {
  current: number;
  previous: number;
  change: number;
  direction: 'up' | 'down' | 'stable';
} {
  const change = previous === 0 ? 0 : ((current - previous) / previous) * 100;
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
  
  return {
    current,
    previous,
    change,
    direction,
  };
}

// GET /api/dashboard - Get dashboard statistics
export async function GET() {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get yesterday's date at midnight
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get 7 days ago for weekly comparison
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Total tasks count (current)
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(tasks);

    // Total tasks count (7 days ago)
    const [{ totalPrevious }] = await db
      .select({ totalPrevious: sql<number>`count(*)` })
      .from(tasks)
      .where(gte(tasks.createdAt, fourteenDaysAgo));

    // Active tasks count (pending, running, paused) - current
    const [{ active }] = await db
      .select({ active: sql<number>`count(*)` })
      .from(tasks)
      .where(
        sql`${tasks.status} IN ('pending', 'running', 'paused')`
      );

    // Active tasks count - yesterday
    const [{ activePrevious }] = await db
      .select({ activePrevious: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          sql`${tasks.status} IN ('pending', 'running', 'paused')`,
          gte(tasks.createdAt, yesterday)
        )
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

    // Completed yesterday count
    const [{ completedYesterday }] = await db
      .select({ completedYesterday: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.status, 'completed'),
          gte(tasks.completedAt, yesterday),
          sql`${tasks.completedAt} < ${today}`
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

    // Failed yesterday count
    const [{ failedYesterday }] = await db
      .select({ failedYesterday: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.status, 'failed'),
          gte(tasks.completedAt, yesterday),
          sql`${tasks.completedAt} < ${today}`
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

    // Calculate trends
    const trends = {
      totalTasks: calculateTrend(Number(total), Number(totalPrevious)),
      activeTasks: calculateTrend(Number(active), Number(activePrevious)),
      completedToday: calculateTrend(Number(completedToday), Number(completedYesterday)),
      failedToday: calculateTrend(Number(failedToday), Number(failedYesterday)),
    };

    return NextResponse.json({
      totalTasks: Number(total),
      activeTasks: Number(active),
      completedToday: Number(completedToday),
      failedToday: Number(failedToday),
      recentTasks,
      tasksByStatus,
      tasksByEnvironment,
      trends,
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
