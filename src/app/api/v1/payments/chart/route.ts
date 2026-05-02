import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyChartData } from '@/services/payment-service';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.session) return auth.response;

  const userId = auth.session.user.id;
  const url = new URL(request.url);
  const months = parseInt(url.searchParams.get('months') || '6');

  try {
    const data = await getMonthlyChartData(userId, months);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get chart data' }, { status: 500 });
  }
}
