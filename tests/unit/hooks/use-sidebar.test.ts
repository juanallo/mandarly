import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSidebar } from '@/hooks/use-sidebar';

describe('useSidebar', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with collapsed=false by default', () => {
    const { result } = renderHook(() => useSidebar());

    expect(result.current.isCollapsed).toBe(false);
  });

  it('should load initial state from localStorage', async () => {
    localStorage.setItem('mandarly-sidebar-collapsed', 'true');

    const { result } = renderHook(() => useSidebar());

    // Wait for effect to run
    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    expect(result.current.isCollapsed).toBe(true);
  });

  it('should toggle sidebar state', () => {
    const { result } = renderHook(() => useSidebar());

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.isCollapsed).toBe(true);

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.isCollapsed).toBe(false);
  });

  it('should persist state to localStorage when changed', async () => {
    const { result } = renderHook(() => useSidebar());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    act(() => {
      result.current.setIsCollapsed(true);
    });

    // Wait for state to persist
    await waitFor(() => {
      expect(localStorage.getItem('mandarly-sidebar-collapsed')).toBe('true');
    });
  });

  it('should handle localStorage errors gracefully on load', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('Storage access denied');
      });

    const { result } = renderHook(() => useSidebar());

    expect(result.current.isCollapsed).toBe(false);
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to load sidebar state:',
      expect.any(Error)
    );

    consoleError.mockRestore();
    getItemSpy.mockRestore();
  });

  it('should handle localStorage errors gracefully on save', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

    const { result } = renderHook(() => useSidebar());

    act(() => {
      result.current.toggleSidebar();
    });

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to save sidebar state:',
      expect.any(Error)
    );

    consoleError.mockRestore();
    setItemSpy.mockRestore();
  });

  it('should set collapsed state directly with setIsCollapsed', () => {
    const { result } = renderHook(() => useSidebar());

    act(() => {
      result.current.setIsCollapsed(true);
    });

    expect(result.current.isCollapsed).toBe(true);

    act(() => {
      result.current.setIsCollapsed(false);
    });

    expect(result.current.isCollapsed).toBe(false);
  });

  it('should have isLoaded flag set after initialization', async () => {
    const { result } = renderHook(() => useSidebar());

    // Wait for load to complete
    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    // After load, state should be persisted
    expect(localStorage.getItem('mandarly-sidebar-collapsed')).toBe('false');
  });

  it('should return isLoaded flag', () => {
    const { result } = renderHook(() => useSidebar());

    expect(result.current.isLoaded).toBeDefined();
    expect(typeof result.current.isLoaded).toBe('boolean');
  });
});
