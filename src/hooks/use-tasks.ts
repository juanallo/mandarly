'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  TaskWithProject,
  CreateTaskRequest,
  ListTasksQuery,
  TaskListResponse,
  StatusHistory,
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

// Fetch single task
async function fetchTask(id: string): Promise<TaskWithProject> {
  const response = await fetch(`/api/tasks/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch task');
  }
  return response.json();
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => fetchTask(id),
    staleTime: 30000, // 30 seconds
  });
}

// Rerun task
async function rerunTask(taskId: string, modifications?: any): Promise<TaskWithProject> {
  const response = await fetch(`/api/tasks/${taskId}/rerun`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ modifications }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to rerun task');
  }

  return response.json();
}

export function useRerunTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, modifications }: { taskId: string; modifications?: any }) =>
      rerunTask(taskId, modifications),
    onSuccess: () => {
      // Invalidate tasks list and dashboard
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Update task
async function updateTask(id: string, data: any): Promise<TaskWithProject> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update task');
  }

  return response.json();
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTask(id, data),
    onSuccess: (updatedTask) => {
      // Update the specific task in cache
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);
      
      // Invalidate lists to refresh
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Fetch task status history
async function fetchTaskHistory(id: string): Promise<StatusHistory[]> {
  const response = await fetch(`/api/tasks/${id}/history`);
  if (!response.ok) {
    throw new Error('Failed to fetch task history');
  }
  return response.json();
}

export function useTaskHistory(id: string) {
  return useQuery({
    queryKey: [...taskKeys.detail(id), 'history'],
    queryFn: () => fetchTaskHistory(id),
    staleTime: 30000, // 30 seconds
  });
}

// Delete task
async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete task');
  }
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
