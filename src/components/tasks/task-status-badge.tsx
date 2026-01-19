import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TaskStatus } from '@/lib/api/schemas';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusConfig: Record<
  TaskStatus,
  { label: string; variant: string; className: string }
> = {
  pending: {
    label: 'pending',
    variant: 'secondary',
    className: 'bg-gray-500 hover:bg-gray-500 text-white',
  },
  running: {
    label: 'running',
    variant: 'default',
    className: 'bg-blue-500 hover:bg-blue-500 text-white',
  },
  completed: {
    label: 'completed',
    variant: 'default',
    className: 'bg-green-500 hover:bg-green-500 text-white',
  },
  failed: {
    label: 'failed',
    variant: 'destructive',
    className: 'bg-red-500 hover:bg-red-500 text-white',
  },
  paused: {
    label: 'paused',
    variant: 'secondary',
    className: 'bg-yellow-500 hover:bg-yellow-500 text-white',
  },
  disconnected: {
    label: 'disconnected',
    variant: 'secondary',
    className: 'bg-orange-500 hover:bg-orange-500 text-white',
  },
};

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant as any}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
