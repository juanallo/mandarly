'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EnvironmentSelector } from './environment-selector';
import { AIVendorPicker } from './ai-vendor-picker';
import { ProjectSelector } from '@/components/projects/project-selector';
import { PresetForm } from '@/components/presets/preset-form';
import { usePresets, useCreatePreset } from '@/hooks/use-presets';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
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
  const { data: presetsData } = usePresets();
  const createPreset = useCreatePreset();
  const { toast } = useToast();
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isSavePresetDialogOpen, setIsSavePresetDialogOpen] = useState(false);

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

  const handlePresetSelect = (presetId: string) => {
    if (presetId === 'none') {
      setSelectedPresetId(null);
      return;
    }

    const preset = presetsData?.items.find(p => p.id === presetId);
    if (preset) {
      setSelectedPresetId(presetId);
      setValue('environmentType', preset.environmentType);
      setValue('environmentConfig', preset.environmentConfig);
      setValue('aiVendor', preset.aiVendor);
    }
  };

  const handleSavePreset = async (data: any) => {
    try {
      await createPreset.mutateAsync(data);
      toast({
        title: 'Preset saved',
        description: 'Your configuration has been saved as a preset.',
      });
      setIsSavePresetDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save preset',
        variant: 'destructive',
      });
    }
  };

  const getCurrentConfig = () => ({
    name: '',
    environmentType: environmentConfig.type,
    environmentConfig: environmentConfig,
    aiVendor: aiVendor,
  });

  const presets = presetsData?.items || [];

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Preset Selector */}
        {presets.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="preset-selector">Load from Preset (optional)</Label>
            <Select
              value={selectedPresetId || 'none'}
              onValueChange={handlePresetSelect}
            >
              <SelectTrigger id="preset-selector">
                <SelectValue placeholder="Select a preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No preset</SelectItem>
                {presets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Selecting a preset will auto-fill environment and AI vendor settings
            </p>
          </div>
        )}

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
          type="button"
          variant="outline"
          onClick={() => setIsSavePresetDialogOpen(true)}
          disabled={isSubmitting || isLoading}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save as Preset
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="min-w-[120px]"
        >
          {isSubmitting || isLoading ? 'Creating...' : 'Create Task'}
        </Button>
      </div>
    </form>

      {/* Save as Preset Dialog */}
      <Dialog open={isSavePresetDialogOpen} onOpenChange={setIsSavePresetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Preset</DialogTitle>
            <DialogDescription>
              Save the current configuration for quick reuse
            </DialogDescription>
          </DialogHeader>
          <PresetForm
            onSubmit={handleSavePreset}
            defaultValues={getCurrentConfig()}
            isLoading={createPreset.isPending}
            submitLabel="Save Preset"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
