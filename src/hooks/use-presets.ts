'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PresetListResponse, ConfigPreset, CreatePresetRequest, UpdatePresetRequest } from '@/lib/api/schemas';

// API client functions
async function fetchPresets(): Promise<PresetListResponse> {
  const response = await fetch('/api/presets');
  if (!response.ok) {
    throw new Error('Failed to fetch presets');
  }
  return response.json();
}

async function fetchPreset(id: string): Promise<ConfigPreset> {
  const response = await fetch(`/api/presets/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch preset');
  }
  return response.json();
}

async function createPreset(data: CreatePresetRequest): Promise<ConfigPreset> {
  const response = await fetch('/api/presets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create preset');
  }

  return response.json();
}

async function updatePreset(id: string, data: UpdatePresetRequest): Promise<ConfigPreset> {
  const response = await fetch(`/api/presets/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update preset');
  }

  return response.json();
}

async function deletePreset(id: string): Promise<void> {
  const response = await fetch(`/api/presets/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete preset');
  }
}

// Query keys
export const presetKeys = {
  all: ['presets'] as const,
  lists: () => [...presetKeys.all, 'list'] as const,
  list: () => [...presetKeys.lists()] as const,
  details: () => [...presetKeys.all, 'detail'] as const,
  detail: (id: string) => [...presetKeys.details(), id] as const,
};

// Hooks
export function usePresets() {
  return useQuery({
    queryKey: presetKeys.list(),
    queryFn: fetchPresets,
    staleTime: 60000, // 1 minute
  });
}

export function usePreset(id: string) {
  return useQuery({
    queryKey: presetKeys.detail(id),
    queryFn: () => fetchPreset(id),
    staleTime: 60000, // 1 minute
  });
}

export function useCreatePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presetKeys.lists() });
    },
  });
}

export function useUpdatePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePresetRequest }) =>
      updatePreset(id, data),
    onSuccess: (updatedPreset) => {
      queryClient.setQueryData(presetKeys.detail(updatedPreset.id), updatedPreset);
      queryClient.invalidateQueries({ queryKey: presetKeys.lists() });
    },
  });
}

export function useDeletePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presetKeys.lists() });
    },
  });
}
