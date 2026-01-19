import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { tasks, projects, statusHistory } from '@/lib/db/schema';
import { RerunTaskRequest } from '@/lib/api/schemas';
import { eq } from 'drizzle-orm';

// POST /api/tasks/[id]/rerun - Create a new task based on an existing one
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const validatedData = RerunTaskRequest.parse({ taskId, ...body });

    // Fetch the original task
    const [originalTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId));

    if (!originalTask) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Original task not found',
          },
        },
        { status: 404 }
      );
    }

    // Merge original task data with modifications
    const modifications = validatedData.modifications || {};
    const newTaskData = {
      description: modifications.description ?? originalTask.description,
      status: 'pending' as const,
      projectId: modifications.projectId !== undefined ? modifications.projectId : originalTask.projectId,
      environmentType: modifications.environmentType ?? originalTask.environmentType,
      environmentConfig: modifications.environmentConfig ?? originalTask.environmentConfig,
      aiVendor: modifications.aiVendor ?? originalTask.aiVendor,
      presetId: originalTask.presetId, // Always preserve preset reference
      parentTaskId: taskId, // Reference to the original task
      branchName: modifications.branchName !== undefined ? modifications.branchName : originalTask.branchName,
    };

    // Create the new task
    const newTaskResult = await db
      .insert(tasks)
      .values(newTaskData as any)
      .returning();

    const newTask = Array.isArray(newTaskResult) ? newTaskResult[0] : newTaskResult;

    // Create initial status history entry
    await db.insert(statusHistory).values({
      taskId: newTask.id,
      status: 'pending',
      message: `Rerun of task ${taskId}`,
    });

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
    console.error('Error rerunning task:', error);

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
          message: 'Failed to rerun task',
        },
      },
      { status: 500 }
    );
  }
}
