import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/v1/marketing/analytics
 * 
 * Get post analytics with filters:
 * - roomId: filter by specific room
 * - startDate: filter posts after date (ISO)
 * - endDate: filter posts before date (ISO)
 * 
 * Returns: total, published, failed, successRate, byChannel breakdown
 */
export async function GET(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const where: Record<string, unknown> = { userId: user.id };
  
  if (roomId) where.roomId = roomId;
  if (startDate || endDate) {
    where.postedAt = {};
    if (startDate) (where.postedAt as Record<string, Date>).gte = new Date(startDate);
    if (endDate) (where.postedAt as Record<string, Date>).lte = new Date(endDate);
  }

  const posts = await prisma.marketingPost.findMany({ where });

  // Calculate analytics
  const byChannel = posts.reduce((acc, post) => {
    acc[post.channel] = acc[post.channel] || { total: 0, published: 0, failed: 0 };
    acc[post.channel].total++;
    if (post.status === 'published') acc[post.channel].published++;
    if (post.status === 'failed') acc[post.channel].failed++;
    return acc;
  }, {} as Record<string, { total: number; published: number; failed: number }>);

  const publishedCount = posts.filter(p => p.status === 'published').length;
  const failedCount = posts.filter(p => p.status === 'failed').length;

  const analytics = {
    totalPosts: posts.length,
    publishedPosts: publishedCount,
    failedPosts: failedCount,
    successRate: posts.length > 0 
      ? Math.round((publishedCount / posts.length) * 100) 
      : 0,
    byChannel,
    period: { startDate, endDate },
  };

  return NextResponse.json({ data: analytics });
}