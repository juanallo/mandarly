import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { tasks, projects } from '@/lib/db/schema';
import { ListTasksQuery } from '@/lib/api/schemas';
import { eq, desc, sql } from 'drizzle-orm';

// GET /api/projects/[id]/tasks - Get tasks for a specific project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const queryParams = {
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedQuery = ListTasksQuery.parse(queryParams);

    // Check if project exists
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        },
        { status: 404 }
      );
    }

    // Fetch tasks for this project
    const projectTasks = await db
      .select({
        task: tasks,
        project: projects,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(eq(tasks.projectId, projectId))
      .orderBy(desc(tasks.createdAt))
      .limit(validatedQuery.limit)
      .offset(validatedQuery.offset);

    // Count total tasks for this project
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.projectId, projectId));

    // Transform results
    const items = projectTasks.map(({ task, project }) => ({
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

    const total = Number(count);
    const hasMore = validatedQuery.offset + items.length < total;

    return NextResponse.json({
      items,
      total,
      limit: validatedQuery.limit,
      offset: validatedQuery.offset,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching project tasks:', error);

    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.message,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch project tasks',
        },
      },
      { status: 500 }
    );
  }
}
