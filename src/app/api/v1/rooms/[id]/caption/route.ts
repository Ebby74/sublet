import { NextRequest, NextResponse } from 'next/server';
import { generateCaptions } from '@/services/caption-service';
import { getRoom } from '@/services/room-service';

type Channel = 'whatsapp' | 'facebook' | 'instagram' | 'propertyGuru' | 'mudah';
type Language = 'en' | 'ms';

// GET /api/v1/rooms/[id]/caption?channel=whatsapp&language=en
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

  const searchParams = request.nextUrl.searchParams;
  const channel = searchParams.get('channel') as Channel | null;
  const language = searchParams.get('language') as Language | null;

  const result = await generateCaptions(id, {
    channel: channel || undefined,
    language: language || 'en',
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      captions: result.captions,
    },
  });
}