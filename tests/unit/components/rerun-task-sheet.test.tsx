import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Test wrapper with React Query provider
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

// Mock the RerunTaskSheet component (will fail until implemented)
// This test is written FIRST per TDD approach
describe('RerunTaskSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render as a slide-over sheet', async () => {
    const { RerunTaskSheet } = await import('@/components/tasks/rerun-task-sheet');
    const mockTask = {
      id: 'task-123',
      description: 'Original task',
      status: 'completed' as const,
      projectId: null,
      environmentType: 'local' as const,
      environmentConfig: { type: 'local' as const },
      aiVendor: 'claude',
      presetId: null,
      parentTaskId: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      branchName: null,
      project: null,
    };

    render(
      <TestWrapper>
        <RerunTaskSheet task={mockTask} open={true} onOpenChange={() => {}} />
      </TestWrapper>
    );

    expect(screen.getByText(/re-run task/i)).toBeInTheDocument();
  });

  it('should pre-fill form with original task data', async () => {
    const { RerunTaskSheet } = await import('@/components/tasks/rerun-task-sheet');
    const mockTask = {
      id: 'task-123',
      description: 'Original task description',
      status: 'completed' as const,
      projectId: null,
      environmentType: 'local' as const,
      environmentConfig: { type: 'local' as const },
      aiVendor: 'claude',
      presetId: null,
      parentTaskId: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      branchName: null,
      project: null,
    };

    render(
      <TestWrapper>
        <RerunTaskSheet task={mockTask} open={true} onOpenChange={() => {}} />
      </TestWrapper>
    );

    const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    expect(descriptionInput.value).toBe('Original task description');
  });

  it('should pre-fill worktree environment configuration', async () => {
    const { RerunTaskSheet } = await import('@/components/tasks/rerun-task-sheet');
    const mockTask = {
      id: 'task-123',
      description: 'Task with worktree',
      status: 'completed' as const,
      projectId: null,
      environmentType: 'worktree' as const,
      environmentConfig: {
        type: 'worktree' as const,
        path: '/test/worktree',
        branch: 'main',
      },
      aiVendor: 'cursor',
      presetId: null,
      parentTaskId: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      branchName: 'main',
      project: null,
    };

    render(
      <TestWrapper>
        <RerunTaskSheet task={mockTask} open={true} onOpenChange={() => {}} />
      </TestWrapper>
    );

    await waitFor(() => {
      const pathInput = screen.getByLabelText(/path/i) as HTMLInputElement;
      expect(pathInput.value).toBe('/test/worktree');
    });
  });

  it('should allow modifying description before rerunning', async () => {
    const { RerunTaskSheet } = await import('@/components/tasks/rerun-task-sheet');
    const mockOnSubmit = vi.fn();
    const mockTask = {
      id: 'task-123',
      description: 'Original description',
      status: 'completed' as const,
      projectId: null,
      environmentType: 'local' as const,
      environmentConfig: { type: 'local' as const },
      aiVendor: 'claude',
      presetId: null,
      parentTaskId: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      branchName: null,
      project: null,
    };

    render(
      <TestWrapper>
        <RerunTaskSheet 
          task={mockTask} 
          open={true} 
          onOpenChange={() => {}} 
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    const descriptionInput = screen.getByLabelText(/description/i);
    
    // User should be able to edit
    expect(descriptionInput).not.toBeDisabled();
  });

  it('should allow modifying AI vendor before rerunning', async () => {
    const { RerunTaskSheet } = await import('@/components/tasks/rerun-task-sheet');
    const mockTask = {
      id: 'task-123',
      description: 'Task with Claude',
      status: 'completed' as const,
      projectId: null,
      environmentType: 'local' as const,
      environmentConfig: { type: 'local' as const },
      aiVendor: 'claude',
      presetId: null,
      parentTaskId: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      branchName: null,
      project: null,
    };

    render(
      <TestWrapper>
        <RerunTaskSheet task={mockTask} open={true} onOpenChange={() => {}} />
      </TestWrapper>
    );

    // Should show AI vendor picker
    expect(screen.getByText(/claude/i)).toBeInTheDocument();
    
    // Other vendors should be visible for selection
    expect(screen.getByText(/cursor/i)).toBeInTheDocument();
    expect(screen.getByText(/chatgpt/i)).toBeInTheDocument();
  });

  it('should allow modifying environment before rerunning', async () => {
    const { RerunTaskSheet } = await import('@/components/tasks/rerun-task-sheet');
    const mockTask = {
      id: 'task-123',
      description: 'Task',
      status: 'completed' as const,
      projectId: null,
      environmentType: 'local' as const,
      environmentConfig: { type: 'local' as const },
      aiVendor: 'claude',
      presetId: null,
      parentTaskId: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      branchName: null,
      project: null,
    };

    render(
      <TestWrapper>
        <RerunTaskSheet task={mockTask} open={true} onOpenChange={() => {}} />
      </TestWrapper>
    );

    // Environment tabs should be available
    expect(screen.getByText(/local/i)).toBeInTheDocument();
    expect(screen.getByText(/worktree/i)).toBeInTheDocument();
    expect(screen.getByText(/remote/i)).toBeInTheDocument();
  });

  it('should close sheet when cancel is clicked', async () => {
    const { RerunTaskSheet } = await import('@/components/tasks/rerun-task-sheet');
    const mockOnOpenChange = vi.fn();
    const mockTask = {
      id: 'task-123',
      description: 'Task',
      status: 'completed' as const,
      projectId: null,
      environmentType: 'local' as const,
      environmentConfig: { type: 'local' as const },
      aiVendor: 'claude',
      presetId: null,
      parentTaskId: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      branchName: null,
      project: null,
    };

    render(
      <TestWrapper>
        <RerunTaskSheet task={mockTask} open={true} onOpenChange={mockOnOpenChange} />
      </TestWrapper>
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    cancelButton.click();

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should show reference to parent task', async () => {
    const { RerunTaskSheet } = await import('@/components/tasks/rerun-task-sheet');
    const mockTask = {
      id: 'task-123',
      description: 'Task',
      status: 'completed' as const,
      projectId: null,
      environmentType: 'local' as const,
      environmentConfig: { type: 'local' as const },
      aiVendor: 'claude',
      presetId: null,
      parentTaskId: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      branchName: null,
      project: null,
    };

    render(
      <TestWrapper>
        <RerunTaskSheet task={mockTask} open={true} onOpenChange={() => {}} />
      </TestWrapper>
    );

    // Should indicate this is a rerun of the original task
    expect(screen.getByText(/task-123/i)).toBeInTheDocument();
  });

  it('should disable submit during submission', async () => {
    const { RerunTaskSheet } = await import('@/components/tasks/rerun-task-sheet');
    const mockOnSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));
    const mockTask = {
      id: 'task-123',
      description: 'Task',
      status: 'completed' as const,
      projectId: null,
      environmentType: 'local' as const,
      environmentConfig: { type: 'local' as const },
      aiVendor: 'claude',
      presetId: null,
      parentTaskId: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      branchName: null,
      project: null,
    };

    render(
      <TestWrapper>
        <RerunTaskSheet 
          task={mockTask} 
          open={true} 
          onOpenChange={() => {}} 
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /re-run/i });
    submitButton.click();

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
