import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FolderKanban, Edit, Trash2 } from 'lucide-react';
import type { ProjectWithTaskCount } from '@/lib/api/schemas';

interface ProjectCardProps {
  project: ProjectWithTaskCount;
  onEdit?: (project: ProjectWithTaskCount) => void;
  onDelete?: (project: ProjectWithTaskCount) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            <div className="rounded-lg bg-primary/10 p-2">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1">
                {project.name}
              </CardTitle>
              {project.description && (
                <CardDescription className="mt-1 line-clamp-2">
                  {project.description}
                </CardDescription>
              )}
            </div>
          </div>
          
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(project);
                  }}
                  className="h-8 w-8 p-0"
                  title="Edit project"
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
                    onDelete(project);
                  }}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  title="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Total Tasks:</span>
            <Badge variant="secondary">{project.taskCount}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Active:</span>
            <Badge variant={project.activeTaskCount > 0 ? 'default' : 'outline'}>
              {project.activeTaskCount}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
