'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTasks, useRerunTask } from '@/hooks/use-tasks';
import { TaskList } from '@/components/tasks/task-list';
import { RerunTaskSheet } from '@/components/tasks/rerun-task-sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { TaskWithProject } from '@/lib/api/schemas';

export default function TasksPage() {
  const { data, isLoading, error } = useTasks();
  const rerunTask = useRerunTask();
  const router = useRouter();
  const { toast } = useToast();
  const [rerunTaskData, setRerunTaskData] = useState<TaskWithProject | null>(null);

  const handleRerun = (task: TaskWithProject) => {
    setRerunTaskData(task);
  };

  const handleRerunSubmit = async (data: any) => {
    if (!rerunTaskData) return;

    try {
      const result = await rerunTask.mutateAsync({
        taskId: rerunTaskData.id,
        modifications: data,
      });
      
      toast({
        title: 'Task re-run',
        description: 'A new task has been created.',
      });

      setRerunTaskData(null);
      router.push(`/tasks/${result.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to re-run task',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <Link href="/tasks/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </Link>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Failed to load tasks. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your AI-assisted tasks
          </p>
        </div>
        <Link href="/tasks/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </Link>
      </div>

      {/* Task List */}
      <TaskList
        tasks={data?.items || []}
        isLoading={isLoading}
        groupByProject={true}
        onRerun={handleRerun}
      />

      {/* Pagination info */}
      {data && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {data.items.length} of {data.total} tasks
        </div>
      )}

      {/* Rerun Sheet */}
      {rerunTaskData && (
        <RerunTaskSheet
          task={rerunTaskData}
          open={!!rerunTaskData}
          onOpenChange={(open) => !open && setRerunTaskData(null)}
          onSubmit={handleRerunSubmit}
        />
      )}
    </div>
  );
}
