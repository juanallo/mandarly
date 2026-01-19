import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the EnvironmentSelector component (will fail until implemented)
// This test is written FIRST per TDD approach
describe('EnvironmentSelector', () => {
  it('should render all three environment type tabs', async () => {
    // This will fail until EnvironmentSelector is implemented
    const { EnvironmentSelector } = await import('@/components/tasks/environment-selector');
    const mockOnChange = vi.fn();
    
    render(
      <EnvironmentSelector
        value={{ type: 'local' }}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/local/i)).toBeInTheDocument();
    expect(screen.getByText(/worktree/i)).toBeInTheDocument();
    expect(screen.getByText(/remote/i)).toBeInTheDocument();
  });

  it('should show no additional fields for local environment', async () => {
    const { EnvironmentSelector } = await import('@/components/tasks/environment-selector');
    const mockOnChange = vi.fn();
    
    render(
      <EnvironmentSelector
        value={{ type: 'local' }}
        onChange={mockOnChange}
      />
    );

    // Local should have no input fields
    const inputs = screen.queryAllByRole('textbox');
    expect(inputs.length).toBe(0);
  });

  it('should show path and branch fields for worktree environment', async () => {
    const { EnvironmentSelector } = await import('@/components/tasks/environment-selector');
    const mockOnChange = vi.fn();
    
    render(
      <EnvironmentSelector
        value={{ type: 'worktree', path: '', branch: '' }}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText(/path/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/branch/i)).toBeInTheDocument();
  });

  it('should show connection fields for remote environment', async () => {
    const { EnvironmentSelector } = await import('@/components/tasks/environment-selector');
    const mockOnChange = vi.fn();
    
    render(
      <EnvironmentSelector
        value={{
          type: 'remote',
          connectionType: 'ssh',
          host: '',
        }}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText(/host/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/connection type/i)).toBeInTheDocument();
  });

  it('should call onChange when switching environment types', async () => {
    const { EnvironmentSelector } = await import('@/components/tasks/environment-selector');
    const mockOnChange = vi.fn();
    
    render(
      <EnvironmentSelector
        value={{ type: 'local' }}
        onChange={mockOnChange}
      />
    );

    const worktreeTab = screen.getByText(/worktree/i);
    fireEvent.click(worktreeTab);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'worktree' })
      );
    });
  });

  it('should call onChange when updating worktree path', async () => {
    const { EnvironmentSelector } = await import('@/components/tasks/environment-selector');
    const mockOnChange = vi.fn();
    
    render(
      <EnvironmentSelector
        value={{ type: 'worktree', path: '/test/path' }}
        onChange={mockOnChange}
      />
    );

    const pathInput = screen.getByLabelText(/path/i);
    fireEvent.change(pathInput, { target: { value: '/new/path' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'worktree',
          path: '/new/path',
        })
      );
    });
  });

  it('should call onChange when updating remote host', async () => {
    const { EnvironmentSelector } = await import('@/components/tasks/environment-selector');
    const mockOnChange = vi.fn();
    
    render(
      <EnvironmentSelector
        value={{
          type: 'remote',
          connectionType: 'ssh',
          host: 'old-host',
        }}
        onChange={mockOnChange}
      />
    );

    const hostInput = screen.getByLabelText(/host/i);
    fireEvent.change(hostInput, { target: { value: 'new-host' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'remote',
          host: 'new-host',
        })
      );
    });
  });

  it('should show port and user fields for remote SSH', async () => {
    const { EnvironmentSelector } = await import('@/components/tasks/environment-selector');
    const mockOnChange = vi.fn();
    
    render(
      <EnvironmentSelector
        value={{
          type: 'remote',
          connectionType: 'ssh',
          host: 'test.com',
          port: 22,
          user: 'testuser',
        }}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText(/port/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/user/i)).toBeInTheDocument();
  });
});
