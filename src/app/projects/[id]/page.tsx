'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/hooks/use-projects';
import { useTasks, useRerunTask } from '@/hooks/use-tasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskList } from '@/components/tasks/task-list';
import { RerunTaskSheet } from '@/components/tasks/rerun-task-sheet';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { TaskWithProject } from '@/lib/api/schemas';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const { data: project, isLoading, error } = useProject(projectId);
  const { data: tasksData, isLoading: isTasksLoading } = useTasks({ projectId });
  const rerunTask = useRerunTask();
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

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl py-8 space-y-6">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto max-w-6xl py-8 space-y-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Project not found or failed to load.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-6">
      {/* Back button */}
      <Link href="/projects">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
      </Link>

      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-3xl">{project.name}</CardTitle>
              {project.description && (
                <CardDescription className="text-base">
                  {project.description}
                </CardDescription>
              )}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Total Tasks:</span>
                  <Badge variant="secondary">{project.taskCount}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Active:</span>
                  <Badge variant={project.activeTaskCount > 0 ? 'default' : 'outline'}>
                    {project.activeTaskCount}
                  </Badge>
                </div>
              </div>
            </div>
            <Link href={`/projects/${project.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Tasks for this project */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Tasks</h2>
          <Link href="/tasks/new">
            <Button size="sm">Create Task</Button>
          </Link>
        </div>

        <TaskList
          tasks={tasksData?.items || []}
          isLoading={isTasksLoading}
          groupByProject={false}
          onRerun={handleRerun}
        />
      </div>

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
