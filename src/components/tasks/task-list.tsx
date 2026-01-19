'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TaskCard } from './task-card';
import { KanbanBoard } from './kanban-board';
import { TaskFilters, type TaskFilterValues } from './task-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/layout/empty-state';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Columns3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskWithProject } from '@/lib/api/schemas';

type ViewMode = 'grid' | 'kanban';

interface TaskListProps {
  tasks: TaskWithProject[];
  projects?: Array<{ id: string; name: string }>;
  isLoading?: boolean;
  groupByProject?: boolean;
  defaultView?: ViewMode;
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
  defaultView = 'grid',
  onRerun,
}: TaskListProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<TaskFilterValues>({});
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);

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

  const handleTaskClick = (task: TaskWithProject) => {
    router.push(`/tasks/${task.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <TaskFilters filters={filters} onFiltersChange={setFilters} projects={projects} />
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
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
        <div className="flex items-center justify-between">
          <TaskFilters filters={filters} onFiltersChange={setFilters} projects={projects} />
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
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
    <div className="h-full flex flex-col">
      <div className="flex items-end justify-between mb-6 shrink-0 px-6 pt-6">
        <TaskFilters filters={filters} onFiltersChange={setFilters} projects={projects} />
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {viewMode === 'kanban' ? (
        <div className="flex flex-col flex-1 min-h-0 px-6 pb-6">
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-hidden min-h-0">
              <KanbanBoard
                tasks={filteredTasks}
                isLoading={isLoading}
                onTaskClick={handleTaskClick}
                onRerun={onRerun}
              />
            </div>
            <div className="text-sm text-muted-foreground text-center py-2 shrink-0">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>
          </div>
        </div>
      ) : groupByProject && groupedTasks ? (
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

// View toggle component
function ViewToggle({
  viewMode,
  onViewModeChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border p-0.5">
      <Button
        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="h-7 w-7 p-0"
        aria-label="Grid view"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('kanban')}
        className="h-7 w-7 p-0"
        aria-label="Kanban view"
      >
        <Columns3 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
