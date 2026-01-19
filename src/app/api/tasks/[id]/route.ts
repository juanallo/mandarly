import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { tasks, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/tasks/[id] - Get a single task by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

    // Fetch task with project information
    const [result] = await db
      .select({
        task: tasks,
        project: projects,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(eq(tasks.id, taskId));

    if (!result) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Task not found',
          },
        },
        { status: 404 }
      );
    }

    // Transform result to match TaskWithProject schema
    const response = {
      ...result.task,
      createdAt: result.task.createdAt.toISOString(),
      startedAt: result.task.startedAt?.toISOString() || null,
      completedAt: result.task.completedAt?.toISOString() || null,
      project: result.project ? {
        ...result.project,
        createdAt: result.project.createdAt.toISOString(),
        updatedAt: result.project.updatedAt.toISOString(),
      } : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching task:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch task',
        },
      },
      { status: 500 }
    );
  }
}
