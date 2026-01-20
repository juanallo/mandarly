'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'mandarly-sidebar-collapsed';

/**
 * Hook for managing sidebar collapse state with localStorage persistence
 * 
 * @returns {Object} Sidebar state and controls
 * @returns {boolean} isCollapsed - Whether sidebar is collapsed
 * @returns {function} toggleSidebar - Toggle collapse state
 * @returns {function} setIsCollapsed - Set collapse state directly
 */
export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setIsCollapsed(stored === 'true');
      }
    } catch (error) {
      console.error('Failed to load sidebar state:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist state changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    } catch (error) {
      console.error('Failed to save sidebar state:', error);
    }
  }, [isCollapsed, isLoaded]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return {
    isCollapsed,
    isLoaded,
    toggleSidebar,
    setIsCollapsed,
  };
}
