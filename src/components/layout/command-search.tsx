'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useTasks } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { FileText, FolderOpen, Search, Home, CheckSquare, FolderKanban, Settings } from 'lucide-react';

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: tasksData } = useTasks();
  const { data: projectsData } = useProjects();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((path: string) => {
    setOpen(false);
    router.push(path);
  }, [router]);

  const tasks = tasksData?.items || [];
  const projects = projectsData?.items || [];

  return (
    <>
      {/* Trigger button for mobile or explicit click */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search tasks, projects, or navigate..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {/* Navigation Items */}
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => handleSelect('/')}>
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/tasks')}>
              <CheckSquare className="mr-2 h-4 w-4" />
              <span>Tasks</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/projects')}>
              <FolderKanban className="mr-2 h-4 w-4" />
              <span>Projects</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/presets')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Presets</span>
            </CommandItem>
          </CommandGroup>
          
          {projects.length > 0 && (
            <CommandGroup heading="Projects">
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={`project-${project.name}-${project.id}`}
                  onSelect={() => handleSelect(`/projects/${project.id}`)}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">{project.name}</div>
                    {project.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {project.description}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {tasks.length > 0 && (
            <CommandGroup heading="Tasks">
              {tasks.slice(0, 10).map((task) => (
                <CommandItem
                  key={task.id}
                  value={`task-${task.description}-${task.id}`}
                  onSelect={() => handleSelect(`/tasks/${task.id}`)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <div className="flex-1">
                    <div className="line-clamp-1">{task.description}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{task.status}</span>
                      {task.project && (
                        <>
                          <span>•</span>
                          <span>{task.project.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
