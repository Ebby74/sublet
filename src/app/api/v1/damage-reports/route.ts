import { NextRequest, NextResponse } from 'next/server';
import {
  getDamageReports,
  createDamageReport,
  getDamageReportsByStatus,
} from '@/services/damage-report-service';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const leaseId = searchParams.get('leaseId');
  const status = searchParams.get('status');

  try {
    if (status) {
      const reports = await getDamageReportsByStatus(status);
      return NextResponse.json({ data: reports });
    }

    const reports = await getDamageReports(leaseId ?? undefined);
    return NextResponse.json({ data: reports });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch damage reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const report = await createDamageReport(body);
    return NextResponse.json({ data: report }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create damage report';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
