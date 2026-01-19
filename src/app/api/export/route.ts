import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { tasks, projects, statusHistory, configPresets } from '@/lib/db/schema';

// POST /api/export - Export all data as JSON
export async function POST(request: NextRequest) {
  try {
    // Fetch all data
    const [allTasks, allProjects, allHistory, allPresets] = await Promise.all([
      db.select().from(tasks),
      db.select().from(projects),
      db.select().from(statusHistory),
      db.select().from(configPresets),
    ]);

    // Format export data
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        tasks: allTasks.map((task) => ({
          ...task,
          createdAt: task.createdAt.toISOString(),
          startedAt: task.startedAt?.toISOString() || null,
          completedAt: task.completedAt?.toISOString() || null,
        })),
        projects: allProjects.map((project) => ({
          ...project,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        })),
        statusHistory: allHistory.map((history) => ({
          ...history,
          timestamp: history.timestamp.toISOString(),
        })),
        presets: allPresets.map((preset) => ({
          ...preset,
          createdAt: preset.createdAt.toISOString(),
          updatedAt: preset.updatedAt.toISOString(),
        })),
      },
      counts: {
        tasks: allTasks.length,
        projects: allProjects.length,
        statusHistory: allHistory.length,
        presets: allPresets.length,
      },
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="ai-task-tracker-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to export data',
        },
      },
      { status: 500 }
    );
  }
}
