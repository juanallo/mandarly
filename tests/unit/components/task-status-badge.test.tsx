import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskStatusBadge } from '@/components/tasks/task-status-badge';

describe('TaskStatusBadge', () => {
  it('renders pending status with correct styling', () => {
    render(<TaskStatusBadge status="pending" />);
    const badge = screen.getByText('pending');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-500'); // Update with actual class
  });

  it('renders running status with correct styling', () => {
    render(<TaskStatusBadge status="running" />);
    const badge = screen.getByText('running');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-500'); // Update with actual class
  });

  it('renders completed status with correct styling', () => {
    render(<TaskStatusBadge status="completed" />);
    const badge = screen.getByText('completed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-500'); // Update with actual class
  });

  it('renders failed status with correct styling', () => {
    render(<TaskStatusBadge status="failed" />);
    const badge = screen.getByText('failed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-500'); // Update with actual class
  });

  it('renders paused status with correct styling', () => {
    render(<TaskStatusBadge status="paused" />);
    const badge = screen.getByText('paused');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-500'); // Update with actual class
  });

  it('renders disconnected status with correct styling', () => {
    render(<TaskStatusBadge status="disconnected" />);
    const badge = screen.getByText('disconnected');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-orange-500'); // Update with actual class
  });

  it('applies custom className when provided', () => {
    const { container } = render(<TaskStatusBadge status="pending" className="custom-class" />);
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('custom-class');
    expect(badge).toHaveTextContent('pending');
  });
});
