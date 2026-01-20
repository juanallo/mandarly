import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KanbanColumn } from '@/components/tasks/kanban-column';
import { STATUS_CONFIG, TaskStatus } from '@/lib/constants';
import type { TaskWithProject } from '@/lib/api/schemas';

const mockTask: TaskWithProject = {
  id: '1',
  description: 'Test task',
  status: TaskStatus.PENDING,
  projectId: 'proj-1',
  environmentType: 'local',
  environmentConfig: { type: 'local' as const },
  aiVendor: 'claude',
  presetId: null,
  parentTaskId: null,
  branchName: null,
  createdAt: new Date().toISOString(),
  startedAt: null,
  completedAt: null,
  errorMessage: null,
  project: {
    id: 'proj-1',
    name: 'Test Project',
    description: 'Test description',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

describe('KanbanColumn', () => {
  it('should render column header with status name', () => {
    const status = STATUS_CONFIG[TaskStatus.PENDING];
    render(<KanbanColumn status={status} tasks={[]} />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should render column header with task count badge', () => {
    const status = STATUS_CONFIG[TaskStatus.RUNNING];
    const tasks = [mockTask, { ...mockTask, id: '2' }];

    render(<KanbanColumn status={status} tasks={tasks} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render empty state when no tasks', () => {
    const status = STATUS_CONFIG[TaskStatus.COMPLETED];
    render(<KanbanColumn status={status} tasks={[]} />);

    expect(screen.getByText(/no completed tasks/i)).toBeInTheDocument();
  });

  it('should render task cards for each task', () => {
    const status = STATUS_CONFIG[TaskStatus.PENDING];
    const tasks = [
      mockTask,
      { ...mockTask, id: '2', description: 'Second task' },
    ];

    render(<KanbanColumn status={status} tasks={tasks} />);

    expect(screen.getByText('Test task')).toBeInTheDocument();
    expect(screen.getByText('Second task')).toBeInTheDocument();
  });

  it('should call onTaskClick when task is clicked', async () => {
    const user = userEvent.setup();
    const onTaskClick = vi.fn();
    const status = STATUS_CONFIG[TaskStatus.RUNNING];

    render(
      <KanbanColumn
        status={status}
        tasks={[mockTask]}
        onTaskClick={onTaskClick}
      />
    );

    const taskCard = screen.getByText('Test task').closest('div');
    if (taskCard) {
      await user.click(taskCard);
    }

    expect(onTaskClick).toHaveBeenCalledWith(mockTask);
  });

  it('should render status icon in header', () => {
    const status = STATUS_CONFIG[TaskStatus.FAILED];
    const { container } = render(
      <KanbanColumn status={status} tasks={[]} />
    );

    // Check for icon (XCircle for failed status)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should apply status color classes to header', () => {
    const status = STATUS_CONFIG[TaskStatus.COMPLETED];
    const { container } = render(
      <KanbanColumn status={status} tasks={[]} />
    );

    const header = container.querySelector('.bg-green-100');
    expect(header).toBeInTheDocument();
  });

  it('should have scrollable content area', () => {
    const status = STATUS_CONFIG[TaskStatus.PENDING];
    const { container } = render(
      <KanbanColumn status={status} tasks={[mockTask]} />
    );

    const content = container.querySelector('.overflow-y-auto');
    expect(content).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const status = STATUS_CONFIG[TaskStatus.PENDING];
    const { container } = render(
      <KanbanColumn
        status={status}
        tasks={[]}
        className="custom-class"
      />
    );

    const column = container.firstChild;
    expect(column).toHaveClass('custom-class');
  });
});
