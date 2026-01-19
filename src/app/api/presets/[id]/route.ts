import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { configPresets } from '@/lib/db/schema';
import { UpdatePresetRequest } from '@/lib/api/schemas';
import { eq } from 'drizzle-orm';

// GET /api/presets/[id] - Get a single preset by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: presetId } = await params;

    const [preset] = await db
      .select()
      .from(configPresets)
      .where(eq(configPresets.id, presetId));

    if (!preset) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Preset not found',
          },
        },
        { status: 404 }
      );
    }

    const response = {
      ...preset,
      createdAt: preset.createdAt.toISOString(),
      updatedAt: preset.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching preset:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch preset',
        },
      },
      { status: 500 }
    );
  }
}

// PATCH /api/presets/[id] - Update a preset
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: presetId } = await params;
    const body = await request.json();
    const validatedData = UpdatePresetRequest.parse(body);

    // Check if preset exists
    const [existingPreset] = await db
      .select()
      .from(configPresets)
      .where(eq(configPresets.id, presetId));

    if (!existingPreset) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Preset not found',
          },
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }

    if (validatedData.environmentType !== undefined) {
      updateData.environmentType = validatedData.environmentType;
    }

    if (validatedData.environmentConfig !== undefined) {
      updateData.environmentConfig = validatedData.environmentConfig;
    }

    if (validatedData.aiVendor !== undefined) {
      updateData.aiVendor = validatedData.aiVendor;
    }

    // Update the preset
    await db
      .update(configPresets)
      .set(updateData)
      .where(eq(configPresets.id, presetId));

    // Fetch updated preset
    const [updatedPreset] = await db
      .select()
      .from(configPresets)
      .where(eq(configPresets.id, presetId));

    const response = {
      ...updatedPreset,
      createdAt: updatedPreset.createdAt.toISOString(),
      updatedAt: updatedPreset.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating preset:', error);

    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.message,
          },
        },
        { status: 400 }
      );
    }

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return NextResponse.json(
        {
          error: {
            code: 'DUPLICATE_NAME',
            message: 'A preset with this name already exists',
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update preset',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/presets/[id] - Delete a preset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: presetId } = await params;

    // Check if preset exists
    const [existingPreset] = await db
      .select()
      .from(configPresets)
      .where(eq(configPresets.id, presetId));

    if (!existingPreset) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Preset not found',
          },
        },
        { status: 404 }
      );
    }

    // Delete the preset (tasks that used it keep their presetId for history)
    await db
      .delete(configPresets)
      .where(eq(configPresets.id, presetId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting preset:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete preset',
        },
      },
      { status: 500 }
    );
  }
}
