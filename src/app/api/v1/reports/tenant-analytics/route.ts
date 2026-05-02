import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getTenantAnalytics } from '@/services/business-summary-service';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.session) return auth.response;

  const userId = auth.session.user.id;
  const url = new URL(request.url);

  const sortByParam = url.searchParams.get('sortBy') as 'totalPaid' | 'punctuality' | 'name' | undefined;
  const sortBy = sortByParam || 'totalPaid';

  try {
    const analytics = await getTenantAnalytics(userId, sortBy);

    const averagePunctuality = analytics.length > 0
      ? Math.round(analytics.reduce((sum, t) => sum + t.punctualityScore, 0) / analytics.length)
      : 0;

    return NextResponse.json({
      data: analytics,
      meta: {
        count: analytics.length,
        averagePunctuality
      },
      error: null
    });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: 'Failed to get tenant analytics' },
      { status: 500 }
    );
  }
}