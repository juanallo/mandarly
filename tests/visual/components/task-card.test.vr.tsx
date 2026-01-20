import { test, expect } from '@playwright/experimental-ct-react';
import { TaskCard } from '@/components/tasks/task-card';
import { createMockTask, createMockTaskWithProject } from '../test-utils';
import { TaskStatus } from '@/lib/constants';

test.use({
  viewport: { width: 400, height: 300 },
});

test('task card - running status', async ({ mount }) => {
  const task = createMockTask({
    status: 'running',
    startedAt: new Date('2024-01-15T10:05:00Z').toISOString(),
  });
  const component = await mount(<TaskCard task={task} />);
  await expect(component).toHaveScreenshot('task-card-running.png');
});

test('task card - completed status', async ({ mount }) => {
  const task = createMockTask({
    status: 'completed',
    startedAt: new Date('2024-01-15T10:00:00Z').toISOString(),
    completedAt: new Date('2024-01-15T11:00:00Z').toISOString(),
  });
  const component = await mount(<TaskCard task={task} />);
  await expect(component).toHaveScreenshot('task-card-completed.png');
});

test('task card - failed status', async ({ mount }) => {
  const task = createMockTask({
    status: 'failed',
    startedAt: new Date('2024-01-15T10:00:00Z').toISOString(),
    errorMessage: 'Task execution failed with error',
  });
  const component = await mount(<TaskCard task={task} />);
  await expect(component).toHaveScreenshot('task-card-failed.png');
});

test('task card - pending status', async ({ mount }) => {
  const task = createMockTask({
    status: 'pending',
  });
  const component = await mount(<TaskCard task={task} />);
  await expect(component).toHaveScreenshot('task-card-pending.png');
});

test('task card - with worktree environment', async ({ mount }) => {
  const task = createMockTask({
    status: 'running',
    environmentType: 'worktree',
    environmentConfig: {
      type: 'worktree',
      path: '/path/to/worktree',
      branch: 'feature-branch',
    },
    branchName: 'feature-branch',
    startedAt: new Date('2024-01-15T10:05:00Z').toISOString(),
  });
  const component = await mount(<TaskCard task={task} />);
  await expect(component).toHaveScreenshot('task-card-worktree.png');
});

test('task card - with remote environment', async ({ mount }) => {
  const task = createMockTask({
    status: 'running',
    environmentType: 'remote',
    environmentConfig: {
      type: 'remote',
      connectionType: 'ssh',
      host: 'remote.example.com',
      port: 22,
      user: 'testuser',
    },
    startedAt: new Date('2024-01-15T10:05:00Z').toISOString(),
  });
  const component = await mount(<TaskCard task={task} />);
  await expect(component).toHaveScreenshot('task-card-remote.png');
});

test('task card - with project', async ({ mount }) => {
  const task = createMockTaskWithProject('running', {
    name: 'My Project',
  });
  task.startedAt = new Date('2024-01-15T10:05:00Z').toISOString();
  const component = await mount(<TaskCard task={task} />);
  await expect(component).toHaveScreenshot('task-card-with-project.png');
});

test('task card - with different AI vendor', async ({ mount }) => {
  const task = createMockTask({
    status: 'running',
    aiVendor: 'chatgpt',
    startedAt: new Date('2024-01-15T10:05:00Z').toISOString(),
  });
  const component = await mount(<TaskCard task={task} />);
  await expect(component).toHaveScreenshot('task-card-chatgpt.png');
});
