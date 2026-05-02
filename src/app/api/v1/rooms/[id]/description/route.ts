import { NextRequest, NextResponse } from 'next/server';
import { generateRoomDescription } from '@/services/ai-description-service';
import { getRoom } from '@/services/room-service';

// POST /api/v1/rooms/[id]/description - Generate new AI description
export async function POST(
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

  const result = await generateRoomDescription(id, userId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      description: result.description,
    },
  });
}

// GET /api/v1/rooms/[id]/description - Get current description
export async function GET(
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

  return NextResponse.json({
    data: {
      description: room.description,
      descriptionV2: room.descriptionV2,
    },
  });
}