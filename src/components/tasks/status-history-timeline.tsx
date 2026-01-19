'use client';

import { Clock } from 'lucide-react';
import { TaskStatusBadge } from './task-status-badge';
import type { StatusHistory } from '@/lib/api/schemas';
import { Skeleton } from '@/components/ui/skeleton';

interface StatusHistoryTimelineProps {
  history: StatusHistory[];
  isLoading?: boolean;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays}d ago`;
  }
  if (diffHours > 0) {
    return `${diffHours}h ago`;
  }
  if (diffMins > 0) {
    return `${diffMins}m ago`;
  }
  return 'Just now';
}

export function StatusHistoryTimeline({ history, isLoading }: StatusHistoryTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No status changes recorded yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {history.map((entry, index) => (
        <div key={entry.id} className="flex gap-4">
          {/* Timeline indicator */}
          <div className="flex flex-col items-center">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-background">
              <Clock className="h-3 w-3 text-primary" />
            </div>
            {index < history.length - 1 && (
              <div className="w-0.5 flex-1 bg-border mt-2" />
            )}
          </div>

          {/* Entry content */}
          <div className="flex-1 space-y-2 pb-6">
            <div className="flex items-center gap-2">
              <TaskStatusBadge status={entry.status} />
              <span className="text-sm text-muted-foreground">
                {getRelativeTime(entry.timestamp)}
              </span>
            </div>
            
            {entry.message && (
              <p className="text-sm text-muted-foreground">{entry.message}</p>
            )}
            
            <p className="text-xs text-muted-foreground">
              {formatTimestamp(entry.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
