'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { TaskForm } from './task-form';
import { Info } from 'lucide-react';
import type { TaskWithProject } from '@/lib/api/schemas';

interface RerunTaskSheetProps {
  task: TaskWithProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: any) => void | Promise<void>;
}

export function RerunTaskSheet({ task, open, onOpenChange, onSubmit }: RerunTaskSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error rerunning task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Prepare default values from the original task
  const defaultValues = {
    description: task.description,
    projectId: task.projectId,
    environmentType: task.environmentType,
    environmentConfig: task.environmentConfig,
    aiVendor: task.aiVendor,
    branchName: task.branchName || '',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Re-run Task</SheetTitle>
          <SheetDescription>
            Create a new task based on this configuration. You can modify any settings before rerunning.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Original task reference */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium">Original Task</p>
                <p className="text-xs text-muted-foreground">
                  ID: <code className="bg-muted px-1 py-0.5 rounded">{task.id}</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: <span className="capitalize">{task.status}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Rerun form */}
          <div className="space-y-4">
            <TaskForm
              onSubmit={handleSubmit}
              defaultValues={defaultValues}
              isLoading={isSubmitting}
            />
          </div>

          {/* Custom buttons for sheet */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="task-form"
              disabled={isSubmitting}
              onClick={() => {
                // Trigger form submission
                const form = document.querySelector('form');
                if (form) {
                  form.requestSubmit();
                }
              }}
            >
              {isSubmitting ? 'Creating...' : 'Re-run Task'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
