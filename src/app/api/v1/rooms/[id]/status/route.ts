import { NextRequest, NextResponse } from 'next/server';
import { getRoom, updateRoomStatus } from '@/services/room-service';

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['active'],
  active: ['rented', 'draft'],
  rented: [],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const room = await getRoom(id);

  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  const body = await request.json();
  const newStatus = body.status;

  if (!newStatus || !['draft', 'active', 'rented'].includes(newStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // Validate transition
  const currentStatus = room.status;
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    return NextResponse.json(
      { error: `Cannot transition from ${currentStatus} to ${newStatus}` },
      { status: 400 }
    );
  }

  const updated = await updateRoomStatus(id, newStatus as 'draft' | 'active' | 'rented');
  return NextResponse.json({ data: updated });
}