import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { projects, tasks } from '@/lib/db/schema';
import { UpdateProjectRequest } from '@/lib/api/schemas';
import { eq, sql } from 'drizzle-orm';

// GET /api/projects/[id] - Get a single project by ID with task counts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Fetch project with task counts
    const [result] = await db
      .select({
        project: projects,
        taskCount: sql<number>`COUNT(DISTINCT ${tasks.id})`,
        activeTaskCount: sql<number>`SUM(CASE WHEN ${tasks.status} IN ('running', 'paused', 'disconnected') THEN 1 ELSE 0 END)`,
      })
      .from(projects)
      .leftJoin(tasks, eq(projects.id, tasks.projectId))
      .where(eq(projects.id, projectId))
      .groupBy(projects.id);

    if (!result) {
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

    const response = {
      ...result.project,
      createdAt: result.project.createdAt.toISOString(),
      updatedAt: result.project.updatedAt.toISOString(),
      taskCount: Number(result.taskCount) || 0,
      activeTaskCount: Number(result.activeTaskCount) || 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching project:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch project',
        },
      },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update a project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const validatedData = UpdateProjectRequest.parse(body);

    // Check if project exists
    const [existingProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!existingProject) {
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

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }

    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }

    // Update the project
    await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId));

    // Fetch updated project with task counts
    const [result] = await db
      .select({
        project: projects,
        taskCount: sql<number>`COUNT(DISTINCT ${tasks.id})`,
        activeTaskCount: sql<number>`SUM(CASE WHEN ${tasks.status} IN ('running', 'paused', 'disconnected') THEN 1 ELSE 0 END)`,
      })
      .from(projects)
      .leftJoin(tasks, eq(projects.id, tasks.projectId))
      .where(eq(projects.id, projectId))
      .groupBy(projects.id);

    const response = {
      ...result.project,
      createdAt: result.project.createdAt.toISOString(),
      updatedAt: result.project.updatedAt.toISOString(),
      taskCount: Number(result.taskCount) || 0,
      activeTaskCount: Number(result.activeTaskCount) || 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating project:', error);

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
          message: 'Failed to update project',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Check if project exists
    const [existingProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!existingProject) {
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

    // Check for active (running, paused, disconnected) tasks
    const [{ activeCount }] = await db
      .select({ activeCount: sql<number>`COUNT(*)` })
      .from(tasks)
      .where(
        eq(tasks.projectId, projectId)
      );

    const activeTaskCount = Number(activeCount);
    
    // Get detailed active tasks count
    const [{ runningCount }] = await db
      .select({ runningCount: sql<number>`COUNT(*)` })
      .from(tasks)
      .where(eq(tasks.projectId, projectId));

    if (activeTaskCount > 0) {
      // Check specifically for running/paused/disconnected tasks
      const [activeTask] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, projectId))
        .limit(1);

      const hasActiveTasks = activeTask && ['running', 'paused', 'disconnected'].includes(activeTask.status);
      
      if (hasActiveTasks) {
        return NextResponse.json(
          {
            error: {
              code: 'HAS_ACTIVE_TASKS',
              message: 'Cannot delete project with active tasks. Please complete or stop all running tasks first.',
            },
          },
          { status: 400 }
        );
      }
    }

    // Set projectId to null for all tasks in this project
    await db
      .update(tasks)
      .set({ projectId: null })
      .where(eq(tasks.projectId, projectId));

    // Delete the project
    await db
      .delete(projects)
      .where(eq(projects.id, projectId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete project',
        },
      },
      { status: 500 }
    );
  }
}
