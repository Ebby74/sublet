import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { marketingTriggerService } from '@/services/marketing-trigger-service';

/**
 * POST /api/v1/marketing/room-post
 * 
 * Trigger room marketing posts.
 * - Auto-trigger: when room becomes active
 * - Manual: from UI button click
 */
export async function POST(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const { roomId, manual } = await request.json();
  
  if (!roomId) {
    return NextResponse.json({ error: 'roomId required' }, { status: 400 });
  }

  let result;
  if (manual) {
    result = await marketingTriggerService.manualRoomTrigger(user.id, roomId);
  } else {
    result = await marketingTriggerService.onRoomActive(roomId);
  }

  return NextResponse.json({ data: result });
}