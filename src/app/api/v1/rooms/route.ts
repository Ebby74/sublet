import { NextRequest, NextResponse } from 'next/server';
import { createRoom, getRoomsByProperty, getPublicRooms } from '@/services/room-service';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  
  // Public endpoint: /api/v1/rooms?public=true
  const { searchParams } = new URL(request.url);
  const isPublic = searchParams.get('public') === 'true';
  
  if (isPublic) {
    const rooms = await getPublicRooms();
    return NextResponse.json({ data: rooms });
  }

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const propertyId = searchParams.get('propertyId');

  if (!propertyId) {
    return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
  }

  const rooms = await getRoomsByProperty(propertyId);
  return NextResponse.json({ data: rooms });
}

export async function POST(request: NextRequest) {
  let userId = request.headers.get('x-user-id');
  const body = await request.json();
  
  if (!userId) {
    userId = body.userId;
  }
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const room = await createRoom(body);
  return NextResponse.json({ data: room }, { status: 201 });
}