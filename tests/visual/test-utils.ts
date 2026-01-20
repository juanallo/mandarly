import type { TaskWithProject, Project } from '@/lib/api/schemas';
import { TaskStatus } from '@/lib/constants';

/**
 * Create a mock project for testing
 */
export function createMockProject(overrides?: Partial<Project>): Project {
  return {
    id: 'proj-test-123',
    name: 'Test Project',
    description: 'A test project for visual regression testing',
    createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-01T00:00:00Z').toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock task for testing
 */
export function createMockTask(overrides?: Partial<TaskWithProject>): TaskWithProject {
  const baseTask: TaskWithProject = {
    id: 'task-test-123',
    description: 'Test task description for visual regression',
    status: 'pending',
    projectId: null,
    environmentType: 'local',
    environmentConfig: { type: 'local' },
    aiVendor: 'claude',
    presetId: null,
    parentTaskId: null,
    createdAt: new Date('2024-01-15T10:00:00Z').toISOString(),
    startedAt: null,
    completedAt: null,
    errorMessage: null,
    branchName: null,
    project: null,
  };

  return {
    ...baseTask,
    ...overrides,
  };
}

/**
 * Create a mock task with project
 */
export function createMockTaskWithProject(
  status: TaskStatus = 'pending',
  projectOverrides?: Partial<Project>
): TaskWithProject {
  return createMockTask({
    status,
    projectId: 'proj-test-123',
    project: createMockProject(projectOverrides),
  });
}

/**
 * Create multiple mock tasks with different statuses
 */
export function createMockTasksByStatus(): TaskWithProject[] {
  const statuses: TaskStatus[] = [
    'pending',
    'running',
    'paused',
    'completed',
    'failed',
    'disconnected',
  ];

  return statuses.map((status, index) => {
    const baseDate = new Date('2024-01-15T10:00:00Z');
    baseDate.setHours(baseDate.getHours() + index);

    const task = createMockTask({
      id: `task-${status}-${index}`,
      status,
      description: `Task with ${status} status`,
      createdAt: baseDate.toISOString(),
    });

    if (status === 'running' || status === 'paused') {
      task.startedAt = new Date(baseDate.getTime() - 30 * 60 * 1000).toISOString();
    }

    if (status === 'completed') {
      task.startedAt = new Date(baseDate.getTime() - 60 * 60 * 1000).toISOString();
      task.completedAt = baseDate.toISOString();
    }

    if (status === 'failed') {
      task.startedAt = new Date(baseDate.getTime() - 45 * 60 * 1000).toISOString();
      task.errorMessage = 'Task execution failed';
    }

    return task;
  });
}
