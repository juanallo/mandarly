import { test, expect } from '@playwright/experimental-ct-react';
import { TaskStatusBadge } from '@/components/tasks/task-status-badge';
import { TaskStatus } from '@/lib/constants';

test('pending status badge', async ({ mount }) => {
  const component = await mount(<TaskStatusBadge status={TaskStatus.PENDING} />);
  await expect(component).toHaveScreenshot('task-status-badge-pending.png');
});

test('running status badge', async ({ mount }) => {
  const component = await mount(<TaskStatusBadge status={TaskStatus.RUNNING} />);
  await expect(component).toHaveScreenshot('task-status-badge-running.png');
});

test('paused status badge', async ({ mount }) => {
  const component = await mount(<TaskStatusBadge status={TaskStatus.PAUSED} />);
  await expect(component).toHaveScreenshot('task-status-badge-paused.png');
});

test('completed status badge', async ({ mount }) => {
  const component = await mount(<TaskStatusBadge status={TaskStatus.COMPLETED} />);
  await expect(component).toHaveScreenshot('task-status-badge-completed.png');
});

test('failed status badge', async ({ mount }) => {
  const component = await mount(<TaskStatusBadge status={TaskStatus.FAILED} />);
  await expect(component).toHaveScreenshot('task-status-badge-failed.png');
});

test('disconnected status badge', async ({ mount }) => {
  const component = await mount(<TaskStatusBadge status={TaskStatus.DISCONNECTED} />);
  await expect(component).toHaveScreenshot('task-status-badge-disconnected.png');
});

test('status badge without icon', async ({ mount }) => {
  const component = await mount(
    <TaskStatusBadge status={TaskStatus.RUNNING} showIcon={false} />
  );
  await expect(component).toHaveScreenshot('task-status-badge-no-icon.png');
});
