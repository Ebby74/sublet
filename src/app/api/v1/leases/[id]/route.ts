import { NextRequest, NextResponse } from 'next/server';
import { getLease, updateLease, extendLease, terminateLease } from '@/services/lease-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lease = await getLease(id);

  if (!lease) {
    return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
  }

  return NextResponse.json({ data: lease });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.action === 'extend') {
    const lease = await extendLease(id, new Date(body.newEndDate));
    return NextResponse.json({ data: lease });
  }

  if (body.action === 'terminate') {
    const lease = await terminateLease(id);
    return NextResponse.json({ data: lease });
  }

  const lease = await updateLease(id, body);
  return NextResponse.json({ data: lease });
}