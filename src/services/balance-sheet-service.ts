/**
 * Balance Sheet Service
 * 
 * Calculates simple balance sheet: Assets, Liabilities, and Equity.
 * Sources and uses style balance sheet appropriate for small agency.
 * 
 * Assets = Bank/Cash (paid income) + Accounts Receivable (pending/overdue income)
 * Liabilities = Accounts Payable (pending/overdue expenses)
 * Equity = Opening Balance + Net Profit - Drawings
 */

import { prisma } from '@/lib/prisma';
import type { DateRange } from './profit-report-service';
import { getProfitBySource, type ProfitBySourceResult } from './profit-report-service';

export interface BalanceSheetSection {
  cash: number; // in sen - total paid income received
  receivables: number; // in sen - pending/overdue income owed
}

export interface LiabilitiesSection {
  payables: number; // in sen - pending/overdue expenses owed
}

export interface EquitySection {
  opening: number; // in sen - opening balance (starts at 0)
  netProfit: number; // in sen - sum of all profits from all sources
  drawings: number; // in sen - drawings/withdrawals (starts at 0)
}

export interface BalanceSheet {
  assets: BalanceSheetSection;
  liabilities: LiabilitiesSection;
  equity: EquitySection;
}

export interface BalanceSheetTotals {
  assets: number;
  liabilities: number;
  equity: number;
}

/**
 * Get balance sheet data for a user
 * 
 * @param userId - User ID to get balance sheet for
 * @param dateRange - Optional date range filter
 */
export async function getBalanceSheet(
  userId: string,
  dateRange?: DateRange
): Promise<BalanceSheet> {
  // Build date filter for paidAt
  const paidAtFilter: Record<string, Date> = {};
  if (dateRange?.startDate) {
    paidAtFilter.gte = dateRange.startDate;
  }
  if (dateRange?.endDate) {
    paidAtFilter.lte = dateRange.endDate;
  }

  // User filter for payments
  const userFilter = {
    OR: [
      { tenant: { userId } },
      { lease: { room: { floor: { property: { userId } } } } },
    ],
    deletedAt: null,
  };

  // Build paidAt condition
  const paidAtCondition = Object.keys(paidAtFilter).length > 0 ? paidAtFilter : undefined;

  // === ASSETS ===
  
  // Cash: Sum of all PAID income payments (money received)
  const cashResult = await prisma.payment.aggregate({
    where: {
      ...userFilter,
      type: 'income',
      status: 'paid',
      paidAt: paidAtCondition,
    },
    _sum: { amountSen: true },
  });
  const cash = cashResult._sum.amountSen || 0;

  // Receivables: Sum of all PENDING or OVERDUE income payments (money owed)
  const receivablesResult = await prisma.payment.aggregate({
    where: {
      ...userFilter,
      type: 'income',
      status: { in: ['pending', 'overdue'] },
      paidAt: paidAtCondition,
    },
    _sum: { amountSen: true },
  });
  const receivables = receivablesResult._sum.amountSen || 0;

  // === LIABILITIES ===

  // Payables: Sum of all PENDING or OVERDUE expense payments (money owed)
  const payablesResult = await prisma.payment.aggregate({
    where: {
      ...userFilter,
      type: 'expense',
      status: { in: ['pending', 'overdue'] },
      paidAt: paidAtCondition,
    },
    _sum: { amountSen: true },
  });
  const payables = payablesResult._sum.amountSen || 0;

  // === EQUITY ===

  // Opening balance: Start with 0 (or configurable)
  const opening = 0;

  // Net Profit: Get profits from all income sources
  const profits = await getProfitBySource(userId, dateRange);
  const netProfit = profits.reduce((sum, p) => sum + p.profit, 0);

  // Drawings: Currently tracked as 0 (could be configurable or tracked separately)
  const drawings = 0;

  // === TOTALS ===

  const totalAssets = cash + receivables;
  const totalLiabilities = payables;
  const totalEquity = opening + netProfit - drawings;

  return {
    assets: {
      cash,
      receivables,
    },
    liabilities: {
      payables,
    },
    equity: {
      opening,
      netProfit,
      drawings,
    },
  };
}

/**
 * Calculate totals from balance sheet
 */
export function getBalanceSheetTotals(balanceSheet: BalanceSheet): BalanceSheetTotals {
  const { assets, liabilities, equity } = balanceSheet;
  const totalAssets = assets.cash + assets.receivables;
  const totalLiabilities = liabilities.payables;
  const totalEquity = equity.opening + equity.netProfit - equity.drawings;
  return {
    assets: totalAssets,
    liabilities: totalLiabilities,
    equity: totalEquity,
  };
}

/**
 * Verify balance sheet balances
 * Assets = Liabilities + Equity should always be true
 */
export function verifyBalanceSheet(balanceSheet: BalanceSheet): boolean {
  const totals = getBalanceSheetTotals(balanceSheet);
  return totals.assets === totals.liabilities + totals.equity;
}