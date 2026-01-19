'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnvironmentSelector } from '@/components/tasks/environment-selector';
import { AIVendorPicker } from '@/components/tasks/ai-vendor-picker';
import type { EnvironmentConfig, AIVendor } from '@/types';

const presetFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters'),
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
});

type PresetFormData = z.infer<typeof presetFormSchema>;

interface PresetFormProps {
  onSubmit: (data: PresetFormData) => void | Promise<void>;
  defaultValues?: Partial<PresetFormData>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function PresetForm({
  onSubmit,
  defaultValues,
  isLoading = false,
  submitLabel = 'Create Preset',
}: PresetFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PresetFormData>({
    resolver: zodResolver(presetFormSchema),
    defaultValues: {
      name: '',
      environmentType: 'local',
      environmentConfig: { type: 'local' },
      aiVendor: 'claude',
      ...defaultValues,
    },
  });

  const environmentConfig = watch('environmentConfig');
  const aiVendor = watch('aiVendor');

  const handleFormSubmit = async (data: PresetFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Preset Name*</Label>
        <Input
          id="name"
          placeholder="e.g., Local Claude Setup"
          {...register('name')}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

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
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="min-w-[120px]"
        >
          {isSubmitting || isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
