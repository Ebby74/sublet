/**
 * Profit & Loss Service with Zakat Calculation
 * 
 * Calculates annual P&L with Zakat perniagaan (2.5%, RM 20k nisab)
 */

import { prisma } from '@/lib/prisma';
import { calculateZakat } from '@/lib/zakat';

/** Profit & Loss data structure */
export interface ProfitLossData {
  year: number;
  incomeByCategory: Array<{ category: string; amount: number }>;
  expensesByCategory: Array<{ category: string; amount: number }>;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  Zakat: number;
  isZakatLiable: boolean;
}

/**
 * Get Profit & Loss for a given year with Zakat calculation
 * 
 * @param userId - The user ID
 * @param year - Optional year (defaults to current year)
 * @returns ProfitLossData with income, expenses, net profit, and Zakat
 */
export async function getProfitLoss(
  userId: string,
  year: number = new Date().getFullYear()
): Promise<ProfitLossData> {
  // Get start and end of year
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  // Fetch all paid payments for the year
  const payments = await prisma.payment.findMany({
    where: {
      userId,
      status: 'paid',
      paidAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      type: true,
      amountSen: true,
      category: true,
    },
  });

  // Calculate totals and group by category
  let totalIncome = 0;
  let totalExpenses = 0;
  const incomeMap = new Map<string, number>();
  const expenseMap = new Map<string, number>();

  for (const payment of payments) {
    if (payment.type === 'income') {
      totalIncome += payment.amountSen;
      const category = payment.category || 'Other';
      incomeMap.set(category, (incomeMap.get(category) || 0) + payment.amountSen);
    } else {
      totalExpenses += payment.amountSen;
      const category = payment.category || 'Other';
      expenseMap.set(category, (expenseMap.get(category) || 0) + payment.amountSen);
    }
  }

  // Convert maps to arrays sorted by amount (descending)
  const incomeByCategory = Array.from(incomeMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const expensesByCategory = Array.from(expenseMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Calculate net profit
  const netProfit = totalIncome - totalExpenses;

  // Calculate Zakat (only if net profit > 0)
  const netProfitForZakat = Math.max(0, netProfit);
  const ZakatResult = calculateZakat(netProfitForZakat);

  return {
    year,
    incomeByCategory,
    expensesByCategory,
    totalIncome,
    totalExpenses,
    netProfit,
    Zakat: ZakatResult.amount,
    isZakatLiable: ZakatResult.isLiable,
  };
}