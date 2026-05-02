'use client';

import { useState, useEffect, useMemo } from 'react';
import { Download, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { INCOME_SOURCES } from '@/lib/income-sources';
import type { YtdStats, CashFlowForecast, PropertyBreakdown, TenantAnalytics } from '@/services/business-summary-service';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { PaymentWithRelations } from '@/services/payment-service';

interface BusinessSummaryReportProps {
  userId?: string;
}

interface ExpenseAllocationData {
  incomeSource: string;
  label: string;
  total: number;
  count: number;
  percentage: number;
}

interface SummaryData {
  ytdStats: YtdStats | null;
  cashFlow: CashFlowForecast | null;
  topProperty: PropertyBreakdown | null;
  topTenant: TenantAnalytics | null;
  propertyCount: number;
  occupiedCount: number;
  averageRent: number;
  expenseAllocation: ExpenseAllocationData[];
}

export function BusinessSummaryReport({ userId = undefined }: BusinessSummaryReportProps) {
  const [data, setData] = useState<SummaryData>({
    ytdStats: null,
    cashFlow: null,
    topProperty: null,
    topTenant: null,
    propertyCount: 0,
    occupiedCount: 0,
    averageRent: 0,
    expenseAllocation: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1).toISOString();
        const endDate = new Date(currentYear, 11, 31, 23, 59, 59).toISOString();

        const [ytdRes, cashFlowRes, propertyRes, tenantRes, portfolioRes, expensesRes] = await Promise.all([
          fetch('/api/v1/reports/ytd-stats'),
          fetch('/api/v1/reports/cash-flow-forecast'),
          fetch('/api/v1/reports/property-breakdown'),
          fetch('/api/v1/reports/tenant-analytics'),
          fetch('/api/v1/properties'),
          fetch(`/api/v1/payments&type=expense&startDate=${startDate}&endDate=${endDate}`),
        ]);

        const [ytdJson, cashFlowJson, propertyJson, tenantJson, portfolioJson, expensesJson] = await Promise.all([
          ytdRes.ok ? ytdRes.json() : { data: null },
          cashFlowRes.ok ? cashFlowRes.json() : { data: null },
          propertyRes.ok ? propertyRes.json() : { data: [] },
          tenantRes.ok ? tenantRes.json() : { data: [] },
          portfolioRes.ok ? portfolioRes.json() : { properties: [] },
          expensesRes.ok ? expensesRes.json() : { data: [] },
        ]);

        const properties = propertyJson.data || [];
        const tenants = tenantJson.data || [];
        const portfolio = portfolioJson.properties || [];
        const expenses: PaymentWithRelations[] = expensesJson.data || [];

        // Calculate expense allocation by income source
        const totalExpenses = expenses.reduce((sum, p) => sum + p.amountSen, 0);
        const bySource: Record<string, { total: number; count: number }> = {
          sublet: { total: 0, count: 0 },
          autoren_sell: { total: 0, count: 0 },
          autoren_rent: { total: 0, count: 0 },
          unallocated: { total: 0, count: 0 },
        };

        expenses.forEach((p) => {
          const source = p.incomeSource || 'unallocated';
          if (!bySource[source]) {
            bySource[source] = { total: 0, count: 0 };
          }
          bySource[source].total += p.amountSen;
          bySource[source].count += 1;
        });

        const expenseAllocation: ExpenseAllocationData[] = INCOME_SOURCES.map((source) => ({
          incomeSource: source.value,
          label: source.label,
          total: bySource[source.value]?.total || 0,
          count: bySource[source.value]?.count || 0,
          percentage: totalExpenses > 0 ? ((bySource[source.value]?.total || 0) / totalExpenses) * 100 : 0,
        })).sort((a, b) => b.total - a.total);

        // Find top property by income
        const topProperty = properties.length > 0
          ? properties.reduce((max: PropertyBreakdown, p: PropertyBreakdown) =>
              p.totalIncome > max.totalIncome ? p : max
            )
          : null;

        // Find top tenant by total paid
        const topTenant = tenants.length > 0
          ? tenants.reduce((max: TenantAnalytics, t: TenantAnalytics) =>
              t.totalPaid > max.totalPaid ? t : max
            )
          : null;

        setData({
          ytdStats: ytdJson.data || null,
          cashFlow: cashFlowJson.data || null,
          topProperty,
          topTenant,
          propertyCount: portfolio.length,
          occupiedCount: properties.filter((p: PropertyBreakdown) => p.activeLease).length,
          averageRent: properties.length > 0
            ? Math.round(
                properties.reduce((sum: number, p: PropertyBreakdown) => sum + p.totalIncome, 0) / properties.length
              )
            : 0,
          expenseAllocation,
        });
      } catch (error) {
        console.error('Failed to fetch business summary:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({ format: 'business-summary' });
      const res = await fetch(`/api/v1/export?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `business-summary-${new Date().getFullYear()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const occupancyRate = data.propertyCount > 0
    ? Math.round((data.occupiedCount / data.propertyCount) * 100)
    : 0;

  const collectionRate = data.ytdStats?.ytdIncome && data.ytdStats.prevYtdIncome > 0
    ? Math.round((data.ytdStats.ytdIncome / data.ytdStats.prevYtdIncome) * 100)
    : 100;

  if (isLoading) {
    return (
      <div className="border rounded-lg p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Business Summary</h3>
          <p className="text-sm opacity-90">Portfolio overview and key metrics</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport} disabled={isExporting}>
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span className="ml-2">Export</span>
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Portfolio Overview */}
        <section>
          <h4 className="font-medium text-muted-foreground mb-3">Portfolio Overview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-2xl font-bold">{data.propertyCount}</div>
              <div className="text-sm text-muted-foreground">Properties</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-2xl font-bold">{data.occupiedCount}</div>
              <div className="text-sm text-muted-foreground">Occupied</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-2xl font-bold">{occupancyRate}%</div>
              <div className="text-sm text-muted-foreground">Occupancy Rate</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-2xl font-bold">{formatCurrency(data.averageRent)}</div>
              <div className="text-sm text-muted-foreground">Avg Rent/Property</div>
            </div>
          </div>
        </section>

        {/* Financial Summary */}
        {data.ytdStats && (
          <section>
            <h4 className="font-medium text-muted-foreground mb-3">Financial Summary YTD</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Income</span>
                  <TrendIcon value={data.ytdStats.incomeChangePercent} />
                </div>
                <div className="text-xl font-bold text-green-600">{formatCurrency(data.ytdStats.ytdIncome)}</div>
                <div className="text-xs text-muted-foreground">
                  {data.ytdStats.incomeChangePercent > 0 ? '+' : ''}{data.ytdStats.incomeChangePercent}% YoY
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Expenses</span>
                  <TrendIcon value={-data.ytdStats.expenseChangePercent} />
                </div>
                <div className="text-xl font-bold text-red-600">{formatCurrency(data.ytdStats.ytdExpenses)}</div>
                <div className="text-xs text-muted-foreground">
                  {data.ytdStats.expenseChangePercent > 0 ? '+' : ''}{data.ytdStats.expenseChangePercent}% YoY
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <span className="text-sm text-muted-foreground">Net Profit</span>
                <div className={`text-xl font-bold ${data.ytdStats.ytdNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.ytdStats.ytdNetProfit)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.ytdStats.netProfitChangePercent > 0 ? '+' : ''}{data.ytdStats.netProfitChangePercent}% YoY
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <span className="text-sm text-muted-foreground">Collection Rate</span>
                <div className="text-xl font-bold">{collectionRate}%</div>
                <div className="text-xs text-muted-foreground">vs Previous Year</div>
              </div>
            </div>
          </section>
        )}

        {/* Key Metrics */}
        <section>
          <h4 className="font-medium text-muted-foreground mb-3">Key Highlights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.topProperty && (
              <div className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">Top Performing Property</div>
                <div className="font-medium">{data.topProperty.propertyName}</div>
                <div className="text-sm text-green-600">{formatCurrency(data.topProperty.totalIncome)} income</div>
              </div>
            )}
            {data.topTenant && (
              <div className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">Top Tenant by Revenue</div>
                <div className="font-medium">{data.topTenant.tenantName}</div>
                <div className="text-sm text-green-600">{formatCurrency(data.topTenant.totalPaid)} paid</div>
              </div>
            )}
          </div>
        </section>

        {/* Expense Allocation */}
        {data.expenseAllocation.length > 0 && (
          <section>
            <h4 className="font-medium text-muted-foreground mb-3">Expense Allocation</h4>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {data.expenseAllocation.map((source) => {
                const sourceInfo = INCOME_SOURCES.find(s => s.value === source.incomeSource);
                return (
                  <div key={source.incomeSource} className="p-3 rounded-lg border">
                    <p className={`text-sm font-medium ${sourceInfo?.color.split(' ')[0].replace('bg-', 'text-') || 'text-gray-600'}`}>
                      {source.label}
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(source.total)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {source.percentage.toFixed(1)}% of total
                    </p>
                  </div>
                );
              })}
            </div>
            
            {/* Breakdown Chart */}
            {data.expenseAllocation.some(s => s.total > 0) && (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.expenseAllocation.filter(s => s.total > 0)}
                    dataKey="total"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value, payload }) => `${name}: ${((value / (payload as { total: number }).total) * 100).toFixed(1)}%`}
                  >
                    {data.expenseAllocation.filter(s => s.total > 0).map((entry, index) => {
                      const COLORS = ['#3B82F6', '#22C55E', '#A855F7', '#9CA3AF'];
                      return (
                        <Cell key={entry.incomeSource} fill={COLORS[index % COLORS.length]} />
                      );
                    })}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {/* Unallocated Alert */}
            {(() => {
              const unallocated = data.expenseAllocation.find(s => s.incomeSource === 'unallocated');
              if (!unallocated || unallocated.count === 0) return null;
              return (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> {unallocated.count} expenses ({formatCurrency(unallocated.total)}) 
                    are not yet tagged to an income source.{' '}
                    <button className="underline text-yellow-900 font-medium ml-1 hover:text-yellow-700">
                      Tag now
                    </button>
                  </p>
                </div>
              );
            })()}
          </section>
        )}

        {/* Cash Flow Forecast */}
        {data.cashFlow && data.cashFlow.months.length > 0 && (
          <section>
            <h4 className="font-medium text-muted-foreground mb-3">Cash Flow Forecast</h4>
            <div className="flex items-end gap-1 h-24">
              {data.cashFlow.months.map((month, idx) => {
                const maxValue = Math.max(...data.cashFlow!.months.map(m => m.expectedIncome));
                const height = maxValue > 0 ? (month.expectedIncome / maxValue) * 100 : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-primary/20 rounded-t relative" style={{ height: '80px' }}>
                      <div
                        className="absolute bottom-0 w-full bg-primary rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{month.month.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Expected: {formatCurrency(data.cashFlow.totalExpectedIncome)}</span>
              <span>Avg: {formatCurrency(data.cashFlow.averageMonthlyIncome)}/mo</span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
