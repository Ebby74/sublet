import { NextRequest, NextResponse } from 'next/server';
import { getTenant, updateTenant, deleteTenant } from '@/services/tenant-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tenant = await getTenant(id);

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  return NextResponse.json({ data: tenant });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const tenant = await updateTenant(id, body);
  return NextResponse.json({ data: tenant });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteTenant(id);
  return NextResponse.json({ data: { success: true } });
}
