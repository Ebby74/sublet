import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPropertyBreakdown } from '@/services/business-summary-service';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.session) return auth.response;

  const userId = auth.session.user.id;
  const url = new URL(request.url);

  const groupByType = url.searchParams.get('groupByType') === 'true';

  try {
    const breakdown = await getPropertyBreakdown(userId, groupByType);
    return NextResponse.json({
      data: breakdown,
      meta: { count: breakdown.length },
      error: null
    });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: 'Failed to get property breakdown' },
      { status: 500 }
    );
  }
}