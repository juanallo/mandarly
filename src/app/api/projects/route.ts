import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { projects, tasks } from '@/lib/db/schema';
import { CreateProjectRequest, ListProjectsQuery } from '@/lib/api/schemas';
import { eq, like, sql } from 'drizzle-orm';

// GET /api/projects - List all projects with task counts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const queryParams = {
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0',
    };

    const validatedQuery = ListProjectsQuery.parse(queryParams);

    // Build query conditions
    const conditions = [];
    
    if (validatedQuery.search) {
      conditions.push(like(projects.name, `%${validatedQuery.search}%`));
    }

    // Fetch projects with task counts
    const projectsWithCounts = await db
      .select({
        project: projects,
        taskCount: sql<number>`COUNT(DISTINCT ${tasks.id})`,
        activeTaskCount: sql<number>`SUM(CASE WHEN ${tasks.status} IN ('running', 'paused', 'disconnected') THEN 1 ELSE 0 END)`,
      })
      .from(projects)
      .leftJoin(tasks, eq(projects.id, tasks.projectId))
      .groupBy(projects.id)
      .limit(validatedQuery.limit)
      .offset(validatedQuery.offset);

    // Count total projects
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects);

    // Transform results
    const items = projectsWithCounts.map(({ project, taskCount, activeTaskCount }) => ({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      taskCount: Number(taskCount) || 0,
      activeTaskCount: Number(activeTaskCount) || 0,
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
    console.error('Error fetching projects:', error);
    
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
          message: 'Failed to fetch projects',
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateProjectRequest.parse(body);

    // Create the project
    const newProjectResult = await db
      .insert(projects)
      .values({
        name: validatedData.name,
        description: validatedData.description || null,
      })
      .returning();

    const newProject = Array.isArray(newProjectResult) ? newProjectResult[0] : newProjectResult;

    const result = {
      ...newProject,
      createdAt: newProject.createdAt.toISOString(),
      updatedAt: newProject.updatedAt.toISOString(),
      taskCount: 0,
      activeTaskCount: 0,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);

    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.message,
          },
        },
        { status: 400 }
      );
    }

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return NextResponse.json(
        {
          error: {
            code: 'DUPLICATE_NAME',
            message: 'A project with this name already exists',
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create project',
        },
      },
      { status: 500 }
    );
  }
}
