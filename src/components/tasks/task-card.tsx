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
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        'border border-gray-200',
        className
      )} 
      role="article"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            {/* Status Badge */}
            <TaskStatusBadge status={task.status} showIcon={true} />
            
            {/* Task Description */}
            <p className="text-sm font-medium leading-tight line-clamp-2 text-gray-900">
              {task.description}
            </p>
            
            {/* Project Tag */}
            {task.project && (
              <Badge variant="secondary" className="text-xs font-normal">
                {task.project.name}
              </Badge>
            )}
          </div>
          
          {onRerun && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRerun(task);
              }}
              className="h-8 w-8 p-0 flex-shrink-0"
              title="Re-run task"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Environment, AI Vendor, and Branch */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Environment Icon + Type */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            {getEnvironmentIcon(task.environmentType)}
            <span className="capitalize font-medium">{task.environmentType}</span>
          </div>
          
          {/* AI Vendor Badge with enhanced styling */}
          <Badge 
            variant="outline" 
            className="text-xs font-medium bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
          >
            {task.aiVendor.toUpperCase()}
          </Badge>
          
          {/* Branch Badge if present */}
          {task.branchName && (
            <Badge variant="outline" className="text-xs gap-1">
              <GitBranch className="h-3 w-3" />
              {task.branchName}
            </Badge>
          )}
        </div>

        {/* Warnings */}
        {showWarnings && (environmentWarning || vendorWarning) && (
          <div className="space-y-2">
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
