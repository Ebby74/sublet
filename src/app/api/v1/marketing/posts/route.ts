import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { getPostsByRoom, getPostsByUser } from '@/services/post-history-service';

/**
 * GET /api/v1/marketing/posts
 * 
 * Fetch post history with optional filters:
 * - roomId: filter by specific room
 * - channel: filter by instagram|facebook|whatsapp|website
 * - status: filter by pending|published|failed
 */
export async function GET(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const channel = searchParams.get('channel');
  const status = searchParams.get('status');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  let posts;
  if (roomId) {
    posts = await getPostsByRoom(roomId);
  } else {
    posts = await getPostsByUser(user.id);
  }

  // Apply filters
  let filtered = posts;
  if (channel) {
    filtered = filtered.filter(p => p.channel === channel);
  }
  if (status) {
    filtered = filtered.filter(p => p.status === status);
  }

  return NextResponse.json({ data: filtered });
}