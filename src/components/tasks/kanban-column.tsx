'use client';

import { TaskCard } from './task-card';
import { TaskStatusBadge } from './task-status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TaskWithProject } from '@/lib/api/schemas';
import type { StatusConfig } from '@/lib/constants';
import { Plus, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface KanbanColumnProps {
  status: StatusConfig;
  tasks: TaskWithProject[];
  onTaskClick?: (task: TaskWithProject) => void;
  onRerun?: (task: TaskWithProject) => void;
  className?: string;
}

export function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  onRerun,
  className,
}: KanbanColumnProps) {
  return (
    <div
      className={cn(
        'flex w-80 shrink-0 flex-col rounded-lg bg-gray-50 shadow-sm border border-gray-300 h-full',
        className
      )}
    >
      {/* Column Header */}
      <div className="flex items-end justify-between border-b border-gray-200 pt-6 pb-3 px-4">
        <TaskStatusBadge status={status.status} showIcon={true} />
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="h-5 px-2 text-xs font-medium bg-gray-100 text-gray-700 rounded">
            {tasks.length}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-600 hover:text-gray-900"
            asChild
          >
            <Link href="/tasks/new">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-600 hover:text-gray-900"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Column Content - Scrollable */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {tasks.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">No {status.label.toLowerCase()} tasks</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onTaskClick?.(task)}
              className={cn(onTaskClick && 'cursor-pointer')}
            >
              <TaskCard task={task} onRerun={onRerun} />
            </div>
          ))
        )}
      </div>

      {/* Add Task Button */}
      <div className="p-4 border-t border-gray-300">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900"
          asChild
        >
          <Link href="/tasks/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Add task</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
