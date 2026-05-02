/**
 * Consolidated Report Service
 * 
 * Aggregates profit data from all income sources into a single P&L view.
 * Calculates current period and prior period comparison.
 */

import { getProfitBySource, type DateRange, type ProfitBySourceResult } from './profit-report-service';

export interface ConsolidatedPLResult {
  current: {
    revenue: number;      // total revenue in sen
    expenses: number;     // total expenses in sen
    profit: number;       // net profit in sen
    margin: number;        // percentage
    bySource: ProfitBySourceResult[];
  };
  prior: {
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
  };
  change: {
    revenue: number;      // absolute change in sen
    revenuePercent: number;
    expenses: number;
    expensesPercent: number;
    profit: number;
    profitPercent: number;
  };
}

/**
 * Calculate prior period date range based on current range
 */
function getPriorPeriodRange(dateRange?: DateRange): DateRange | undefined {
  if (!dateRange) {
    // Default: compare current month to last month
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    return {
      startDate: lastMonthStart,
      endDate: lastMonthEnd,
    };
  }
  
  const start = dateRange.startDate;
  const end = dateRange.endDate;
  
  // Calculate duration in days
  const durationMs = end.getTime() - start.getTime();
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  
  // Calculate prior period start and end
  const priorStart = new Date(start.getTime() - durationMs);
  const priorEnd = new Date(end.getTime() - durationMs);
  
  return {
    startDate: priorStart,
    endDate: priorEnd,
  };
}

/**
 * Get consolidated P&L combining all income sources
 * 
 * Returns current period totals and prior period comparison.
 */
export async function getConsolidatedPL(
  userId: string,
  dateRange?: DateRange
): Promise<ConsolidatedPLResult> {
  // Get current period data
  const currentBySource = await getProfitBySource(userId, dateRange);
  
  // Calculate current period totals
  const currentRevenue = currentBySource.reduce((sum, s) => sum + s.revenue, 0);
  const currentExpenses = currentBySource.reduce((sum, s) => sum + s.expenses, 0);
  const currentProfit = currentRevenue - currentExpenses;
  const currentMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;
  
  // Get prior period data
  const priorRange = getPriorPeriodRange(dateRange);
  const priorBySource = await getProfitBySource(userId, priorRange);
  
  // Calculate prior period totals
  const priorRevenue = priorBySource.reduce((sum, s) => sum + s.revenue, 0);
  const priorExpenses = priorBySource.reduce((sum, s) => sum + s.expenses, 0);
  const priorProfit = priorRevenue - priorExpenses;
  const priorMargin = priorRevenue > 0 ? (priorProfit / priorRevenue) * 100 : 0;
  
  // Calculate changes
  const revenueChange = currentRevenue - priorRevenue;
  const revenueChangePercent = priorRevenue > 0 ? ((revenueChange / priorRevenue) * 100) : 0;
  
  const expensesChange = currentExpenses - priorExpenses;
  const expensesChangePercent = priorExpenses > 0 ? ((expensesChange / priorExpenses) * 100) : 0;
  
  const profitChange = currentProfit - priorProfit;
  const profitChangePercent = priorProfit !== 0 ? ((profitChange / Math.abs(priorProfit)) * 100) : (currentProfit > 0 ? 100 : 0);
  
  return {
    current: {
      revenue: currentRevenue,
      expenses: currentExpenses,
      profit: currentProfit,
      margin: Math.round(currentMargin * 10) / 10,
      bySource: currentBySource,
    },
    prior: {
      revenue: priorRevenue,
      expenses: priorExpenses,
      profit: priorProfit,
      margin: Math.round(priorMargin * 10) / 10,
    },
    change: {
      revenue: revenueChange,
      revenuePercent: Math.round(revenueChangePercent * 10) / 10,
      expenses: expensesChange,
      expensesPercent: Math.round(expensesChangePercent * 10) / 10,
      profit: profitChange,
      profitPercent: Math.round(profitChangePercent * 10) / 10,
    },
  };
}
