import { NextRequest, NextResponse } from 'next/server';
import { getNotificationsForUser, getUnreadCount } from '@/services/notification-service';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.session) return auth.response;

  const userId = auth.session.user.id;
  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unread') === 'true';

  const notifications = await getNotificationsForUser(userId, unreadOnly);
  const unreadCount = await getUnreadCount(userId);

  return NextResponse.json({
    data: notifications,
    meta: { unreadCount },
  });
}
