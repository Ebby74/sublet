import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getCashFlowForecast } from '@/services/business-summary-service';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.session) return auth.response;

  const userId = auth.session.user.id;
  const url = new URL(request.url);

  const monthsParam = url.searchParams.get('months');
  const months = monthsParam ? parseInt(monthsParam) : 3;

  try {
    const forecast = await getCashFlowForecast(userId, months);
    return NextResponse.json({
      data: forecast,
      error: null
    });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: 'Failed to get cash flow forecast' },
      { status: 500 }
    );
  }
}