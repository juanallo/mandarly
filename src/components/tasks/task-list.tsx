'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TaskCard } from './task-card';
import { TaskFilters, type TaskFilterValues } from './task-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/layout/empty-state';
import type { TaskWithProject } from '@/lib/api/schemas';

interface TaskListProps {
  tasks: TaskWithProject[];
  projects?: Array<{ id: string; name: string }>;
  isLoading?: boolean;
  groupByProject?: boolean;
  onRerun?: (task: TaskWithProject) => void;
}

interface GroupedTasks {
  projectId: string | null;
  projectName: string | null;
  tasks: TaskWithProject[];
}

function groupTasksByProject(tasks: TaskWithProject[]): GroupedTasks[] {
  const groups = new Map<string | null, GroupedTasks>();

  tasks.forEach((task) => {
    const key = task.projectId;
    if (!groups.has(key)) {
      groups.set(key, {
        projectId: key,
        projectName: task.project?.name || null,
        tasks: [],
      });
    }
    groups.get(key)!.tasks.push(task);
  });

  // Sort: projects with tasks first, then null (no project)
  return Array.from(groups.values()).sort((a, b) => {
    if (a.projectId === null) return 1;
    if (b.projectId === null) return -1;
    return (a.projectName || '').localeCompare(b.projectName || '');
  });
}

export function TaskList({ 
  tasks, 
  projects = [], 
  isLoading = false,
  groupByProject = true,
  onRerun,
}: TaskListProps) {
  const [filters, setFilters] = useState<TaskFilterValues>({});

  // Apply client-side filtering
  const filteredTasks = tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.projectId && task.projectId !== filters.projectId) return false;
    if (filters.environmentType && task.environmentType !== filters.environmentType) return false;
    if (filters.aiVendor && task.aiVendor !== filters.aiVendor) return false;
    if (filters.search && !task.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.branchName && task.branchName !== filters.branchName) return false;
    return true;
  });

  const groupedTasks = groupByProject ? groupTasksByProject(filteredTasks) : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TaskFilters filters={filters} onFiltersChange={setFilters} projects={projects} />
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="space-y-6">
        <TaskFilters filters={filters} onFiltersChange={setFilters} projects={projects} />
        <EmptyState
          title="No tasks found"
          description={
            Object.keys(filters).length > 0
              ? 'Try adjusting your filters'
              : 'Create your first task to get started'
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TaskFilters filters={filters} onFiltersChange={setFilters} projects={projects} />

      {groupByProject && groupedTasks ? (
        <div className="space-y-8">
          {groupedTasks.map((group) => (
            <div key={group.projectId || 'no-project'} className="space-y-4">
              <h3 className="text-lg font-semibold">
                {group.projectName || 'No Project'}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({group.tasks.length} {group.tasks.length === 1 ? 'task' : 'tasks'})
                </span>
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.tasks.map((task) => (
                  <Link key={task.id} href={`/tasks/${task.id}`}>
                    <TaskCard task={task} onRerun={onRerun} />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <Link key={task.id} href={`/tasks/${task.id}`}>
              <TaskCard task={task} onRerun={onRerun} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
