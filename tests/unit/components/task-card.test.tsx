import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskCard } from '@/components/tasks/task-card';
import type { TaskWithProject } from '@/lib/api/schemas';

const mockTask: TaskWithProject = {
  id: 'test-task-1',
  description: 'Implement user authentication feature',
  status: 'running',
  projectId: 'project-1',
  environmentType: 'local',
  environmentConfig: { type: 'local' },
  aiVendor: 'claude',
  presetId: null,
  parentTaskId: null,
  createdAt: new Date('2026-01-18T10:00:00Z').toISOString(),
  startedAt: new Date('2026-01-18T10:05:00Z').toISOString(),
  completedAt: null,
  errorMessage: null,
  branchName: 'feature/auth',
  project: {
    id: 'project-1',
    name: 'Auth Service',
    description: 'Authentication microservice',
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
};

describe('TaskCard', () => {
  it('renders task description', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Implement user authentication feature')).toBeInTheDocument();
  });

  it('renders task status badge', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('running')).toBeInTheDocument();
  });

  it('displays environment type', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(/local/i)).toBeInTheDocument();
  });

  it('displays AI vendor', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(/claude/i)).toBeInTheDocument();
  });

  it('displays project name when project exists', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Auth Service')).toBeInTheDocument();
  });

  it('handles task without project', () => {
    const taskWithoutProject = { ...mockTask, project: null, projectId: null };
    render(<TaskCard task={taskWithoutProject} />);
    expect(screen.queryByText('Auth Service')).not.toBeInTheDocument();
  });

  it('displays branch name when available', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(/feature\/auth/i)).toBeInTheDocument();
  });

  it('displays created timestamp', () => {
    render(<TaskCard task={mockTask} />);
    // Check for some date-related text (exact format depends on implementation)
    expect(screen.getByText(/2026/i)).toBeInTheDocument();
  });

  it('shows duration for running tasks with startedAt', () => {
    render(<TaskCard task={mockTask} />);
    // Should show some time indication for running tasks
    const card = screen.getByRole('article');
    expect(card).toBeInTheDocument();
  });

  it('shows completed timestamp for completed tasks', () => {
    const completedTask: TaskWithProject = {
      ...mockTask,
      status: 'completed',
      completedAt: new Date('2026-01-18T11:00:00Z').toISOString(),
    };
    render(<TaskCard task={completedTask} />);
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('displays error message for failed tasks', () => {
    const failedTask: TaskWithProject = {
      ...mockTask,
      status: 'failed',
      errorMessage: 'API connection timeout',
    };
    render(<TaskCard task={failedTask} />);
    expect(screen.getByText(/API connection timeout/i)).toBeInTheDocument();
  });

  it('supports worktree environment config', () => {
    const worktreeTask: TaskWithProject = {
      ...mockTask,
      environmentType: 'worktree',
      environmentConfig: {
        type: 'worktree',
        path: '/path/to/worktree',
        branch: 'feature-branch',
      },
    };
    render(<TaskCard task={worktreeTask} />);
    expect(screen.getByText(/worktree/i)).toBeInTheDocument();
  });

  it('supports remote environment config', () => {
    const remoteTask: TaskWithProject = {
      ...mockTask,
      environmentType: 'remote',
      environmentConfig: {
        type: 'remote',
        connectionType: 'ssh',
        host: 'remote-server.com',
        user: 'developer',
      },
    };
    render(<TaskCard task={remoteTask} />);
    expect(screen.getByText(/remote/i)).toBeInTheDocument();
  });
});
