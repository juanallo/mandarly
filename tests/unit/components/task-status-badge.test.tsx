import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskStatusBadge } from '@/components/tasks/task-status-badge';

describe('TaskStatusBadge', () => {
  it('renders pending status with correct styling', () => {
    render(<TaskStatusBadge status="pending" />);
    const badge = screen.getByText('Pending');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100');
    expect(badge).toHaveClass('text-gray-600');
  });

  it('renders running status with correct styling', () => {
    render(<TaskStatusBadge status="running" />);
    const badge = screen.getByText('In Progress');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).toHaveClass('text-blue-600');
  });

  it('renders completed status with correct styling', () => {
    render(<TaskStatusBadge status="completed" />);
    const badge = screen.getByText('Completed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-600');
  });

  it('renders failed status with correct styling', () => {
    render(<TaskStatusBadge status="failed" />);
    const badge = screen.getByText('Failed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100');
    expect(badge).toHaveClass('text-red-600');
  });

  it('renders paused status with correct styling', () => {
    render(<TaskStatusBadge status="paused" />);
    const badge = screen.getByText('Paused');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-100');
    expect(badge).toHaveClass('text-yellow-600');
  });

  it('renders disconnected status with correct styling', () => {
    render(<TaskStatusBadge status="disconnected" />);
    const badge = screen.getByText('Disconnected');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-orange-100');
    expect(badge).toHaveClass('text-orange-600');
  });

  it('applies custom className when provided', () => {
    const { container } = render(<TaskStatusBadge status="pending" className="custom-class" />);
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('custom-class');
    expect(badge).toHaveTextContent('Pending');
  });
});
