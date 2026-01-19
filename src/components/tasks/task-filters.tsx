'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TaskStatus, AIVendor, EnvironmentType } from '@/lib/api/schemas';
import { Search } from 'lucide-react';

export interface TaskFilterValues {
  status?: TaskStatus;
  projectId?: string;
  environmentType?: EnvironmentType;
  aiVendor?: AIVendor;
  search?: string;
  branchName?: string;
}

interface TaskFiltersProps {
  filters: TaskFilterValues;
  onFiltersChange: (filters: TaskFilterValues) => void;
  projects?: Array<{ id: string; name: string }>;
}

const STATUS_OPTIONS: TaskStatus[] = [
  'pending',
  'running',
  'completed',
  'failed',
  'paused',
  'disconnected',
];

const AI_VENDOR_OPTIONS: AIVendor[] = [
  'claude',
  'chatgpt',
  'gemini',
  'cursor',
  'copilot',
  'windsurf',
  'cody',
  'aider',
  'other',
];

const ENVIRONMENT_OPTIONS: EnvironmentType[] = [
  'local',
  'worktree',
  'remote',
];

export function TaskFilters({ filters, onFiltersChange, projects = [] }: TaskFiltersProps) {
  const updateFilter = (key: keyof TaskFilterValues, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' || value === '' ? undefined : value,
    });
  };

  return (
    <div className="flex items-end gap-4">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search tasks..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => updateFilter('status', value)}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Environment Filter */}
      <div className="space-y-2">
        <Label htmlFor="environment">Environment</Label>
        <Select
          value={filters.environmentType || 'all'}
          onValueChange={(value) => updateFilter('environmentType', value)}
        >
          <SelectTrigger id="environment">
            <SelectValue placeholder="All environments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All environments</SelectItem>
            {ENVIRONMENT_OPTIONS.map((env) => (
              <SelectItem key={env} value={env} className="capitalize">
                {env}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* AI Vendor Filter */}
      <div className="space-y-2">
        <Label htmlFor="ai-vendor">AI Vendor</Label>
        <Select
          value={filters.aiVendor || 'all'}
          onValueChange={(value) => updateFilter('aiVendor', value)}
        >
          <SelectTrigger id="ai-vendor">
            <SelectValue placeholder="All vendors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All vendors</SelectItem>
            {AI_VENDOR_OPTIONS.map((vendor) => (
              <SelectItem key={vendor} value={vendor} className="capitalize">
                {vendor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Project Filter (if projects available) */}
      {projects.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="project">Project</Label>
          <Select
            value={filters.projectId || 'all'}
            onValueChange={(value) => updateFilter('projectId', value)}
          >
            <SelectTrigger id="project">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
