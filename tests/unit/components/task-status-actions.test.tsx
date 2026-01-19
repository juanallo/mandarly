import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the TaskStatusActions component (will fail until implemented)
// This test is written FIRST per TDD approach
describe('TaskStatusActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show Start button when status is pending', async () => {
    const { TaskStatusActions } = await import('@/components/tasks/task-status-actions');
    const mockOnStatusChange = vi.fn();
    
    render(
      <TaskStatusActions
        currentStatus="pending"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText(/start/i)).toBeInTheDocument();
  });

  it('should show Complete, Fail, and Pause buttons when status is running', async () => {
    const { TaskStatusActions } = await import('@/components/tasks/task-status-actions');
    const mockOnStatusChange = vi.fn();
    
    render(
      <TaskStatusActions
        currentStatus="running"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText(/complete/i)).toBeInTheDocument();
    expect(screen.getByText(/fail/i)).toBeInTheDocument();
    expect(screen.getByText(/pause/i)).toBeInTheDocument();
  });

  it('should show Resume button when status is paused', async () => {
    const { TaskStatusActions } = await import('@/components/tasks/task-status-actions');
    const mockOnStatusChange = vi.fn();
    
    render(
      <TaskStatusActions
        currentStatus="paused"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText(/resume/i)).toBeInTheDocument();
  });

  it('should show Resume and Mark Failed buttons when status is disconnected', async () => {
    const { TaskStatusActions } = await import('@/components/tasks/task-status-actions');
    const mockOnStatusChange = vi.fn();
    
    render(
      <TaskStatusActions
        currentStatus="disconnected"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText(/resume/i)).toBeInTheDocument();
    expect(screen.getByText(/mark.*failed/i)).toBeInTheDocument();
  });

  it('should show no buttons when status is completed', async () => {
    const { TaskStatusActions } = await import('@/components/tasks/task-status-actions');
    const mockOnStatusChange = vi.fn();
    
    render(
      <TaskStatusActions
        currentStatus="completed"
        onStatusChange={mockOnStatusChange}
      />
    );

    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });

  it('should show no buttons when status is failed', async () => {
    const { TaskStatusActions } = await import('@/components/tasks/task-status-actions');
    const mockOnStatusChange = vi.fn();
    
    render(
      <TaskStatusActions
        currentStatus="failed"
        onStatusChange={mockOnStatusChange}
      />
    );

    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });

  it('should call onStatusChange with running when Start is clicked', async () => {
    const { TaskStatusActions } = await import('@/components/tasks/task-status-actions');
    const mockOnStatusChange = vi.fn();
    
    render(
      <TaskStatusActions
        currentStatus="pending"
        onStatusChange={mockOnStatusChange}
      />
    );

    const startButton = screen.getByText(/start/i);
    fireEvent.click(startButton);

    expect(mockOnStatusChange).toHaveBeenCalledWith('running');
  });

  it('should call onStatusChange with completed when Complete is clicked', async () => {
    const { TaskStatusActions } = await import('@/components/tasks/task-status-actions');
    const mockOnStatusChange = vi.fn();
    
    render(
      <TaskStatusActions
        currentStatus="running"
        onStatusChange={mockOnStatusChange}
      />
    );

    const completeButton = screen.getByText(/complete/i);
    fireEvent.click(completeButton);

    expect(mockOnStatusChange).toHaveBeenCalledWith('completed');
  });

  it('should call onStatusChange with failed when Fail is clicked', async () => {
    const { TaskStatusActions } = await import('@/components/tasks/task-status-actions');
    const mockOnStatusChange = vi.fn();
    
    render(
      <TaskStatusActions
        currentStatus="running"
        onStatusChange={mockOnStatusChange}
      />
    );

    const failButton = screen.getByText(/fail/i);
    fireEvent.click(failButton);

    expect(mockOnStatusChange).toHaveBeenCalledWith('failed');
  });

  it('should call onStatusChange with paused when Pause is clicked', async () => {
    const { TaskStatusActions } = await import('@/components/tasks/task-status-actions');
    const mockOnStatusChange = vi.fn();
    
    render(
      <TaskStatusActions
        currentStatus="running"
        onStatusChange={mockOnStatusChange}
      />
    );

    const pauseButton = screen.getByText(/pause/i);
    fireEvent.click(pauseButton);

    expect(mockOnStatusChange).toHaveBeenCalledWith('paused');
  });

  it('should call onStatusChange with running when Resume is clicked from paused', async () => {
    const { TaskStatusActions } = await import('@/components/tasks/task-status-actions');
    const mockOnStatusChange = vi.fn();
    
    render(
      <TaskStatusActions
        currentStatus="paused"
        onStatusChange={mockOnStatusChange}
      />
    );

    const resumeButton = screen.getByText(/resume/i);
    fireEvent.click(resumeButton);

    expect(mockOnStatusChange).toHaveBeenCalledWith('running');
  });

  it('should disable buttons when loading', async () => {
    const { TaskStatusActions } = await import('@/components/tasks/task-status-actions');
    const mockOnStatusChange = vi.fn();
    
    render(
      <TaskStatusActions
        currentStatus="pending"
        onStatusChange={mockOnStatusChange}
        isLoading={true}
      />
    );

    const startButton = screen.getByText(/start/i);
    expect(startButton).toBeDisabled();
  });

  it('should show loading state on button text', async () => {
    const { TaskStatusActions } = await import('@/components/tasks/task-status-actions');
    const mockOnStatusChange = vi.fn();
    
    render(
      <TaskStatusActions
        currentStatus="pending"
        onStatusChange={mockOnStatusChange}
        isLoading={true}
      />
    );

    // Should show loading indicator
    expect(screen.getByText(/start/i)).toBeInTheDocument();
  });

  it('should only show valid transition buttons based on state machine', async () => {
    const { TaskStatusActions } = await import('@/components/tasks/task-status-actions');
    const mockOnStatusChange = vi.fn();
    
    // From pending, only running is valid
    const { rerender } = render(
      <TaskStatusActions
        currentStatus="pending"
        onStatusChange={mockOnStatusChange}
      />
    );
    
    expect(screen.queryByText(/complete/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/pause/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/fail/i)).not.toBeInTheDocument();
  });

  it('should apply appropriate button variants for actions', async () => {
    const { TaskStatusActions } = await import('@/components/tasks/task-status-actions');
    const mockOnStatusChange = vi.fn();
    
    render(
      <TaskStatusActions
        currentStatus="running"
        onStatusChange={mockOnStatusChange}
      />
    );

    // Complete button should exist (success variant)
    const completeButton = screen.getByText(/complete/i);
    expect(completeButton).toBeInTheDocument();

    // Fail button should exist (destructive variant)
    const failButton = screen.getByText(/fail/i);
    expect(failButton).toBeInTheDocument();
  });
});
