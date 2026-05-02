import { NextRequest, NextResponse } from 'next/server';
import { getProperty, updateProperty, deleteProperty } from '@/services/property-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  return NextResponse.json({ data: property });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const property = await updateProperty(id, body);
  return NextResponse.json({ data: property });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteProperty(id);
  return NextResponse.json({ data: { success: true } });
}