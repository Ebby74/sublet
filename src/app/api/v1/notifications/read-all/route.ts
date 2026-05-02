import { NextRequest, NextResponse } from 'next/server';
import { markAllAsRead } from '@/services/notification-service';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.session) return auth.response;

  const userId = auth.session.user.id;
  await markAllAsRead(userId);
  return NextResponse.json({ success: true });
}
