/**
 * Business Summary Service
 *
 * Provides analytics and reporting functions for business performance:
 * - YTD financials with YoY comparison
 * - Property breakdown analysis
 * - Tenant analytics
 * - Cash flow forecasting
 */

import { prisma } from '@/lib/prisma';
import {
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  addMonths,
  isWithinInterval,
  differenceInDays,
  subMonths,
  format,
} from 'date-fns';
import type { Property, Lease, Tenant, Payment } from '@prisma/client';

// ============================================
// Type Definitions
// ============================================

/** YTD Statistics */
export interface YtdStats {
  year: number;
  ytdIncome: number; // in sen
  ytdExpenses: number; // in sen
  ytdNetProfit: number; // in sen
  prevYtdIncome: number;
  prevYtdExpenses: number;
  prevYtdNetProfit: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
  netProfitChangePercent: number;
}

/** Property Breakdown */
export interface PropertyBreakdown {
  propertyId: string;
  propertyName: string;
  propertyType: string;
  totalIncome: number; // in sen
  totalExpenses: number; // in sen
  netProfit: number; // in sen
  occupancyRate: number; // percentage (0-100)
  leaseCount: number;
  activeLease: boolean;
}

/** Property Breakdown by Type (when groupByType is true) */
export interface PropertyTypeBreakdown {
  propertyType: string;
  propertyCount: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  averageOccupancyRate: number;
}

/** Tenant Analytics */
export interface TenantAnalytics {
  tenantId: string;
  tenantName: string;
  tenantEmail: string | null;
  totalPaid: number; // in sen
  punctualityScore: number; // percentage (0-100)
  paymentsCount: number;
  lastPaymentDate: Date | null;
  activeLease: boolean;
  leaseEndDate: Date | null;
  daysUntilExpiry: number | null;
  propertyName: string | null;
}

/** Cash Flow Forecast Month */
export interface CashFlowMonth {
  month: string; // formatted as "MMM YYYY"
  expectedIncome: number; // in sen
  expectedExpenses: number; // in sen
  netCashFlow: number; // in sen
}

/** Cash Flow Forecast */
export interface CashFlowForecast {
  months: CashFlowMonth[];
  totalExpectedIncome: number;
  totalExpectedExpenses: number;
  totalNetCashFlow: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate percentage change between two values
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / Math.abs(previous)) * 100 * 100) / 100;
}

/**
 * Get date range for YTD
 */
function getYtdDateRange(year: number): { start: Date; end: Date } {
  const now = new Date();
  const currentYear = now.getFullYear();

  // If querying current year, use today as end date
  // Otherwise use end of year
  const start = startOfYear(new Date(year, 0, 1));
  const end = year === currentYear ? now : endOfYear(new Date(year, 0, 1));

  return { start, end };
}

/**
 * Build base payment filter for user
 */
function buildUserPaymentFilter(userId: string): Record<string, unknown> {
  return {
    OR: [
      { tenant: { userId } },
      { lease: { property: { userId } },
      },
    ],
    deletedAt: null,
  };
}

// ============================================
// Main Service Functions
// ============================================

/**
 * Get Year-to-Date statistics with Year-over-Year comparison
 *
 * @param userId - User ID
 * @param year - Optional year (defaults to current year)
 */
export async function getYtdStats(userId: string, year?: number): Promise<YtdStats> {
  const now = new Date();
  const currentYear = year ?? now.getFullYear();
  const previousYear = currentYear - 1;

  // Get YTD date ranges
  const currentRange = getYtdDateRange(currentYear);
  const previousRange = getYtdDateRange(previousYear);

  const userFilter = buildUserPaymentFilter(userId);

  // Current year income
  const currentIncome = await prisma.payment.aggregate({
    where: {
      ...userFilter,
      type: 'income',
      status: 'paid',
      paidAt: { gte: currentRange.start, lte: currentRange.end },
    },
    _sum: { amountSen: true },
  });

  // Current year expenses
  const currentExpenses = await prisma.payment.aggregate({
    where: {
      ...userFilter,
      type: 'expense',
      status: 'paid',
      paidAt: { gte: currentRange.start, lte: currentRange.end },
    },
    _sum: { amountSen: true },
  });

  // Previous year income
  const previousIncome = await prisma.payment.aggregate({
    where: {
      ...userFilter,
      type: 'income',
      status: 'paid',
      paidAt: { gte: previousRange.start, lte: previousRange.end },
    },
    _sum: { amountSen: true },
  });

  // Previous year expenses
  const previousExpenses = await prisma.payment.aggregate({
    where: {
      ...userFilter,
      type: 'expense',
      status: 'paid',
      paidAt: { gte: previousRange.start, lte: previousRange.end },
    },
    _sum: { amountSen: true },
  });

  const ytdIncome = currentIncome._sum.amountSen ?? 0;
  const ytdExpenses = currentExpenses._sum.amountSen ?? 0;
  const prevYtdIncome = previousIncome._sum.amountSen ?? 0;
  const prevYtdExpenses = previousExpenses._sum.amountSen ?? 0;

  return {
    year: currentYear,
    ytdIncome,
    ytdExpenses,
    ytdNetProfit: ytdIncome - ytdExpenses,
    prevYtdIncome,
    prevYtdExpenses,
    prevYtdNetProfit: prevYtdIncome - prevYtdExpenses,
    incomeChangePercent: calculatePercentageChange(ytdIncome, prevYtdIncome),
    expenseChangePercent: calculatePercentageChange(ytdExpenses, prevYtdExpenses),
    netProfitChangePercent: calculatePercentageChange(
      ytdIncome - ytdExpenses,
      prevYtdIncome - prevYtdExpenses
    ),
  };
}

/**
 * Get property breakdown with income, expenses, and occupancy
 *
 * @param userId - User ID
 * @param groupByType - Optional flag to aggregate by property type
 */
export async function getPropertyBreakdown(
  userId: string,
  groupByType?: boolean
): Promise<PropertyBreakdown[] | PropertyTypeBreakdown[]> {
  // Get all properties for user
  const properties = await prisma.property.findMany({
    where: { userId, deletedAt: null },
    include: {
      floors: {
        include: {
          rooms: {
            include: {
              leases: {
                where: { deletedAt: null },
                include: {
                  payments: {
                    where: { deletedAt: null, status: 'paid', paidAt: { not: null } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const now = new Date();
  const propertyBreakdowns: PropertyBreakdown[] = properties.map((property) => {
    // Collect all leases from all rooms
    const allLeases = property.floors.flatMap(f => f.rooms).flatMap(r => r.leases);
    
    // Sum income from leases
    let totalIncome = 0;
    let leaseCount = 0;
    let activeLease = false;

    allLeases.forEach((lease) => {
      if (!lease.deletedAt) {
        leaseCount++;
        if (lease.status === 'active') {
          activeLease = true;
        }
        // Sum payments for this lease
        lease.payments.forEach((payment) => {
          if (payment.type === 'income') {
            totalIncome += payment.amountSen;
          }
        });
      }
    });

    // Calculate occupancy rate (active leases / total leases * 100)
    const activeLeases = allLeases.filter(
      (l) => l.status === 'active' && !l.deletedAt
    ).length;
    const occupancyRate = leaseCount > 0 ? Math.round((activeLeases / leaseCount) * 100) : 0;

    return {
      propertyId: property.id,
      propertyName: property.name,
      propertyType: property.type,
      totalIncome,
      totalExpenses: 0, // TODO: Link expenses to properties if needed
      netProfit: totalIncome,
      occupancyRate,
      leaseCount,
      activeLease,
    };
  });

  // If groupByType is requested, aggregate by property type
  if (groupByType) {
    const typeMap = new Map<string, PropertyTypeBreakdown>();

    propertyBreakdowns.forEach((pb) => {
      const existing = typeMap.get(pb.propertyType);
      if (existing) {
        existing.propertyCount += 1;
        existing.totalIncome += pb.totalIncome;
        existing.totalExpenses += pb.totalExpenses;
        existing.netProfit += pb.netProfit;
        existing.averageOccupancyRate =
          (existing.averageOccupancyRate + pb.occupancyRate) / 2;
      } else {
        typeMap.set(pb.propertyType, {
          propertyType: pb.propertyType,
          propertyCount: 1,
          totalIncome: pb.totalIncome,
          totalExpenses: pb.totalExpenses,
          netProfit: pb.netProfit,
          averageOccupancyRate: pb.occupancyRate,
        });
      }
    });

    return Array.from(typeMap.values());
  }

  return propertyBreakdowns;
}

/**
 * Get tenant analytics including payment history and punctuality
 *
 * @param userId - User ID
 * @param sortBy - Sort field: 'totalPaid' | 'punctuality' | 'name' (default: 'totalPaid')
 */
export async function getTenantAnalytics(
  userId: string,
  sortBy: 'totalPaid' | 'punctuality' | 'name' = 'totalPaid'
): Promise<TenantAnalytics[]> {
  // Get all tenants with their leases and payments
  const tenants = await prisma.tenant.findMany({
    where: { userId, deletedAt: null },
    include: {
      leases: {
        where: { deletedAt: null },
        include: {
          room: {
            include: {
              floor: {
                include: {
                  property: { select: { name: true } }
                }
              }
            }
          },
          payments: {
            where: { deletedAt: null, status: 'paid' },
            orderBy: { paidAt: 'desc' },
          },
        },
      },
    },
  });

  const now = new Date();
  const tenantAnalytics: TenantAnalytics[] = tenants.map((tenant) => {
    // Find active lease
    const activeLease = tenant.leases.find((l) => l.status === 'active');
    const leaseEndDate = activeLease ? activeLease.endDate : null;
    const daysUntilExpiry = leaseEndDate
      ? differenceInDays(new Date(leaseEndDate), now)
      : null;

    const propertyName = activeLease?.room.floor.property.name || '-';

    // Calculate total paid and payment count
    let totalPaid = 0;
    let paymentsCount = 0;
    let onTimePayments = 0;
    let lastPaymentDate: Date | null = null;

    tenant.leases.forEach((lease) => {
      lease.payments.forEach((payment) => {
        if (payment.type === 'income') {
          totalPaid += payment.amountSen;
          paymentsCount++;

          if (payment.paidAt) {
            lastPaymentDate = payment.paidAt;

            // Check if payment was on time
            if (payment.dueDate && payment.paidAt <= new Date(payment.dueDate)) {
              onTimePayments++;
            } else if (!payment.dueDate) {
              // If no due date, consider on time
              onTimePayments++;
            }
          }
        }
      });
    });

    // Calculate punctuality score
    const punctualityScore =
      paymentsCount > 0 ? Math.round((onTimePayments / paymentsCount) * 100) : 100;

    return {
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantEmail: tenant.email,
      totalPaid,
      punctualityScore,
      paymentsCount,
      lastPaymentDate,
      activeLease: !!activeLease,
      leaseEndDate,
      daysUntilExpiry,
      propertyName,
    };
  });

  // Sort results
  switch (sortBy) {
    case 'totalPaid':
      return tenantAnalytics.sort((a, b) => b.totalPaid - a.totalPaid);
    case 'punctuality':
      return tenantAnalytics.sort((a, b) => b.punctualityScore - a.punctualityScore);
    case 'name':
      return tenantAnalytics.sort((a, b) => a.tenantName.localeCompare(b.tenantName));
    default:
      return tenantAnalytics;
  }
}

/**
 * Get cash flow forecast for upcoming months
 *
 * @param userId - User ID
 * @param months - Number of months to forecast (default: 6)
 */
export async function getCashFlowForecast(
  userId: string,
  months: number = 6
): Promise<CashFlowForecast> {
  const userFilter = buildUserPaymentFilter(userId);
  const now = new Date();

  // Get active leases for expected income
  const activeLeases = await prisma.lease.findMany({
    where: {
      userId,
      status: 'active',
      deletedAt: null,
    },
    include: {
      room: {
        include: {
          floor: {
            include: {
              property: { select: { id: true, name: true, address: true, type: true } }
            }
          }
        }
      },
    },
  });

  // Calculate average monthly expenses from past 3 months
  const threeMonthsAgo = subMonths(startOfMonth(now), 3);
  const monthStart = startOfMonth(threeMonthsAgo);

  const recentExpenses = await prisma.payment.aggregate({
    where: {
      ...userFilter,
      type: 'expense',
      status: 'paid',
      paidAt: { gte: monthStart },
    },
    _sum: { amountSen: true },
    _count: true,
  });

  // Average monthly expenses (divide by 3 months)
  const totalRecentExpenses = recentExpenses._sum.amountSen ?? 0;
  const averageMonthlyExpenses = Math.round(totalRecentExpenses / 3);

  // Build forecast for each month
  const forecastMonths: CashFlowMonth[] = [];
  let totalExpectedIncome = 0;
  let totalExpectedExpenses = 0;

  for (let i = 0; i < months; i++) {
    const forecastDate = addMonths(startOfMonth(now), i);
    const monthLabel = format(forecastDate, 'MMM yyyy');

    // Expected income = sum of all active lease monthly rents
    // (for simplicity, using the same rent for each month)
    const expectedIncome = activeLeases.reduce(
      (sum, lease) => sum + lease.monthlyRentSen,
      0
    );

    const netCashFlow = expectedIncome - averageMonthlyExpenses;

    forecastMonths.push({
      month: monthLabel,
      expectedIncome,
      expectedExpenses: averageMonthlyExpenses,
      netCashFlow,
    });

    totalExpectedIncome += expectedIncome;
    totalExpectedExpenses += averageMonthlyExpenses;
  }

  return {
    months: forecastMonths,
    totalExpectedIncome,
    totalExpectedExpenses,
    totalNetCashFlow: totalExpectedIncome - totalExpectedExpenses,
    averageMonthlyIncome: Math.round(totalExpectedIncome / months),
    averageMonthlyExpenses,
  };
}
