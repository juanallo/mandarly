import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { tasks, projects, statusHistory } from '@/lib/db/schema';
import { UpdateTaskRequest } from '@/lib/api/schemas';
import { validateTransition } from '@/lib/status-transitions';
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

// PATCH /api/tasks/[id] - Update a task (status, description, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const validatedData = UpdateTaskRequest.parse(body);

    // Fetch current task to validate transition
    const [currentTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId));

    if (!currentTask) {
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

    // Prepare update data
    const updateData: any = {};
    
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }
    
    if (validatedData.projectId !== undefined) {
      updateData.projectId = validatedData.projectId;
    }
    
    if (validatedData.branchName !== undefined) {
      updateData.branchName = validatedData.branchName;
    }

    if (validatedData.errorMessage !== undefined) {
      updateData.errorMessage = validatedData.errorMessage;
    }

    // Handle status change with validation
    if (validatedData.status && validatedData.status !== currentTask.status) {
      // Validate transition
      try {
        validateTransition(currentTask.status, validatedData.status);
      } catch (error) {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_TRANSITION',
              message: error instanceof Error ? error.message : 'Invalid status transition',
            },
          },
          { status: 400 }
        );
      }

      updateData.status = validatedData.status;

      // Set timestamps based on status
      if (validatedData.status === 'running' && !currentTask.startedAt) {
        updateData.startedAt = new Date();
      }
      
      if (validatedData.status === 'completed' || validatedData.status === 'failed') {
        updateData.completedAt = new Date();
      }

      // Create status history entry
      await db.insert(statusHistory).values({
        taskId: taskId,
        status: validatedData.status,
        message: validatedData.status === 'failed' && validatedData.errorMessage
          ? `Task failed: ${validatedData.errorMessage}`
          : `Status changed to ${validatedData.status}`,
      });
    }

    // Update the task
    await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId));

    // Fetch updated task with project info
    const [result] = await db
      .select({
        task: tasks,
        project: projects,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(eq(tasks.id, taskId));

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
    console.error('Error updating task:', error);

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
          message: 'Failed to update task',
        },
      },
      { status: 500 }
    );
  }
}
