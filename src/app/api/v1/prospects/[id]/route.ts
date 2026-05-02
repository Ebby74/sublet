import { NextRequest, NextResponse } from 'next/server';
import { getProspect, updateProspect, deleteProspect, updateProspectStatus, addProspectNote } from '@/services/prospect-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ data: prospect });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Handle status update
  if (body.status) {
    const updated = await updateProspectStatus(id, body.status);
    return NextResponse.json({ data: updated });
  }

  // Handle note addition
  if (body.note) {
    const updated = await addProspectNote(id, {
      ...body.note,
      createdBy: userId,
    });
    return NextResponse.json({ data: updated });
  }

  const updated = await updateProspect(id, body);
  return NextResponse.json({ data: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await deleteProspect(id);
  return NextResponse.json({ data: { success: true } });
}