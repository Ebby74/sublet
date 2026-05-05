import { NextRequest, NextResponse } from 'next/server';
import { createRoom, getRoomsByProperty, getPublicRooms, getAllRoomsForAdmin, getRoomsForJVStakeholder } from '@/services/room-service';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isPublic = searchParams.get('public') === 'true';
  
  if (isPublic) {
    const rooms = await getPublicRooms();
    return NextResponse.json({ data: rooms });
  }

  const user = await getCurrentUser(request);
  if (!user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const propertyId = searchParams.get('propertyId');

  if (propertyId) {
    const rooms = await getRoomsByProperty(propertyId);
    return NextResponse.json({ data: rooms });
  }

  const allRooms = searchParams.get('all') === 'true';
  const role = user.role;

  if (allRooms && (role === 'admin' || role === 'moderator')) {
    const rooms = await getAllRoomsForAdmin();
    return NextResponse.json({ data: rooms });
  }

  if (role === 'jv' && user.jvProperties) {
    const propertyIds = JSON.parse(user.jvProperties);
    const rooms = await getRoomsForJVStakeholder(propertyIds);
    return NextResponse.json({ data: rooms });
  }

  return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
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