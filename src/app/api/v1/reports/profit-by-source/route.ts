import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getProfitBySource } from '@/services/profit-report-service';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.session) return auth.response;

  const userId = auth.session.user.id;
  const url = new URL(request.url);

  const startDateParam = url.searchParams.get('startDate');
  const endDateParam = url.searchParams.get('endDate');

  let dateRange: { startDate: Date; endDate: Date } | undefined;

  if (startDateParam && endDateParam) {
    dateRange = {
      startDate: new Date(startDateParam),
      endDate: new Date(endDateParam),
    };
  }

  try {
    const profitData = await getProfitBySource(userId, dateRange);

    return NextResponse.json({
      data: profitData,
      meta: {
        startDate: dateRange?.startDate?.toISOString() || null,
        endDate: dateRange?.endDate?.toISOString() || null,
        generatedAt: new Date().toISOString()
      },
      error: null
    });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: 'Failed to get profit by source' },
      { status: 500 }
    );
  }
}