import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { configPresets } from '@/lib/db/schema';
import { CreatePresetRequest } from '@/lib/api/schemas';

// GET /api/presets - List all presets
export async function GET(request: NextRequest) {
  try {
    const presets = await db
      .select()
      .from(configPresets)
      .orderBy(configPresets.createdAt);

    // Transform results
    const items = presets.map((preset) => ({
      ...preset,
      createdAt: preset.createdAt.toISOString(),
      updatedAt: preset.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      items,
      total: items.length,
      limit: items.length,
      offset: 0,
      hasMore: false,
    });
  } catch (error) {
    console.error('Error fetching presets:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch presets',
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/presets - Create a new preset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreatePresetRequest.parse(body);

    // Create the preset
    const newPresetResult = await db
      .insert(configPresets)
      .values({
        name: validatedData.name,
        environmentType: validatedData.environmentType,
        environmentConfig: validatedData.environmentConfig as any,
        aiVendor: validatedData.aiVendor as any,
      })
      .returning();

    const newPreset = Array.isArray(newPresetResult) ? newPresetResult[0] : newPresetResult;

    const result = {
      ...newPreset,
      createdAt: newPreset.createdAt.toISOString(),
      updatedAt: newPreset.updatedAt.toISOString(),
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating preset:', error);

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
          message: 'Failed to create preset',
        },
      },
      { status: 500 }
    );
  }
}
