import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

// Mock the TaskForm component (will fail until implemented)
// This test is written FIRST per TDD approach
describe('TaskForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all required form fields', async () => {
    const { TaskForm } = await import('@/components/tasks/task-form');
    const mockOnSubmit = vi.fn();
    
    render(
      <TestWrapper>
        <TaskForm onSubmit={mockOnSubmit} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/environment/i)).toBeInTheDocument();
    expect(screen.getByText(/ai vendor/i)).toBeInTheDocument();
  });

  it('should validate required description field', async () => {
    const { TaskForm } = await import('@/components/tasks/task-form');
    const mockOnSubmit = vi.fn();
    
    render(
      <TestWrapper>
        <TaskForm onSubmit={mockOnSubmit} />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate description max length (2000 chars)', async () => {
    const { TaskForm } = await import('@/components/tasks/task-form');
    const mockOnSubmit = vi.fn();
    
    render(
      <TestWrapper>
        <TaskForm onSubmit={mockOnSubmit} />
      </TestWrapper>
    );

    const descriptionInput = screen.getByLabelText(/description/i);
    const longDescription = 'a'.repeat(2001);
    fireEvent.change(descriptionInput, { target: { value: longDescription } });

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/description must be at most/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate worktree path is required when worktree selected', async () => {
    const { TaskForm } = await import('@/components/tasks/task-form');
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <TaskForm onSubmit={mockOnSubmit} />
      </TestWrapper>
    );

    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'Test task');

    // Switch to worktree environment
    const worktreeTab = screen.getByRole('tab', { name: /worktree/i });
    await user.click(worktreeTab);

    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Form shows error for incomplete environment configuration
      expect(screen.getByText(/invalid environment configuration|please complete the environment configuration/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate remote host is required when remote selected', async () => {
    const { TaskForm } = await import('@/components/tasks/task-form');
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <TaskForm onSubmit={mockOnSubmit} />
      </TestWrapper>
    );

    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'Test task');

    // Switch to remote environment
    const remoteTab = screen.getByRole('tab', { name: /remote/i });
    await user.click(remoteTab);

    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Form shows error for incomplete environment configuration
      expect(screen.getByText(/invalid environment configuration|please complete the environment configuration/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid form data', async () => {
    const { TaskForm } = await import('@/components/tasks/task-form');
    const mockOnSubmit = vi.fn();
    
    render(
      <TestWrapper>
        <TaskForm onSubmit={mockOnSubmit} />
      </TestWrapper>
    );

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test task description' } });

    // Select AI vendor (default or select one)
    const claudeOption = screen.getByText(/claude/i);
    fireEvent.click(claudeOption);

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Test task description',
          environmentType: 'local',
          aiVendor: expect.any(String),
        })
      );
    });
  });

  it('should pre-fill form when defaultValues provided', async () => {
    const { TaskForm } = await import('@/components/tasks/task-form');
    const mockOnSubmit = vi.fn();
    
    const defaultValues = {
      description: 'Pre-filled description',
      environmentType: 'worktree' as const,
      environmentConfig: { type: 'worktree' as const, path: '/test/path' },
      aiVendor: 'cursor',
    };
    
    render(
      <TestWrapper>
        <TaskForm onSubmit={mockOnSubmit} defaultValues={defaultValues} />
      </TestWrapper>
    );

    const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    expect(descriptionInput.value).toBe('Pre-filled description');

    const pathInput = screen.getByLabelText(/path/i) as HTMLInputElement;
    expect(pathInput.value).toBe('/test/path');
  });

  it('should allow selecting a project', async () => {
    const { TaskForm } = await import('@/components/tasks/task-form');
    const mockOnSubmit = vi.fn();
    
    render(
      <TestWrapper>
        <TaskForm onSubmit={mockOnSubmit} />
      </TestWrapper>
    );

    const projectSelector = screen.getByLabelText(/project/i);
    expect(projectSelector).toBeInTheDocument();
  });

  it('should show loading state during submission', async () => {
    const { TaskForm } = await import('@/components/tasks/task-form');
    const mockOnSubmit = vi.fn((): Promise<void> => new Promise((resolve) => setTimeout(resolve, 100)));
    
    render(
      <TestWrapper>
        <TaskForm onSubmit={mockOnSubmit} />
      </TestWrapper>
    );

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test task' } });

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
