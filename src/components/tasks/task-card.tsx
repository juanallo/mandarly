import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TaskWithProject } from '@/lib/api/schemas';
import type { AIVendor } from '@/types';
import { Clock, GitBranch, Laptop, Server, FolderGit2, AlertCircle, RotateCcw, AlertTriangle, Calendar } from 'lucide-react';
import { isEnvironmentStale, getStaleEnvironmentWarning } from '@/lib/environment-validator';
import { getVendorWarningMessage } from '@/lib/vendor-validator';
import { STATUS_CONFIG, TaskStatus } from '@/lib/constants';
import * as LucideIcons from 'lucide-react';

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

function getStatusColor(status: TaskStatus): string {
  const config = STATUS_CONFIG[status];
  // Extract color from status config - use border color as base
  const colorMap: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: 'bg-gray-500',
    [TaskStatus.RUNNING]: 'bg-blue-500',
    [TaskStatus.PAUSED]: 'bg-yellow-500',
    [TaskStatus.COMPLETED]: 'bg-green-500',
    [TaskStatus.FAILED]: 'bg-red-500',
    [TaskStatus.DISCONNECTED]: 'bg-orange-500',
  };
  return colorMap[status] || 'bg-gray-500';
}

function formatShortDate(date: string | null): string {
  if (!date) return '';
  const d = new Date(date);
  const month = d.toLocaleString('default', { month: 'short' });
  const day = d.getDate();
  return `${month} ${day}`;
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

  // Get status icon
  const statusConfig = STATUS_CONFIG[task.status as TaskStatus];
  const StatusIcon = (LucideIcons as any)[statusConfig.iconName] || LucideIcons.Circle;

  return (
    <Card 
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        'border border-gray-200 bg-white',
        className
      )} 
      role="article"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Left side - Content */}
          <div className="flex-1 space-y-3 min-w-0">
            {/* Title with status icon */}
            <div className="flex items-start gap-2">
              <StatusIcon className={cn('h-4 w-4 mt-0.5 shrink-0', statusConfig.color)} />
              <h4 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                {task.description}
              </h4>
            </div>

            {/* Tags */}
            <div className="flex items-center flex-wrap gap-2">
              {task.project && (
                <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5">
                  {task.project.name}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                {getEnvironmentIcon(task.environmentType)}
                <span className="ml-1 capitalize">{task.environmentType}</span>
              </Badge>
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-200"
              >
                {task.aiVendor.toUpperCase()}
              </Badge>
            </div>

            {/* Dashed Separator */}
            <div className="border-t border-dashed border-gray-200 pt-3">
              {/* Action Indicators Section - Simplified (no counts per user request) */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatShortDate(task.createdAt)}</span>
                </div>
                {duration && (
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Running for {duration}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Warnings */}
            {showWarnings && (environmentWarning || vendorWarning) && (
              <div className="space-y-1.5">
                {environmentWarning && (
                  <div className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1.5 rounded border border-amber-200">
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{environmentWarning}</span>
                  </div>
                )}
                {vendorWarning && (
                  <div className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1.5 rounded border border-amber-200">
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{vendorWarning}</span>
                  </div>
                )}
              </div>
            )}

            {/* Error Message for Failed Tasks */}
            {task.status === 'failed' && task.errorMessage && (
              <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 px-2 py-1.5 rounded border border-red-200">
                <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{task.errorMessage}</span>
              </div>
            )}
          </div>

          {/* Right side - Status indicator circle and actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Status indicator circle */}
            <div className={cn('h-3 w-3 rounded-full', getStatusColor(task.status as TaskStatus))} />
            
            {/* Re-run button */}
            {onRerun && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onRerun(task);
                }}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                title="Re-run task"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
