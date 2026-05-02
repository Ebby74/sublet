/**
 * Profit Report Service
 * 
 * Calculates revenue - expenses = net profit per income source.
 * Supports date range filtering for custom reporting periods.
 */

import { prisma } from '@/lib/prisma';
import type { INCOME_SOURCES } from '@/lib/income-sources';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ProfitBySourceResult {
  incomeSource: string;
  label: string;
  color: string;
  revenue: number; // in sen
  expenses: number; // in sen
  profit: number; // in sen (revenue - expenses)
  margin: number; // percentage (profit / revenue) * 100
}

/**
 * Get profit breakdown by income source
 * 
 * Calculates revenue (income payments) - expenses (expense payments) = net profit
 * for each income source: Sublet, Autoren Sell, Autoren Rent
 */
export async function getProfitBySource(
  userId: string,
  dateRange?: DateRange
): Promise<ProfitBySourceResult[]> {
  // Income sources to calculate for
  const incomeSources = [
    { value: 'sublet', label: 'Sublet' },
    { value: 'autoren_sell', label: 'Autoren Sell' },
    { value: 'autoren_rent', label: 'Autoren Rent' },
  ];

  // Build date filter for paidAt
  const paidAtFilter: Record<string, Date> = {};
  if (dateRange?.startDate) {
    paidAtFilter.gte = dateRange.startDate;
  }
  if (dateRange?.endDate) {
    paidAtFilter.lte = dateRange.endDate;
  }

  // Build user filter
  const userFilter = {
    userId,
    deletedAt: null,
    status: 'paid',
  };

  const results: ProfitBySourceResult[] = [];

  for (const source of incomeSources) {
    // Get revenue (income payments for this source)
    const incomeResult = await prisma.payment.aggregate({
      where: {
        ...userFilter,
        type: 'income',
        incomeSource: source.value,
        paidAt: Object.keys(paidAtFilter).length > 0 ? paidAtFilter : undefined,
      },
      _sum: { amountSen: true },
    });

    // Get expenses (expense payments for this source)
    const expenseResult = await prisma.payment.aggregate({
      where: {
        ...userFilter,
        type: 'expense',
        incomeSource: source.value,
        paidAt: Object.keys(paidAtFilter).length > 0 ? paidAtFilter : undefined,
      },
      _sum: { amountSen: true },
    });

    const revenue = incomeResult._sum?.amountSen ?? 0;
    const expenses = expenseResult._sum?.amountSen ?? 0;
    const profit = revenue - expenses;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    results.push({
      incomeSource: source.value,
      label: source.label,
      color: getIncomeSourceColor(source.value),
      revenue,
      expenses,
      profit,
      margin: Math.round(margin * 10) / 10, // Round to 1 decimal
    });
  }

  // Sort by profit descending
  results.sort((a, b) => b.profit - a.profit);

  return results;
}

/**
 * Get color for income source
 */
function getIncomeSourceColor(incomeSource: string): string {
  const colors: Record<string, string> = {
    sublet: 'bg-blue-500',
    autoren_sell: 'bg-green-500',
    autoren_rent: 'bg-purple-500',
  };
  return colors[incomeSource] || 'bg-gray-500';
}