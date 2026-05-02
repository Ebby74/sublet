import { NextRequest, NextResponse } from 'next/server';
import { getLeases, createLease, updateExpiredLeases } from '@/services/lease-service';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Run expired update first
  await updateExpiredLeases();

  const leases = await getLeases(userId);
  return NextResponse.json({ data: leases });
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const lease = await createLease({ ...body, userId });

  // Update property status to occupied
  const { prisma } = await import('@/lib/prisma');
  await prisma.property.update({
    where: { id: body.propertyId },
    data: { status: 'occupied' },
  });

  return NextResponse.json({ data: lease }, { status: 201 });
}