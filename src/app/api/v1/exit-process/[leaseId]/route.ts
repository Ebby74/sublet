import { NextRequest, NextResponse } from 'next/server';
import {
  getExitProcessByLeaseId,
  updateExitProcess,
  completeExitProcess,
} from '@/services/exit-process-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leaseId: string }> }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { leaseId } = await params;
    const process = await getExitProcessByLeaseId(leaseId);
    if (!process) {
      return NextResponse.json({ error: 'Exit process not found' }, { status: 404 });
    }
    return NextResponse.json({ data: process });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch exit process' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leaseId: string }> }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { leaseId } = await params;
    const body = await request.json();

    if (body.status === 'completed') {
      const process = await completeExitProcess(leaseId);
      return NextResponse.json({ data: process });
    }

    const process = await updateExitProcess(leaseId, body);
    return NextResponse.json({ data: process });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update exit process';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
