import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { tasks, projects } from '@/lib/db/schema';
import { ListTasksQuery, CreateTaskRequest, TaskStatus } from '@/lib/api/schemas';
import { and, eq, like, desc, asc, sql, or } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// GET /api/tasks - List tasks with filtering, pagination, and sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = {
      projectId: searchParams.get('projectId') || undefined,
      status: searchParams.get('status') || undefined,
      branchName: searchParams.get('branchName') || undefined,
      aiVendor: searchParams.get('aiVendor') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedQuery = ListTasksQuery.parse(queryParams);

    // Build query conditions
    const conditions = [];

    if (validatedQuery.projectId) {
      conditions.push(eq(tasks.projectId, validatedQuery.projectId));
    }
    if (validatedQuery.status) {
      conditions.push(eq(tasks.status, validatedQuery.status));
    }
    if (validatedQuery.branchName) {
      conditions.push(eq(tasks.branchName, validatedQuery.branchName));
    }
    if (validatedQuery.aiVendor) {
      conditions.push(eq(tasks.aiVendor, validatedQuery.aiVendor));
    }
    if (validatedQuery.search) {
      conditions.push(like(tasks.description, `%${validatedQuery.search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sort column
    const sortColumn = validatedQuery.sortBy === 'createdAt' 
      ? tasks.createdAt 
      : validatedQuery.sortBy === 'updatedAt'
      ? tasks.createdAt // Fall back to createdAt since tasks don't have updatedAt
      : tasks.status;

    const sortOrder = validatedQuery.sortOrder === 'asc' ? asc : desc;

    // Fetch tasks with project information
    const tasksWithProjects = await db
      .select({
        task: tasks,
        project: projects,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(whereClause)
      .orderBy(sortOrder(sortColumn))
      .limit(validatedQuery.limit)
      .offset(validatedQuery.offset);

    // Count total matching tasks
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(whereClause);

    // Transform results
    const items = tasksWithProjects.map(({ task, project }) => ({
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
    console.error('Error fetching tasks:', error);
    
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
          message: 'Failed to fetch tasks',
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateTaskRequest.parse(body);

    // Create the task
    const newTaskResult = await db
      .insert(tasks)
      .values({
        description: validatedData.description,
        status: 'pending',
        projectId: validatedData.projectId || null,
        environmentType: validatedData.environmentType,
        environmentConfig: validatedData.environmentConfig as any,
        aiVendor: validatedData.aiVendor as any,
        presetId: validatedData.presetId || null,
        branchName: validatedData.branchName || null,
      })
      .returning();
    
    const newTask = Array.isArray(newTaskResult) ? newTaskResult[0] : newTaskResult;

    // Fetch the created task with project info
    const [taskWithProject] = await db
      .select({
        task: tasks,
        project: projects,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(eq(tasks.id, newTask.id));

    const result = {
      ...taskWithProject.task,
      createdAt: taskWithProject.task.createdAt.toISOString(),
      startedAt: taskWithProject.task.startedAt?.toISOString() || null,
      completedAt: taskWithProject.task.completedAt?.toISOString() || null,
      project: taskWithProject.project ? {
        ...taskWithProject.project,
        createdAt: taskWithProject.project.createdAt.toISOString(),
        updatedAt: taskWithProject.project.updatedAt.toISOString(),
      } : null,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);

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

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create task',
        },
      },
      { status: 500 }
    );
  }
}
