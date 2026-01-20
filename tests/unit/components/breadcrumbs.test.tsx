import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs, generateBreadcrumbs } from '@/components/layout/breadcrumbs';

describe('Breadcrumbs', () => {
  describe('Component Rendering', () => {
    it('should render breadcrumb items', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Tasks', href: '/tasks' },
        { label: 'Task 123', current: true },
      ];

      render(<Breadcrumbs items={items} />);

      // Home is rendered as an icon with aria-label
      expect(screen.getByLabelText('Home')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Task 123')).toBeInTheDocument();
    });

    it('should render home icon for root path', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Tasks', current: true },
      ];

      render(<Breadcrumbs items={items} />);

      const homeLink = screen.getByLabelText('Home');
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should render links for non-current items', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Tasks', href: '/tasks' },
        { label: 'Task 123', current: true },
      ];

      render(<Breadcrumbs items={items} />);

      const tasksLink = screen.getByRole('link', { name: 'Tasks' });
      expect(tasksLink).toHaveAttribute('href', '/tasks');
    });

    it('should not render link for current item', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Current Page', current: true },
      ];

      render(<Breadcrumbs items={items} />);

      const currentItem = screen.getByText('Current Page');
      expect(currentItem.tagName).toBe('SPAN');
    });

    it('should set aria-current on current item', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Current Page', current: true },
      ];

      render(<Breadcrumbs items={items} />);

      const currentItem = screen.getByText('Current Page');
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });

    it('should render chevron separators between items', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Tasks', href: '/tasks' },
        { label: 'Task 123', current: true },
      ];

      const { container } = render(<Breadcrumbs items={items} />);

      // Should have 2 chevrons (between 3 items)
      const chevrons = container.querySelectorAll('svg.lucide-chevron-right');
      expect(chevrons).toHaveLength(2);
    });

    it('should return null for empty items', () => {
      const { container } = render(<Breadcrumbs items={[]} />);

      expect(container.firstChild).toBeNull();
    });

    it('should apply custom className', () => {
      const items = [{ label: 'Test', current: true }];

      const { container } = render(
        <Breadcrumbs items={items} className="custom-class" />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('custom-class');
    });
  });

  describe('generateBreadcrumbs', () => {
    it('should generate breadcrumbs for root path', () => {
      const breadcrumbs = generateBreadcrumbs('/');

      expect(breadcrumbs).toEqual([
        { label: 'Dashboard', href: '/', current: true },
      ]);
    });

    it('should generate breadcrumbs for simple path', () => {
      const breadcrumbs = generateBreadcrumbs('/tasks');

      expect(breadcrumbs).toEqual([
        { label: 'Home', href: '/' },
        { label: 'Tasks', href: undefined, current: true },
      ]);
    });

    it('should generate breadcrumbs for nested path', () => {
      const breadcrumbs = generateBreadcrumbs('/tasks/123');

      expect(breadcrumbs).toEqual([
        { label: 'Home', href: '/' },
        { label: 'Tasks', href: '/tasks' },
        { label: '123', href: undefined, current: true },
      ]);
    });

    it('should generate breadcrumbs for deeply nested path', () => {
      const breadcrumbs = generateBreadcrumbs('/projects/456/tasks');

      expect(breadcrumbs).toEqual([
        { label: 'Home', href: '/' },
        { label: 'Projects', href: '/projects' },
        { label: '456', href: '/projects/456' },
        { label: 'Tasks', href: undefined, current: true },
      ]);
    });

    it('should capitalize segment labels', () => {
      const breadcrumbs = generateBreadcrumbs('/my-tasks');

      expect(breadcrumbs[1]).toEqual({
        label: 'My Tasks',
        href: undefined,
        current: true,
      });
    });

    it('should handle "new" segment specially', () => {
      const breadcrumbs = generateBreadcrumbs('/tasks/new');

      expect(breadcrumbs[2]).toEqual({
        label: 'New',
        href: undefined,
        current: true,
      });
    });

    it('should apply overrides for specific paths', () => {
      const overrides = {
        '/tasks/123': 'Fix Login Bug',
      };

      const breadcrumbs = generateBreadcrumbs('/tasks/123', overrides);

      expect(breadcrumbs[2]).toEqual({
        label: 'Fix Login Bug',
        href: undefined,
        current: true,
      });
    });
  });
});
