import { NextRequest, NextResponse } from 'next/server';
import { createViewing, getViewings } from '@/services/viewing-service';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      roomId: searchParams.get('roomId') || undefined,
      status: searchParams.get('status') || undefined,
    };

    const viewings = await getViewings(userId, filters);
    return NextResponse.json({ data: viewings, meta: { total: viewings.length } });
  } catch (error) {
    console.error('GET viewings error:', error);
    return NextResponse.json({ error: 'Failed to fetch viewings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roomId, prospectId, scheduledAt } = body;

    if (!roomId || !prospectId || !scheduledAt) {
      return NextResponse.json({ error: 'roomId, prospectId, and scheduledAt required' }, { status: 400 });
    }

    const viewing = await createViewing(
      { roomId, prospectId, scheduledAt: new Date(scheduledAt) },
      userId
    );

    return NextResponse.json({ data: viewing }, { status: 201 });
  } catch (error) {
    console.error('POST viewings error:', error);
    return NextResponse.json({ error: 'Failed to create viewing' }, { status: 500 });
  }
}