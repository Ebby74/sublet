import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getYtdStats } from '@/services/business-summary-service';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.session) return auth.response;

  const userId = auth.session.user.id;
  const url = new URL(request.url);

  const yearParam = url.searchParams.get('year');
  const year = yearParam ? parseInt(yearParam) : undefined;

  try {
    const stats = await getYtdStats(userId, year);
    return NextResponse.json({
      data: stats,
      meta: {
        year: stats.year,
        asOf: new Date().toISOString()
      },
      error: null
    });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: 'Failed to get YTD stats' },
      { status: 500 }
    );
  }
}