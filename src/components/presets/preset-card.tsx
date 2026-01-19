import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Edit, Trash2, Play } from 'lucide-react';
import type { ConfigPreset } from '@/lib/api/schemas';

interface PresetCardProps {
  preset: ConfigPreset;
  onApply?: (preset: ConfigPreset) => void;
  onEdit?: (preset: ConfigPreset) => void;
  onDelete?: (preset: ConfigPreset) => void;
}

export function PresetCard({ preset, onApply, onEdit, onDelete }: PresetCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            <div className="rounded-lg bg-primary/10 p-2">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1">
                {preset.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {preset.environmentType}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {preset.aiVendor}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(preset);
                }}
                className="h-8 w-8 p-0"
                title="Edit preset"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(preset);
                }}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                title="Delete preset"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Environment Details */}
        <div className="space-y-2 text-sm text-muted-foreground mb-3">
          {preset.environmentType === 'worktree' && preset.environmentConfig.type === 'worktree' && (
            <div>
              <span className="font-medium">Path:</span>{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {preset.environmentConfig.path}
              </code>
            </div>
          )}
          {preset.environmentType === 'remote' && preset.environmentConfig.type === 'remote' && (
            <div>
              <span className="font-medium">Host:</span>{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {preset.environmentConfig.host}
              </code>
            </div>
          )}
        </div>

        {/* Apply Button */}
        {onApply && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onApply(preset)}
            className="w-full gap-2"
          >
            <Play className="h-3 w-3" />
            Use This Preset
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
