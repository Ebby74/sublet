import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getProfitSharingReport } from '@/services/profit-sharing-service';
import { withRequestContext } from '@/lib/logger';

/**
 * GET /api/v1/jv/reports/profit-sharing
 * Returns profit sharing report for JV stakeholder
 */
export async function GET(request: NextRequest) {
  const log = withRequestContext(request, { route: 'jv/reports/profit-sharing' });
  try {
    const user = await getCurrentUser(request);

    if (!user?.userId) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has JV role
    const jvUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true },
    });

    if (!jvUser || jvUser.role !== 'jv') {
      return NextResponse.json(
        { data: null, error: 'JV access required' },
        { status: 403 }
      );
    }

    // Parse date range from query params
    const url = new URL(request.url);
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    const dateRange = startDateParam || endDateParam
      ? {
          startDate: startDateParam ? new Date(startDateParam) : new Date(new Date().getFullYear(), 0, 1),
          endDate: endDateParam ? new Date(endDateParam) : new Date(),
        }
      : undefined;

    const report = await getProfitSharingReport(user.userId, dateRange);

    // Convert sen to ringgit for display
    const formatSen = (sen: number) => sen / 100;

    const data = {
      userId: report.userId,
      dateRange: report.dateRange,
      properties: report.properties.map((p) => ({
        propertyId: p.propertyId,
        propertyName: p.propertyName,
        jvStakeholderId: p.jvStakeholderId,
        jvSplit: p.jvSplit,
        revenue: formatSen(p.revenueSen),
        expenses: formatSen(p.expensesSen),
        netProfit: formatSen(p.netProfitSen),
        jvShare: p.jvShareSen ? formatSen(p.jvShareSen) : null,
        ownerShare: p.ownerShareSen ? formatSen(p.ownerShareSen) : null,
      })),
      totalRevenue: formatSen(report.totalRevenue),
      totalExpenses: formatSen(report.totalExpenses),
      totalProfit: formatSen(report.totalProfit),
      totalJvShare: formatSen(report.totalJvShare),
      totalOwnerShare: formatSen(report.totalOwnerShare),
    };

    return NextResponse.json({
      data,
      meta: {
        total: report.properties.length,
        generatedAt: new Date().toISOString(),
      },
      error: null,
    });
  } catch (error) {
    log.error({ error }, 'Failed to get profit sharing report');
    return NextResponse.json(
      { data: null, error: 'Failed to get profit sharing report' },
      { status: 500 }
    );
  }
}