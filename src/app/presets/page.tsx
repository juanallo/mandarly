'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePresets, useCreatePreset, useUpdatePreset, useDeletePreset } from '@/hooks/use-presets';
import { PresetCard } from '@/components/presets/preset-card';
import { PresetForm } from '@/components/presets/preset-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/layout/empty-state';
import { useToast } from '@/hooks/use-toast';
import type { ConfigPreset } from '@/lib/api/schemas';

export default function PresetsPage() {
  const router = useRouter();
  const { data, isLoading, error } = usePresets();
  const createPreset = useCreatePreset();
  const updatePreset = useUpdatePreset();
  const deletePreset = useDeletePreset();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ConfigPreset | null>(null);

  const handleCreate = async (data: any) => {
    try {
      await createPreset.mutateAsync(data);
      toast({
        title: 'Preset created',
        description: 'Your configuration preset has been saved.',
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create preset',
        variant: 'destructive',
      });
    }
  };

  const handleApply = (preset: ConfigPreset) => {
    // Navigate to create task page with preset applied
    router.push(`/tasks/new?preset=${preset.id}`);
  };

  const handleEdit = (preset: ConfigPreset) => {
    setSelectedPreset(preset);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: any) => {
    if (!selectedPreset) return;

    try {
      await updatePreset.mutateAsync({
        id: selectedPreset.id,
        data,
      });
      toast({
        title: 'Preset updated',
        description: 'Your preset has been updated successfully.',
      });
      setIsEditDialogOpen(false);
      setSelectedPreset(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update preset',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (preset: ConfigPreset) => {
    setSelectedPreset(preset);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedPreset) return;

    try {
      await deletePreset.mutateAsync(selectedPreset.id);
      toast({
        title: 'Preset deleted',
        description: 'Your preset has been deleted successfully.',
      });
      setIsDeleteDialogOpen(false);
      setSelectedPreset(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete preset',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Configuration Presets</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Preset
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Failed to load presets. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Configuration Presets</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Preset
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const presets = data?.items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuration Presets</h1>
          <p className="text-muted-foreground mt-1">
            Save and reuse your favorite environment and AI vendor combinations
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Preset
        </Button>
      </div>

      {/* Presets Grid */}
      {presets.length === 0 ? (
        <EmptyState
          title="No presets yet"
          description="Create your first preset to quickly reuse configurations"
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {presets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                onApply={handleApply}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>

          {/* Count */}
          {data && (
            <div className="text-sm text-muted-foreground text-center">
              {data.items.length} preset{data.items.length !== 1 ? 's' : ''}
            </div>
          )}
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Preset</DialogTitle>
            <DialogDescription>
              Save a configuration for quick reuse
            </DialogDescription>
          </DialogHeader>
          <PresetForm
            onSubmit={handleCreate}
            isLoading={createPreset.isPending}
            submitLabel="Create Preset"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Preset</DialogTitle>
            <DialogDescription>
              Update your preset configuration
            </DialogDescription>
          </DialogHeader>
          {selectedPreset && (
            <PresetForm
              onSubmit={handleUpdate}
              defaultValues={{
                name: selectedPreset.name,
                environmentType: selectedPreset.environmentType,
                environmentConfig: selectedPreset.environmentConfig,
                aiVendor: selectedPreset.aiVendor,
              }}
              isLoading={updatePreset.isPending}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Preset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPreset?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deletePreset.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePreset.isPending}
            >
              {deletePreset.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
