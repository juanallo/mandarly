'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EnvironmentSelector } from './environment-selector';
import { AIVendorPicker } from './ai-vendor-picker';
import { ProjectSelector } from '@/components/projects/project-selector';
import type { EnvironmentConfig, AIVendor } from '@/types';

// Form validation schema
const taskFormSchema = z.object({
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be at most 2000 characters'),
  projectId: z.string().nullable(),
  environmentType: z.enum(['local', 'worktree', 'remote']),
  environmentConfig: z.custom<EnvironmentConfig>((val) => {
    const config = val as any;
    if (config.type === 'local') return true;
    if (config.type === 'worktree') {
      return config.path && config.path.length > 0;
    }
    if (config.type === 'remote') {
      return config.host && config.host.length > 0;
    }
    return false;
  }, 'Invalid environment configuration'),
  aiVendor: z.string().min(1, 'AI vendor is required'),
  branchName: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void | Promise<void>;
  defaultValues?: Partial<TaskFormData>;
  isLoading?: boolean;
}

export function TaskForm({ onSubmit, defaultValues, isLoading = false }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      description: '',
      projectId: null,
      environmentType: 'local',
      environmentConfig: { type: 'local' },
      aiVendor: 'claude',
      branchName: '',
      ...defaultValues,
    },
  });

  const environmentConfig = watch('environmentConfig');
  const aiVendor = watch('aiVendor');
  const projectId = watch('projectId');

  const handleFormSubmit = async (data: TaskFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description*</Label>
        <Textarea
          id="description"
          placeholder="Describe the task you want to execute with AI assistance..."
          rows={4}
          {...register('description')}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Project Selector */}
      <ProjectSelector
        value={projectId}
        onChange={(value) => setValue('projectId', value)}
      />

      {/* Environment Configuration */}
      <div className="space-y-2">
        <Label>Environment*</Label>
        <EnvironmentSelector
          value={environmentConfig}
          onChange={(config) => {
            setValue('environmentConfig', config);
            setValue('environmentType', config.type);
          }}
        />
        {errors.environmentConfig && (
          <p className="text-sm text-destructive">
            {errors.environmentConfig.message || 'Please complete the environment configuration'}
          </p>
        )}
      </div>

      {/* Branch Name (optional) */}
      <div className="space-y-2">
        <Label htmlFor="branch-name">Branch Name (optional)</Label>
        <Input
          id="branch-name"
          placeholder="feature-branch"
          {...register('branchName')}
        />
        <p className="text-xs text-muted-foreground">
          Associate this task with a specific git branch
        </p>
      </div>

      {/* AI Vendor Selection */}
      <div className="space-y-2">
        <Label>AI Vendor*</Label>
        <AIVendorPicker
          value={aiVendor as AIVendor}
          onChange={(vendor) => setValue('aiVendor', vendor)}
        />
        {errors.aiVendor && (
          <p className="text-sm text-destructive">{errors.aiVendor.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="min-w-[120px]"
        >
          {isSubmitting || isLoading ? 'Creating...' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
