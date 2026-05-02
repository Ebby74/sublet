'use client';

import { useState, useEffect } from 'react';
import { Loader2, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { INCOME_SOURCES } from '@/lib/income-sources';

interface ConsolidatedData {
  current: {
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
    bySource: {
      incomeSource: string;
      label: string;
      color: string;
      revenue: number;
      expenses: number;
      profit: number;
      margin: number;
    }[];
  };
  prior: {
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
  };
  change: {
    revenue: number;
    revenuePercent: number;
    expenses: number;
    expensesPercent: number;
    profit: number;
    profitPercent: number;
  };
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ConsolidatedPLReportProps {
  userId?: string;
}

const DATE_PRESETS = [
  { label: 'This Month', getRange: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
  }},
  { label: 'Last Month', getRange: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
  }},
  { label: 'This Quarter', getRange: () => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), quarter * 3, 1);
    const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
    return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
  }},
  { label: 'Last Quarter', getRange: () => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) - 1;
    const start = new Date(now.getFullYear(), quarter * 3, 1);
    const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
    return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
  }},
  { label: 'This Year', getRange: () => {
    const now = new Date();
    return { startDate: `${now.getFullYear()}-01-01`, endDate: `${now.getFullYear()}-12-31` };
  }},
  { label: 'Last Year', getRange: () => {
    const now = new Date();
    return { startDate: `${now.getFullYear() - 1}-01-01`, endDate: `${now.getFullYear() - 1}-12-31` };
  }},
];

function ChangeIndicator({ value, percent }: { value: number; percent: number }) {
  if (value === 0) {
    return (
      <span className="flex items-center gap-1 text-muted-foreground text-sm">
        <Minus className="h-3 w-3" />
        0%
      </span>
    );
  }
  const isPositive = value > 0;
  return (
    <span className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isPositive ? '+' : ''}{formatCurrency(value)} ({percent >= 0 ? '+' : ''}{percent.toFixed(1)}%)
    </span>
  );
}

export function ConsolidatedPLReport({ userId = undefined }: ConsolidatedPLReportProps) {
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: '', endDate: '' });
  const [showComparison, setShowComparison] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    income: true,
    expenses: false,
  });

  useEffect(() => {
    fetchData();
  }, [userId, dateRange]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (userId) params.set("userId", userId);
      if (dateRange.startDate && dateRange.endDate) {
        params.set('startDate', dateRange.startDate);
        params.set('endDate', dateRange.endDate);
      }
      const res = await fetch(`/api/v1/reports/consolidated-pl?${params}`);
      const json = await res.json();
      setData(json.data || null);
    } catch (error) {
      console.error('Failed to fetch consolidated P&L:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetChange = (presetLabel: string) => {
    const preset = DATE_PRESETS.find(p => p.label === presetLabel);
    if (preset) {
      setDateRange(preset.getRange());
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg p-8 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading consolidated P&L...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No data available.</p>
      </div>
    );
  }

  const { current, prior, change } = data;
  const hasData = current.bySource.length > 0;

  return (
    <div className="space-y-6">
      {/* Period Filter */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Period:</label>
          <select
            className="px-3 py-2 rounded-md border bg-background text-sm"
            onChange={(e) => {
              if (e.target.value === 'custom') return;
              handlePresetChange(e.target.value);
            }}
            defaultValue=""
          >
            <option value="" disabled>Select period...</option>
            {DATE_PRESETS.map(preset => (
              <option key={preset.label} value={preset.label}>{preset.label}</option>
            ))}
            <option value="custom">Custom Range</option>
          </select>
        </div>
        
        {dateRange.startDate && dateRange.endDate && (
          <div className="flex items-center gap-2 text-sm">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-2 py-1 rounded-md border bg-background text-sm"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-2 py-1 rounded-md border bg-background text-sm"
            />
            <button
              onClick={() => setDateRange({ startDate: '', endDate: '' })}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        )}

        {/* Compare Toggle */}
        <label className="flex items-center gap-2 ml-auto cursor-pointer">
          <input
            type="checkbox"
            checked={showComparison}
            onChange={(e) => setShowComparison(e.target.checked)}
            className="rounded border-gray-400"
          />
          <span className="text-sm">Compare to Prior Period</span>
        </label>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            Total Revenue
          </div>
          <p className="text-2xl font-bold">{formatCurrency(current.revenue)}</p>
          {showComparison && (
            <div className="mt-1">
              <ChangeIndicator value={change.revenue} percent={change.revenuePercent} />
            </div>
          )}
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            Total Expenses
          </div>
          <p className="text-2xl font-bold">{formatCurrency(current.expenses)}</p>
          {showComparison && (
            <div className="mt-1">
              <ChangeIndicator value={change.expenses} percent={change.expensesPercent} />
            </div>
          )}
        </div>
        <div className={`p-4 rounded-lg border ${current.profit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            Net Profit
          </div>
          <p className={`text-2xl font-bold ${current.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(current.profit)}
          </p>
          {showComparison && (
            <div className="mt-1">
              <ChangeIndicator value={change.profit} percent={change.profitPercent} />
            </div>
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          <p>No transactions for this period.</p>
          <p className="text-sm mt-1">Add income and expenses to see your consolidated P&L.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Income Section */}
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('income')}
              className="w-full px-4 py-3 bg-muted/50 flex items-center justify-between hover:bg-muted transition-colors"
            >
              <span className="font-medium flex items-center gap-2">
                {expandedSections.income ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Income Summary
              </span>
              <span className="font-medium">{formatCurrency(current.revenue)}</span>
            </button>
            
            {expandedSections.income && (
              <div className="divide-y">
                {current.bySource.map((source) => (
                  <div key={source.incomeSource} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs ${INCOME_SOURCES.find(s => s.value === source.incomeSource)?.color || 'bg-gray-100 text-gray-800'}`}>
                        {source.label}
                      </span>
                      {showComparison && (
                        <span className="text-sm text-muted-foreground">
                          Prior: {formatCurrency(prior.revenue / 3)}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{formatCurrency(source.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expenses Section */}
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('expenses')}
              className="w-full px-4 py-3 bg-muted/50 flex items-center justify-between hover:bg-muted transition-colors"
            >
              <span className="font-medium flex items-center gap-2">
                {expandedSections.expenses ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Expense Summary
              </span>
              <span className="font-medium">{formatCurrency(current.expenses)}</span>
            </button>
            
            {expandedSections.expenses && (
              <div className="divide-y">
                {current.bySource.map((source) => (
                  <div key={source.incomeSource} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs ${INCOME_SOURCES.find(s => s.value === source.incomeSource)?.color || 'bg-gray-100 text-gray-800'}`}>
                        {source.label}
                      </span>
                      {showComparison && (
                        <span className="text-sm text-muted-foreground">
                          Prior: {formatCurrency(prior.expenses / 3)}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{formatCurrency(source.expenses)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Net Profit */}
          <div className={`border-2 rounded-lg p-4 flex items-center justify-between ${current.profit >= 0 ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
            <div>
              <span className="text-lg font-bold">Net Profit</span>
              <span className="text-sm text-muted-foreground ml-2">
                ({current.margin >= 0 ? '+' : ''}{current.margin}% margin)
              </span>
              {showComparison && (
                <div className="mt-1">
                  <ChangeIndicator value={change.profit} percent={change.profitPercent} />
                </div>
              )}
            </div>
            <span className={`text-2xl font-bold ${current.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(current.profit)}
            </span>
          </div>

          {/* Prior Period Summary (when comparison enabled) */}
          {showComparison && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="font-medium text-muted-foreground mb-3">Prior Period ({prior.revenue > 0 ? 'vs previous period' : ''})</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="ml-2 font-medium">{formatCurrency(prior.revenue)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Expenses:</span>
                  <span className="ml-2 font-medium">{formatCurrency(prior.expenses)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Profit:</span>
                  <span className={`ml-2 font-medium ${prior.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(prior.profit)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
