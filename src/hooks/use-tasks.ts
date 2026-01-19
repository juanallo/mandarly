'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  TaskWithProject,
  CreateTaskRequest,
  ListTasksQuery,
  TaskListResponse,
} from '@/lib/api/schemas';

// API client functions
async function fetchTasks(query: Partial<ListTasksQuery> = {}): Promise<TaskListResponse> {
  const params = new URLSearchParams();
  
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`/api/tasks?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

async function createTask(data: CreateTaskRequest): Promise<TaskWithProject> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create task');
  }

  return response.json();
}

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: Partial<ListTasksQuery>) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

// Hooks
export function useTasks(query: Partial<ListTasksQuery> = {}) {
  return useQuery({
    queryKey: taskKeys.list(query),
    queryFn: () => fetchTasks(query),
    staleTime: 30000, // 30 seconds
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

// Additional hooks will be added as we implement more features
