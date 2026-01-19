'use client';

import { TaskCard } from './task-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TaskWithProject } from '@/lib/api/schemas';
import type { StatusConfig } from '@/lib/constants';
import * as LucideIcons from 'lucide-react';

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
  // Get the icon component dynamically
  const IconComponent = (LucideIcons as any)[status.iconName] || LucideIcons.Circle;

  return (
    <div
      className={cn(
        'flex w-80 flex-shrink-0 flex-col rounded-lg border-2 bg-gray-50',
        status.borderColor,
        className
      )}
    >
      {/* Column Header */}
      <div className={cn('flex items-center justify-between border-b-2 p-4', status.bgColor, status.borderColor)}>
        <div className="flex items-center gap-2">
          <IconComponent className={cn('h-5 w-5', status.color)} />
          <h3 className={cn('font-semibold', status.color)}>{status.label}</h3>
        </div>
        <Badge variant="secondary" className="h-6">
          {tasks.length}
        </Badge>
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
    </div>
  );
}
