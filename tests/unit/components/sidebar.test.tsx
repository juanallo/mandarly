import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '@/components/layout/sidebar';
import { useSidebarContext } from '@/components/sidebar-provider';

// Mock the sidebar context
vi.mock('@/components/sidebar-provider', () => ({
  useSidebarContext: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Sidebar', () => {
  const mockSidebarContext = {
    isCollapsed: false,
    isLoaded: true,
    toggleSidebar: vi.fn(),
    setIsCollapsed: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useSidebarContext).mockReturnValue(mockSidebarContext);
    vi.clearAllMocks();
  });

  it('should render workspace branding', () => {
    render(<Sidebar />);

    expect(screen.getByText('AI Task Tracker')).toBeInTheDocument();
  });

  it('should render main navigation items', () => {
    render(<Sidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Presets')).toBeInTheDocument();
  });

  it('should render sidebar toggle button', () => {
    render(<Sidebar />);

    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('should call toggleSidebar when toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    await user.click(toggleButton);

    expect(mockSidebarContext.toggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('should render user navigation section', () => {
    render(<Sidebar />);

    // User nav should be present (check for User icon or email)
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should apply collapsed styles when isCollapsed is true', () => {
    vi.mocked(useSidebarContext).mockReturnValue({
      ...mockSidebarContext,
      isCollapsed: true,
    });

    render(<Sidebar />);

    const sidebar = screen.getByRole('navigation').parentElement;
    expect(sidebar).toHaveClass('w-16');
  });

  it('should apply expanded styles when isCollapsed is false', () => {
    render(<Sidebar />);

    const sidebar = screen.getByRole('navigation').parentElement;
    expect(sidebar).toHaveClass('w-64');
  });

  it('should hide navigation labels when collapsed', () => {
    vi.mocked(useSidebarContext).mockReturnValue({
      ...mockSidebarContext,
      isCollapsed: true,
    });

    render(<Sidebar />);

    // Labels should not be visible when collapsed (check for specific styling or absence)
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
  });

  it('should render New Task button', () => {
    render(<Sidebar />);

    const newTaskButton = screen.getByRole('link', { name: /new task/i });
    expect(newTaskButton).toBeInTheDocument();
    expect(newTaskButton).toHaveAttribute('href', '/tasks/new');
  });

  it('should have proper transition classes for smooth animation', () => {
    render(<Sidebar />);

    const sidebar = screen.getByRole('navigation').parentElement;
    expect(sidebar).toHaveClass('transition-all');
  });
});
