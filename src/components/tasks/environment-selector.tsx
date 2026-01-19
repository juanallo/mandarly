'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import type { EnvironmentConfig } from '@/types';

interface EnvironmentSelectorProps {
  value: EnvironmentConfig;
  onChange: (config: EnvironmentConfig) => void;
}

export function EnvironmentSelector({ value, onChange }: EnvironmentSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>(value.type);

  const handleTabChange = (newType: string) => {
    setActiveTab(newType);
    
    // Initialize config based on environment type
    if (newType === 'local') {
      onChange({ type: 'local' });
    } else if (newType === 'worktree') {
      onChange({
        type: 'worktree',
        path: '',
        branch: '',
      });
    } else if (newType === 'remote') {
      onChange({
        type: 'remote',
        connectionType: 'ssh',
        host: '',
        port: undefined,
        user: '',
      });
    }
  };

  const handleWorktreeChange = (field: 'path' | 'branch', fieldValue: string) => {
    if (value.type === 'worktree') {
      onChange({
        ...value,
        [field]: fieldValue,
      });
    }
  };

  const handleRemoteChange = (field: string, fieldValue: string | number) => {
    if (value.type === 'remote') {
      onChange({
        ...value,
        [field]: fieldValue,
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label>Environment*</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground">
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold mb-1">Choose where to run your task:</p>
              <ul className="text-xs space-y-1">
                <li><strong>Local:</strong> Your current machine and directory</li>
                <li><strong>Worktree:</strong> A separate git worktree (parallel branch)</li>
                <li><strong>Remote:</strong> A remote server via SSH</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="local">Local</TabsTrigger>
            <TabsTrigger value="worktree">Worktree</TabsTrigger>
            <TabsTrigger value="remote">Remote</TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Execute task on your local machine in the current directory.
            </p>
          </TabsContent>

        <TabsContent value="worktree" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="worktree-path">Path*</Label>
            <Input
              id="worktree-path"
              placeholder="e.g., /Users/you/code/myproject-feature"
              value={value.type === 'worktree' ? value.path : ''}
              onChange={(e) => handleWorktreeChange('path', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Absolute path to your git worktree directory
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="worktree-branch">Branch (optional)</Label>
            <Input
              id="worktree-branch"
              placeholder="feature-branch"
              value={value.type === 'worktree' ? value.branch || '' : ''}
              onChange={(e) => handleWorktreeChange('branch', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Git branch associated with this worktree
            </p>
          </div>
        </TabsContent>

        <TabsContent value="remote" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="connection-type">Connection Type</Label>
            <Select
              value={value.type === 'remote' ? value.connectionType : 'ssh'}
              onValueChange={(v) => handleRemoteChange('connectionType', v)}
            >
              <SelectTrigger id="connection-type">
                <SelectValue placeholder="Select connection type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ssh">SSH</SelectItem>
                <SelectItem value="url">URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remote-host">Host*</Label>
            <Input
              id="remote-host"
              placeholder="remote.example.com"
              value={value.type === 'remote' ? value.host : ''}
              onChange={(e) => handleRemoteChange('host', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Remote server hostname or IP address
            </p>
          </div>

          {value.type === 'remote' && value.connectionType === 'ssh' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="remote-user">User (optional)</Label>
                <Input
                  id="remote-user"
                  placeholder="username"
                  value={value.user || ''}
                  onChange={(e) => handleRemoteChange('user', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remote-port">Port (optional)</Label>
                <Input
                  id="remote-port"
                  type="number"
                  placeholder="22"
                  value={value.port || ''}
                  onChange={(e) => {
                    const port = e.target.value ? parseInt(e.target.value) : undefined;
                    if (port !== undefined) {
                      handleRemoteChange('port', port);
                    }
                  }}
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </TooltipProvider>
  );
}
