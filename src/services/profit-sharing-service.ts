import { prisma } from '@/lib/prisma';

export interface PropertyProfit {
  propertyId: string;
  propertyName: string;
  jvStakeholderId: string | null;
  jvSplit: number | null;
  revenueSen: number;
  expensesSen: number;
  netProfitSen: number;
  jvShareSen: number | null;
  ownerShareSen: number | null;
}

export interface ProfitSharingReport {
  userId: string;
  dateRange: { startDate: string; endDate: string };
  properties: PropertyProfit[];
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  totalJvShare: number;
  totalOwnerShare: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export async function getProfitSharingReport(
  userId: string,
  dateRange?: DateRange
): Promise<ProfitSharingReport> {
  const startDate = dateRange?.startDate ?? new Date(0);
  const endDate = dateRange?.endDate ?? new Date();

  const properties = await prisma.property.findMany({
    where: {
      OR: [
        { userId, deletedAt: null },
        { jvStakeholderId: userId, deletedAt: null },
      ],
    },
    select: {
      id: true,
      name: true,
      userId: true,
      jvStakeholderId: true,
      jvSplit: true,
    },
  });

  const paidAtFilter: Record<string, Date> = {
    gte: startDate,
    lte: endDate,
  };

  const results: PropertyProfit[] = [];

  for (const property of properties) {
    const propertyPayments = await prisma.payment.findMany({
      where: {
        OR: [
          { tenant: { leases: { some: { room: { floor: { propertyId: property.id } } } } }, deletedAt: null, status: 'paid', paidAt: paidAtFilter },
          { lease: { room: { floor: { propertyId: property.id } } }, deletedAt: null, status: 'paid', paidAt: paidAtFilter },
        ],
      },
      select: {
        type: true,
        amountSen: true,
      },
    });

    const revenueSen = propertyPayments
      .filter((p) => p.type === 'income')
      .reduce((sum, p) => sum + p.amountSen, 0);

    const expensesSen = propertyPayments
      .filter((p) => p.type === 'expense')
      .reduce((sum, p) => sum + p.amountSen, 0);

    const netProfitSen = revenueSen - expensesSen;
    let jvShareSen: number | null = null;
    let ownerShareSen: number | null = null;

    if (property.jvSplit != null && property.jvSplit > 0) {
      jvShareSen = Math.round(netProfitSen * property.jvSplit);
      ownerShareSen = netProfitSen - jvShareSen;
    }

    results.push({
      propertyId: property.id,
      propertyName: property.name,
      jvStakeholderId: property.jvStakeholderId,
      jvSplit: property.jvSplit,
      revenueSen,
      expensesSen,
      netProfitSen,
      jvShareSen,
      ownerShareSen,
    });
  }

  const totalRevenue = results.reduce((sum, r) => sum + r.revenueSen, 0);
  const totalExpenses = results.reduce((sum, r) => sum + r.expensesSen, 0);
  const totalProfit = results.reduce((sum, r) => sum + r.netProfitSen, 0);
  const totalJvShare = results.reduce((sum, r) => sum + (r.jvShareSen ?? 0), 0);
  const totalOwnerShare = results.reduce((sum, r) => sum + (r.ownerShareSen ?? 0), 0);

  return {
    userId,
    dateRange: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    properties: results,
    totalRevenue,
    totalExpenses,
    totalProfit,
    totalJvShare,
    totalOwnerShare,
  };
}