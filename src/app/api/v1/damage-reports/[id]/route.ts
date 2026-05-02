import { NextRequest, NextResponse } from 'next/server';
import {
  getDamageReportById,
  updateDamageReport,
  deleteDamageReport,
} from '@/services/damage-report-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const report = await getDamageReportById(id);
    if (!report) {
      return NextResponse.json({ error: 'Damage report not found' }, { status: 404 });
    }
    return NextResponse.json({ data: report });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch damage report' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const report = await updateDamageReport(id, body);
    return NextResponse.json({ data: report });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update damage report';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteDamageReport(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Failed to delete damage report' }, { status: 500 });
  }
}
