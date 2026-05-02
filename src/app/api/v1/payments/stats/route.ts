import { NextRequest, NextResponse } from 'next/server';
import { getPaymentStatsByPeriod, getMonthlyChartData } from '@/services/payment-service';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.session) return auth.response;

  const userId = auth.session.user.id;
  const url = new URL(request.url);
  const period = (url.searchParams.get('period') || 'this-month') as 'this-month' | 'last-month' | 'this-year';
  const type = url.searchParams.get('type') || 'stats';

  try {
    if (type === 'chart') {
      const months = parseInt(url.searchParams.get('months') || '6');
      const data = await getMonthlyChartData(userId, months);
      return NextResponse.json({ data });
    }

    const stats = await getPaymentStatsByPeriod(userId, period);
    return NextResponse.json({ data: stats });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get payment data' }, { status: 500 });
  }
}
