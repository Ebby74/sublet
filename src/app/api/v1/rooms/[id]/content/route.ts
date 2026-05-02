import { NextRequest, NextResponse } from 'next/server';
import { getRoom } from '@/services/room-service';
import { generateRoomDescription } from '@/services/ai-description-service';
import { getContentHistory, addContentVersion, revertToVersion } from '@/services/content-history-service';

// GET /api/v1/rooms/[id]/content - Get current content and history
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

  const historyResult = await getContentHistory(id);

  return NextResponse.json({
    data: {
      description: room.descriptionV2 || room.description,
      history: historyResult.history || [],
    },
  });
}

// PUT /api/v1/rooms/[id]/content - Manual edit
export async function PUT(
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
  const { description } = body;

  if (!description || typeof description !== 'string') {
    return NextResponse.json({ error: 'Description required' }, { status: 400 });
  }

  const result = await addContentVersion(id, description, userId, 'manual');

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      description,
      version: result.version,
    },
  });
}

// POST /api/v1/rooms/[id]/content - Regenerate with AI or revert
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

  const body = await request.json();
  const { action } = body;

  if (action === 'regenerate') {
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

  if (action === 'revert') {
    const { version } = body;
    if (typeof version !== 'number') {
      return NextResponse.json({ error: 'Version number required' }, { status: 400 });
    }

    const result = await revertToVersion(id, version, userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        reverted: true,
        version,
      },
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}