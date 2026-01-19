import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarToggle } from '@/components/layout/sidebar-toggle';

describe('SidebarToggle', () => {
  it('should render collapse icon when not collapsed', () => {
    render(<SidebarToggle collapsed={false} onToggle={() => {}} />);

    const button = screen.getByRole('button', { name: /collapse sidebar/i });
    expect(button).toBeInTheDocument();
  });

  it('should render expand icon when collapsed', () => {
    render(<SidebarToggle collapsed={true} onToggle={() => {}} />);

    const button = screen.getByRole('button', { name: /expand sidebar/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onToggle when clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<SidebarToggle collapsed={false} onToggle={onToggle} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    render(
      <SidebarToggle 
        collapsed={false} 
        onToggle={() => {}} 
        className="custom-class" 
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should have proper aria-label for accessibility', () => {
    const { rerender } = render(
      <SidebarToggle collapsed={false} onToggle={() => {}} />
    );

    let button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Collapse sidebar');

    rerender(<SidebarToggle collapsed={true} onToggle={() => {}} />);

    button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Expand sidebar');
  });

  it('should have proper title attribute for tooltip', () => {
    const { rerender } = render(
      <SidebarToggle collapsed={false} onToggle={() => {}} />
    );

    let button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Collapse sidebar');

    rerender(<SidebarToggle collapsed={true} onToggle={() => {}} />);

    button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Expand sidebar');
  });
});
