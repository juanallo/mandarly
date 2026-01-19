'use client';

import { useRouter } from 'next/navigation';
import { TaskForm } from '@/components/tasks/task-form';
import { useCreateTask } from '@/hooks/use-tasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function CreateTaskPage() {
  const router = useRouter();
  const createTask = useCreateTask();
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      const result = await createTask.mutateAsync(data);
      
      toast({
        title: 'Task created',
        description: 'Your task has been created successfully.',
      });

      // Redirect to task detail page
      router.push(`/tasks/${result.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6">
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
          <CardDescription>
            Configure a new AI-assisted task with your preferred execution environment and AI vendor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm onSubmit={handleSubmit} isLoading={createTask.isPending} />
        </CardContent>
      </Card>
    </div>
  );
}
