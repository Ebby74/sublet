import { NextRequest, NextResponse } from 'next/server';
import { getExitProcesses } from '@/services/exit-process-service';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const leaseId = searchParams.get('leaseId');

  try {
    const processes = await getExitProcesses(leaseId ?? undefined);
    return NextResponse.json({ data: processes });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch exit processes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { createExitProcess } = await import('@/services/exit-process-service');
    const process = await createExitProcess(body);
    return NextResponse.json({ data: process }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create exit process';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
