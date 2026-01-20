import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG } from '@/lib/constants';
import type { TaskStatus } from '@/lib/api/schemas';
import * as LucideIcons from 'lucide-react';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  showIcon?: boolean;
  className?: string;
}

export function TaskStatusBadge({ status, showIcon = true, className }: TaskStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  // Get the icon component dynamically
  const IconComponent = showIcon
    ? (LucideIcons as any)[config.iconName] || LucideIcons.Circle
    : null;

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 font-medium',
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {IconComponent && <IconComponent className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
