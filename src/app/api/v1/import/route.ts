import { NextRequest, NextResponse } from 'next/server';
import { importExecutionService } from '@/services/import-execution-service';
import type { FieldMapping } from '@/services/import-service';

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { rows, mapping, entityType } = body as {
      rows: Record<string, string>[];
      mapping: FieldMapping[];
      entityType: 'properties' | 'tenants' | 'leases';
    };

    // Apply mapping
    const records = importExecutionService.applyMapping(rows, mapping, entityType);

    // Validate
    const errors = importExecutionService.validateImport(records);

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors, message: 'Validation failed' },
        { status: 400 }
      );
    }

    // Execute import
    const result = await importExecutionService.executeImport(records, userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Import failed' },
      { status: 500 }
    );
  }
}