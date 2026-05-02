import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { withRequestContext } from '@/lib/logger';

/**
 * GET /api/v1/jv/reports/income
 * Returns income report for JV stakeholder's assigned properties
 * Read-only - aggregated income by property
 */
export async function GET(request: NextRequest) {
  const log = withRequestContext(request, { route: 'jv/reports/income' });
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
      select: { role: true, jvProperties: true },
    });

    if (!jvUser || jvUser.role !== 'jv') {
      return NextResponse.json(
        { data: null, error: 'JV access required' },
        { status: 403 }
      );
    }

    // Parse assigned property IDs
    let assignedPropertyIds: string[] = [];
    if (jvUser.jvProperties) {
      try {
        assignedPropertyIds = JSON.parse(jvUser.jvProperties);
      } catch {
        assignedPropertyIds = [];
      }
    }

    // Get property IDs where user is jvStakeholder
    const jvProperties = await prisma.property.findMany({
      where: { jvStakeholderId: user.userId },
      select: { id: true },
    });
    const stakeholderPropertyIds = jvProperties.map((p) => p.id);

    // Combine all assigned property IDs
    const allPropertyIds = [...new Set([...assignedPropertyIds, ...stakeholderPropertyIds])];

    if (allPropertyIds.length === 0) {
      return NextResponse.json({
        data: {
          properties: [],
          totalIncome: 0,
        },
        meta: {
          generatedAt: new Date().toISOString(),
        },
        error: null,
      });
    }

    // Parse date range from query params
    const url = new URL(request.url);
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    const startDate = startDateParam ? new Date(startDateParam) : new Date(new Date().getFullYear(), 0, 1); // Start of year
    const endDate = endDateParam ? new Date(endDateParam) : new Date();

    // Build date filter
    const dateFilter: { paidAt: { gte: Date; lte: Date } } = {
      paidAt: { gte: startDate, lte: endDate },
    };

    // Get income payments for assigned properties
    // Join through Lease -> Room -> Floor -> Property
    const incomePayments = await prisma.payment.findMany({
      where: {
        type: 'income',
        status: 'paid',
        deletedAt: null,
        lease: {
          room: {
            floor: {
              propertyId: { in: allPropertyIds }
            }
          }
        },
        paidAt: dateFilter.paidAt,
      },
      include: {
        lease: {
          include: {
            room: {
              include: {
                floor: {
                  include: {
                    property: {
                      select: { id: true, name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    // Aggregate by property
    const incomeByProperty = new Map<string, { name: string; incomeSen: number }>();

    for (const payment of incomePayments) {
      const propertyId = payment.lease?.room.floor.property.id;
      const propertyName = payment.lease?.room.floor.property.name || 'Unknown';
      
      if (!propertyId) continue;

      const existing = incomeByProperty.get(propertyId);
      if (existing) {
        existing.incomeSen += payment.amountSen;
      } else {
        incomeByProperty.set(propertyId, {
          name: propertyName,
          incomeSen: payment.amountSen,
        });
      }
    }

    const propertiesIncome = Array.from(incomeByProperty.values());
    const totalIncome = propertiesIncome.reduce((sum, p) => sum + p.incomeSen, 0);

    return NextResponse.json({
      data: {
        properties: propertiesIncome,
        totalIncome,
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      },
      meta: {
        generatedAt: new Date().toISOString(),
      },
      error: null,
    });
  } catch (error) {
    log.error({ error }, 'Failed to get JV income report');
    return NextResponse.json(
      { data: null, error: 'Failed to get income report' },
      { status: 500 }
    );
  }
}