import { test, expect } from '@playwright/experimental-ct-react';
import { KanbanBoard } from '@/components/tasks/kanban-board';
import { createMockTasksByStatus, createMockTask } from '../test-utils';

test.use({
  viewport: { width: 1400, height: 800 },
});

test('kanban board - with tasks', async ({ mount }) => {
  const tasks = createMockTasksByStatus();
  // Add a few more tasks to some columns
  tasks.push(
    createMockTask({
      id: 'task-pending-2',
      status: 'pending',
      description: 'Another pending task',
    }),
    createMockTask({
      id: 'task-running-2',
      status: 'running',
      description: 'Another running task',
      startedAt: new Date('2024-01-15T10:10:00Z').toISOString(),
    }),
    createMockTask({
      id: 'task-completed-2',
      status: 'completed',
      description: 'Another completed task',
      startedAt: new Date('2024-01-15T09:00:00Z').toISOString(),
      completedAt: new Date('2024-01-15T10:00:00Z').toISOString(),
    })
  );
  const component = await mount(<KanbanBoard tasks={tasks} />);
  await expect(component).toHaveScreenshot('kanban-board-with-tasks.png');
});

test('kanban board - empty state', async ({ mount }) => {
  const component = await mount(<KanbanBoard tasks={[]} />);
  await expect(component).toHaveScreenshot('kanban-board-empty.png');
});

test('kanban board - loading state', async ({ mount }) => {
  const component = await mount(<KanbanBoard tasks={[]} isLoading={true} />);
  await expect(component).toHaveScreenshot('kanban-board-loading.png');
});

test('kanban board - single column with many tasks', async ({ mount }) => {
  // Create many pending tasks to test scrolling
  const tasks = Array.from({ length: 10 }, (_, i) =>
    createMockTask({
      id: `task-pending-${i}`,
      status: 'pending',
      description: `Pending task ${i + 1}`,
    })
  );
  const component = await mount(<KanbanBoard tasks={tasks} />);
  await expect(component).toHaveScreenshot('kanban-board-many-tasks.png');
});
