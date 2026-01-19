'use client';

import { KanbanColumn } from './kanban-column';
import { Skeleton } from '@/components/ui/skeleton';
import { STATUS_CONFIG, TaskStatus } from '@/lib/constants';
import type { TaskWithProject } from '@/lib/api/schemas';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  tasks: TaskWithProject[];
  isLoading?: boolean;
  onTaskClick?: (task: TaskWithProject) => void;
  onRerun?: (task: TaskWithProject) => void;
  className?: string;
}

// Order of statuses for kanban columns
const STATUS_ORDER: TaskStatus[] = [
  TaskStatus.PENDING,
  TaskStatus.RUNNING,
  TaskStatus.PAUSED,
  TaskStatus.COMPLETED,
  TaskStatus.FAILED,
  TaskStatus.DISCONNECTED,
];

export function KanbanBoard({
  tasks,
  isLoading = false,
  onTaskClick,
  onRerun,
  className,
}: KanbanBoardProps) {
  if (isLoading) {
    return (
      <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
        {STATUS_ORDER.map((status) => (
          <Skeleton key={status} className="h-96 w-80 flex-shrink-0" />
        ))}
      </div>
    );
  }

  // Group tasks by status
  const tasksByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = tasks.filter((task) => task.status === status);
    return acc;
  }, {} as Record<TaskStatus, TaskWithProject[]>);

  return (
    <div
      className={cn(
        'flex gap-4 overflow-x-auto pb-4',
        // Add scrollbar styling
        'scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300',
        className
      )}
    >
      {STATUS_ORDER.map((status) => {
        const statusConfig = STATUS_CONFIG[status];
        const statusTasks = tasksByStatus[status] || [];

        return (
          <KanbanColumn
            key={status}
            status={statusConfig}
            tasks={statusTasks}
            onTaskClick={onTaskClick}
            onRerun={onRerun}
          />
        );
      })}
    </div>
  );
}
