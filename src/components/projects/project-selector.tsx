'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useProjects } from '@/hooks/use-projects';

interface ProjectSelectorProps {
  value: string | null;
  onChange: (projectId: string | null) => void;
}

export function ProjectSelector({ value, onChange }: ProjectSelectorProps) {
  const { data: projectsData, isLoading } = useProjects();
  const projects = projectsData?.items || [];

  return (
    <div className="space-y-2">
      <Label htmlFor="project-selector">Project (optional)</Label>
      <Select
        value={value || 'none'}
        onValueChange={(v) => onChange(v === 'none' ? null : v)}
        disabled={isLoading}
      >
        <SelectTrigger id="project-selector">
          <SelectValue placeholder={isLoading ? 'Loading projects...' : 'Select a project'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No project</SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {projects.length === 0 && !isLoading && (
        <p className="text-xs text-muted-foreground">
          No projects yet. Create one in the Projects page.
        </p>
      )}
    </div>
  );
}
