'use client';

import { useQuery } from '@tanstack/react-query';
import type { ProjectListResponse } from '@/lib/api/schemas';

// API client functions
async function fetchProjects(): Promise<ProjectListResponse> {
  const response = await fetch('/api/projects');
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
}

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: () => [...projectKeys.lists()] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// Hooks
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: fetchProjects,
    staleTime: 60000, // 1 minute
  });
}

// Additional hooks will be added as we implement more features
