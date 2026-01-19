'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TaskCard } from '@/components/tasks/task-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboard();

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Failed to load dashboard data. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/tasks/new">
          <Button>New Task</Button>
        </Link>
      </div>

      {/* Stats Cards with Trends */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          icon={Activity}
          trend={stats?.trends?.totalTasks}
          description="vs last week"
          isLoading={isLoading}
        />
        
        <StatsCard
          title="Active Tasks"
          value={stats?.activeTasks || 0}
          icon={Clock}
          trend={stats?.trends?.activeTasks}
          description="vs yesterday"
          isLoading={isLoading}
        />
        
        <StatsCard
          title="Completed Today"
          value={stats?.completedToday || 0}
          icon={CheckCircle2}
          trend={stats?.trends?.completedToday}
          description="vs yesterday"
          isLoading={isLoading}
        />
        
        <StatsCard
          title="Failed Today"
          value={stats?.failedToday || 0}
          icon={XCircle}
          trend={stats?.trends?.failedToday}
          description="vs yesterday"
          isLoading={isLoading}
        />
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.tasksByStatus && Object.entries(stats.tasksByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{status}</span>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.tasksByEnvironment && Object.entries(stats.tasksByEnvironment).map(([env, count]) => (
                <div key={env} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{env}</span>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recent Tasks</h2>
          <Link href="/tasks">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        {stats?.recentTasks && stats.recentTasks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.recentTasks.slice(0, 6).map((task) => (
              <Link key={task.id} href={`/tasks/${task.id}`}>
                <TaskCard task={task} />
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No tasks yet. Create your first task to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
