'use client';

import { Button } from '@/components/ui/button';
import { Play, CheckCircle, XCircle, Pause, RotateCw } from 'lucide-react';
import { getValidNextStates, getTransitionLabel } from '@/lib/status-transitions';
import type { TaskStatus } from '@/types';

interface TaskStatusActionsProps {
  currentStatus: TaskStatus;
  onStatusChange: (newStatus: TaskStatus) => void;
  isLoading?: boolean;
}

export function TaskStatusActions({
  currentStatus,
  onStatusChange,
  isLoading = false,
}: TaskStatusActionsProps) {
  const validNextStates = getValidNextStates(currentStatus);

  // If no valid transitions, don't show any buttons
  if (validNextStates.length === 0) {
    return null;
  }

  // Define button config for each transition
  const getButtonConfig = (status: TaskStatus) => {
    switch (status) {
      case 'running':
        return {
          variant: 'default' as const,
          icon: <Play className="h-4 w-4" />,
          label: getTransitionLabel(currentStatus, status),
        };
      case 'completed':
        return {
          variant: 'default' as const,
          icon: <CheckCircle className="h-4 w-4" />,
          label: getTransitionLabel(currentStatus, status),
        };
      case 'failed':
        return {
          variant: 'destructive' as const,
          icon: <XCircle className="h-4 w-4" />,
          label: getTransitionLabel(currentStatus, status),
        };
      case 'paused':
        return {
          variant: 'outline' as const,
          icon: <Pause className="h-4 w-4" />,
          label: getTransitionLabel(currentStatus, status),
        };
      case 'disconnected':
        return {
          variant: 'outline' as const,
          icon: <RotateCw className="h-4 w-4" />,
          label: getTransitionLabel(currentStatus, status),
        };
      default:
        return {
          variant: 'outline' as const,
          icon: null,
          label: status,
        };
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {validNextStates.map((nextStatus) => {
        const config = getButtonConfig(nextStatus);
        return (
          <Button
            key={nextStatus}
            variant={config.variant}
            size="sm"
            onClick={() => onStatusChange(nextStatus)}
            disabled={isLoading}
            className="gap-2"
          >
            {config.icon}
            {config.label}
          </Button>
        );
      })}
    </div>
  );
}
