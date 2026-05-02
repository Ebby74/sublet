import { NextRequest, NextResponse } from 'next/server';
import { getFloor, updateFloor, deleteFloor } from '@/services/floor-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const floor = await getFloor(id);
  
  if (!floor) {
    return NextResponse.json({ error: 'Floor not found' }, { status: 404 });
  }
  
  return NextResponse.json({ data: floor });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const floor = await updateFloor(id, body);
    return NextResponse.json({ data: floor });
  } catch (error) {
    console.error('Update floor error:', error);
    return NextResponse.json({ error: 'Failed to update floor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await deleteFloor(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete floor error:', error);
    return NextResponse.json({ error: 'Failed to delete floor' }, { status: 500 });
  }
}