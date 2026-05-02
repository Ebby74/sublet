import { NextRequest, NextResponse } from 'next/server';
import { markAsRead } from '@/services/notification-service';

/**
 * PATCH /api/v1/notifications/[id]
 * Mark a notification as read
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    // For demo purposes, allow without auth
    const body = await request.json().catch(() => ({}));
    if (!body.userId && !request.headers.get('x-user-id')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const { id } = await params;
  await markAsRead(id);

  return NextResponse.json({ success: true });
}
