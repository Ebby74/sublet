import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { withRequestContext } from '@/lib/logger';

/**
 * GET /api/v1/jv/reports/expenses
 * Returns expense report for JV stakeholder's assigned properties
 * Read-only - aggregated expenses by property
 */
export async function GET(request: NextRequest) {
  const log = withRequestContext(request, { route: 'jv/reports/expenses' });
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
          totalExpenses: 0,
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

    // Get expense payments for assigned properties
    // First, find leases linked to our properties through floors
    const leases = await prisma.lease.findMany({
      where: {
        room: {
          floor: {
            propertyId: { in: allPropertyIds }
          }
        },
        deletedAt: null,
      },
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
    });
    const leaseIds = leases.map((l) => l.id);
    const propertyIdByLease = new Map(leases.map((l) => [l.id, l.room.floor.property.id]));
    const propertyNames = new Map(leases.map((l) => [l.room.floor.property.id, l.room.floor.property.name]));

    // Get expenses paid for these leases
    const expensePayments = await prisma.payment.findMany({
      where: {
        type: 'expense',
        status: 'paid',
        deletedAt: null,
        leaseId: { in: leaseIds },
        paidAt: dateFilter.paidAt,
      },
      select: {
        amountSen: true,
        description: true,
        paidAt: true,
        category: true,
        leaseId: true,
      },
      orderBy: { paidAt: 'desc' },
    });

    // Aggregate by property
    const expensesByProperty = new Map<string, { name: string; expensesSen: number; categories: Record<string, number> }>();

    for (const payment of expensePayments) {
      const propertyId = payment.leaseId ? propertyIdByLease.get(payment.leaseId) : null;
      const propertyName = propertyId ? propertyNames.get(propertyId) || 'Unknown' : 'Unknown';
      
      if (!propertyId) continue;

      const existing = expensesByProperty.get(propertyId);
      const category = payment.category || 'uncategorized';
      
      if (existing) {
        existing.expensesSen += payment.amountSen;
        existing.categories[category] = (existing.categories[category] || 0) + payment.amountSen;
      } else {
        expensesByProperty.set(propertyId, {
          name: propertyName,
          expensesSen: payment.amountSen,
          categories: { [category]: payment.amountSen },
        });
      }
    }

    const propertiesExpenses = Array.from(expensesByProperty.values());
    const totalExpenses = propertiesExpenses.reduce((sum, p) => sum + p.expensesSen, 0);

    return NextResponse.json({
      data: {
        properties: propertiesExpenses,
        totalExpenses,
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
    log.error({ error }, 'Failed to get JV expenses report');
    return NextResponse.json(
      { data: null, error: 'Failed to get expenses report' },
      { status: 500 }
    );
  }
}