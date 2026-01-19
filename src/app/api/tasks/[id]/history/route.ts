import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { statusHistory } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/tasks/[id]/history - Get status history for a task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

    // Fetch status history ordered by timestamp (newest first)
    const history = await db
      .select()
      .from(statusHistory)
      .where(eq(statusHistory.taskId, taskId))
      .orderBy(desc(statusHistory.timestamp));

    // Transform timestamps to ISO strings
    const response = history.map((entry) => ({
      ...entry,
      timestamp: entry.timestamp.toISOString(),
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching task history:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch task history',
        },
      },
      { status: 500 }
    );
  }
}
