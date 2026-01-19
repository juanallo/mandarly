import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TaskStatusBadge } from './task-status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TaskWithProject } from '@/lib/api/schemas';
import type { AIVendor } from '@/types';
import { Clock, GitBranch, Laptop, Server, FolderGit2, AlertCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { isEnvironmentStale, getStaleEnvironmentWarning } from '@/lib/environment-validator';
import { getVendorWarningMessage } from '@/lib/vendor-validator';

interface TaskCardProps {
  task: TaskWithProject;
  className?: string;
  onRerun?: (task: TaskWithProject) => void;
}

function formatDate(date: string | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString();
}

function calculateDuration(startedAt: string | null): string {
  if (!startedAt) return '';
  const start = new Date(startedAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMins % 60}m`;
  }
  return `${diffMins}m`;
}

function getEnvironmentIcon(type: string) {
  switch (type) {
    case 'local':
      return <Laptop className="h-4 w-4" />;
    case 'worktree':
      return <FolderGit2 className="h-4 w-4" />;
    case 'remote':
      return <Server className="h-4 w-4" />;
    default:
      return <Laptop className="h-4 w-4" />;
  }
}

export function TaskCard({ task, className, onRerun }: TaskCardProps) {
  const duration = task.status === 'running' && task.startedAt
    ? calculateDuration(task.startedAt)
    : null;

  const environmentWarning = isEnvironmentStale(task.environmentConfig)
    ? getStaleEnvironmentWarning(task.environmentConfig)
    : null;

  const vendorWarning = getVendorWarningMessage(task.aiVendor as AIVendor);

  // Show warnings for active tasks (not terminal states)
  const showWarnings = task.status !== 'completed' && task.status !== 'failed';

  return (
    <Card 
      className={cn('hover:shadow-md transition-shadow cursor-pointer', className)} 
      role="article"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none line-clamp-2">
              {task.description}
            </p>
            {task.project && (
              <p className="text-xs text-muted-foreground">
                {task.project.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TaskStatusBadge status={task.status} />
            {onRerun && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRerun(task);
                }}
                className="h-8 w-8 p-0"
                title="Re-run task"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Environment and AI Vendor */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            {getEnvironmentIcon(task.environmentType)}
            <span className="capitalize">{task.environmentType}</span>
            {showWarnings && environmentWarning && (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Stale
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs">AI:</span>
            <Badge variant="outline" className="text-xs capitalize">
              {task.aiVendor}
            </Badge>
            {showWarnings && vendorWarning && (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
                <AlertTriangle className="h-3 w-3" />
              </Badge>
            )}
          </div>
        </div>

        {/* Environment Warning */}
        {showWarnings && environmentWarning && (
          <div className="flex items-start gap-1 text-xs text-amber-700 bg-amber-50 p-2 rounded">
            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
            <span>{environmentWarning}</span>
          </div>
        )}

        {/* Vendor Warning */}
        {showWarnings && vendorWarning && (
          <div className="flex items-start gap-1 text-xs text-amber-700 bg-amber-50 p-2 rounded">
            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
            <span>{vendorWarning}</span>
          </div>
        )}

        {/* Branch Name */}
        {task.branchName && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <GitBranch className="h-3 w-3" />
            <span>{task.branchName}</span>
          </div>
        )}

        {/* Duration for Running Tasks */}
        {duration && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <Clock className="h-3 w-3" />
            <span>Running for {duration}</span>
          </div>
        )}

        {/* Error Message for Failed Tasks */}
        {task.status === 'failed' && task.errorMessage && (
          <div className="flex items-start gap-1 text-xs text-red-600 bg-red-50 p-2 rounded">
            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{task.errorMessage}</span>
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-muted-foreground">
          {task.status === 'completed' && task.completedAt ? (
            <div>Completed: {formatDate(task.completedAt)}</div>
          ) : (
            <div>Created: {formatDate(task.createdAt)}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
