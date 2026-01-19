'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTask } from '@/hooks/use-tasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, GitBranch, Laptop } from 'lucide-react';
import Link from 'next/link';
import { TaskStatusBadge } from '@/components/tasks/task-status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  
  const { data: task, isLoading, error } = useTask(taskId);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 space-y-6">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container mx-auto max-w-4xl py-8 space-y-6">
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Task not found or failed to load.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-6">
      {/* Back button */}
      <Link href="/tasks">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Button>
      </Link>

      {/* Task Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Task Details</h1>
            <TaskStatusBadge status={task.status} />
          </div>
          <p className="text-sm text-muted-foreground">ID: {task.id}</p>
        </div>
      </div>

      {/* Task Information */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{task.description}</p>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Execution environment and AI vendor settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Environment */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Laptop className="h-4 w-4" />
              Environment
            </div>
            <div className="ml-6 space-y-1">
              <p className="text-sm">
                <span className="font-medium">Type:</span>{' '}
                <span className="capitalize">{task.environmentType}</span>
              </p>
              {task.environmentType === 'worktree' && task.environmentConfig.type === 'worktree' && (
                <>
                  <p className="text-sm">
                    <span className="font-medium">Path:</span>{' '}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {task.environmentConfig.path}
                    </code>
                  </p>
                  {task.environmentConfig.branch && (
                    <p className="text-sm">
                      <span className="font-medium">Branch:</span>{' '}
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {task.environmentConfig.branch}
                      </code>
                    </p>
                  )}
                </>
              )}
              {task.environmentType === 'remote' && task.environmentConfig.type === 'remote' && (
                <>
                  <p className="text-sm">
                    <span className="font-medium">Host:</span>{' '}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {task.environmentConfig.host}
                    </code>
                  </p>
                  {task.environmentConfig.user && (
                    <p className="text-sm">
                      <span className="font-medium">User:</span>{' '}
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {task.environmentConfig.user}
                      </code>
                    </p>
                  )}
                  {task.environmentConfig.port && (
                    <p className="text-sm">
                      <span className="font-medium">Port:</span> {task.environmentConfig.port}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* AI Vendor */}
          <div>
            <p className="text-sm">
              <span className="font-medium">AI Vendor:</span>{' '}
              <span className="capitalize">{task.aiVendor}</span>
            </p>
          </div>

          {/* Branch Name */}
          {task.branchName && (
            <>
              <Separator />
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                <p className="text-sm">
                  <span className="font-medium">Branch:</span>{' '}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {task.branchName}
                  </code>
                </p>
              </div>
            </>
          )}

          {/* Project */}
          {task.project && (
            <>
              <Separator />
              <div>
                <p className="text-sm">
                  <span className="font-medium">Project:</span>{' '}
                  <Link
                    href={`/projects/${task.project.id}`}
                    className="text-primary hover:underline"
                  >
                    {task.project.name}
                  </Link>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Created:</span>
            <span>{new Date(task.createdAt).toLocaleString()}</span>
          </div>
          
          {task.startedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Started:</span>
              <span>{new Date(task.startedAt).toLocaleString()}</span>
            </div>
          )}
          
          {task.completedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Completed:</span>
              <span>{new Date(task.completedAt).toLocaleString()}</span>
            </div>
          )}

          {task.errorMessage && (
            <>
              <Separator />
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm font-medium text-red-900 mb-1">Error Message</p>
                <p className="text-sm text-red-700">{task.errorMessage}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
