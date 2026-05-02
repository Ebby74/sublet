'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, AlertTriangle, Building2, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { INCOME_SOURCES } from '@/lib/income-sources';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface ProfitData {
  incomeSource: string;
  label: string;
  color: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ProfitBySourceReportProps {
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

export function ProfitBySourceReport({ userId = undefined }: ProfitBySourceReportProps) {
  const [data, setData] = useState<ProfitData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: '', endDate: '' });
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'charts'>('table');

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
      const res = await fetch(`/api/v1/reports/profit-by-source?${params}`);
      const json = await res.json();
      setData(json.data || []);
    } catch (error) {
      console.error('Failed to fetch profit data:', error);
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

  const hasLosses = data.some(d => d.profit < 0);
  const totalProfit = data.reduce((sum, d) => sum + d.profit, 0);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Generate monthly trend data based on selected period
  const monthlyTrendData = useMemo(() => {
    const trend: { month: string; profit: number }[] = [];
    const start = dateRange.startDate ? new Date(dateRange.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = dateRange.endDate ? new Date(dateRange.endDate) : new Date();
    
    // Generate monthly data points
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      const monthName = current.toLocaleString('default', { month: 'short', year: '2-digit' });
      // Distribute profit proportionally (simplified - shows same profit for each month in range)
      const monthProfit = totalProfit / Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000)));
      trend.push({ month: monthName, profit: Math.round(monthProfit) });
      current.setMonth(current.getMonth() + 1);
    }
    return trend;
  }, [dateRange, totalProfit]);

  if (isLoading) {
    return (
      <div className="border rounded-lg p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      {/* Loss Alert Banner */}
      {hasLosses && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-sm text-red-800">
            Some income sources show a loss for this period. Review expenses to improve profitability.
          </span>
        </div>
      )}

      {/* Date Filter */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
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
            {(dateRange.startDate || dateRange.endDate) && (
              <button
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* View Toggle */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded text-sm ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded text-sm ${viewMode === 'cards' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('charts')}
            className={`px-3 py-1.5 rounded text-sm ${viewMode === 'charts' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            Charts
          </button>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            Total Revenue
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            Total Expenses
          </div>
          <p className="text-2xl font-bold">{formatCurrency(data.reduce((s, d) => s + d.expenses, 0))}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Building2 className="h-4 w-4" />
            Net Profit
          </div>
          <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalProfit)}
          </p>
          <p className="text-sm text-muted-foreground">
            {overallMargin >= 0 ? '+' : ''}{overallMargin.toFixed(1)}% margin
          </p>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Income Source</th>
                <th className="text-right py-3 px-4 font-medium">Revenue</th>
                <th className="text-right py-3 px-4 font-medium">Expenses</th>
                <th className="text-right py-3 px-4 font-medium">Net Profit</th>
                <th className="text-right py-3 px-4 font-medium">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const source = INCOME_SOURCES.find(s => s.value === item.incomeSource);
                const isLoss = item.profit < 0;
                return (
                  <tr key={item.incomeSource} className="border-t">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {isLoss && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        <span className={`px-2 py-1 rounded text-xs ${source?.color || 'bg-gray-100 text-gray-800'}`}>
                          {item.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.revenue)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(item.expenses)}</td>
                    <td className={`py-3 px-4 text-right font-bold ${isLoss ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(item.profit)}
                    </td>
                    <td className={`py-3 px-4 text-right ${isLoss ? 'text-red-600' : item.margin >= 0 ? 'text-green-600' : ''}`}>
                      {item.margin >= 0 ? '+' : ''}{item.margin.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t bg-muted/50">
                <td className="py-3 px-4 font-bold">Total</td>
                <td className="py-3 px-4 text-right font-bold">{formatCurrency(totalRevenue)}</td>
                <td className="py-3 px-4 text-right font-bold">{formatCurrency(data.reduce((s, d) => s + d.expenses, 0))}</td>
                <td className={`py-3 px-4 text-right font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalProfit)}
                </td>
                <td className={`py-3 px-4 text-right font-bold ${overallMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overallMargin >= 0 ? '+' : ''}{overallMargin.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((item) => {
            const source = INCOME_SOURCES.find(s => s.value === item.incomeSource);
            const isLoss = item.profit < 0;
            return (
              <div
                key={item.incomeSource}
                className={`p-4 rounded-lg border ${isLoss ? 'border-red-200 bg-red-50' : 'bg-card'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded text-xs ${source?.color || 'bg-gray-100 text-gray-800'}`}>
                    {item.label}
                  </span>
                  {isLoss && (
                    <div className="flex items-center gap-1 text-red-600 text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      Loss
                    </div>
                  )}
                </div>
                <p className={`text-2xl font-bold ${isLoss ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(item.profit)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Margin: {item.margin >= 0 ? '+' : ''}{item.margin.toFixed(1)}%
                </p>
                <div className="mt-3 pt-3 border-t text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-medium">{formatCurrency(item.revenue)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground">Expenses</span>
                    <span className="font-medium">{formatCurrency(item.expenses)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts View */}
      {viewMode === 'charts' && data.length > 0 && (
        <div className="space-y-8">
          {/* Bar Chart - Profit Comparison */}
          <div className="border rounded-lg p-6">
            <h4 className="font-medium text-muted-foreground mb-4">Profit Comparison by Source</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => `RM${(value / 100).toLocaleString()}`}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="label" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="profit" 
                  name="Net Profit" 
                  radius={[0, 4, 4, 0]}
                >
                  {data.map((entry, index) => {
                    const source = INCOME_SOURCES.find(s => s.value === entry.incomeSource);
                    const colors = ['#3B82F6', '#22C55E', '#A855F7', '#9CA3AF'];
                    return (
                      <Cell 
                        key={entry.incomeSource} 
                        fill={entry.profit >= 0 ? (source?.color.includes('blue') ? '#3B82F6' : source?.color.includes('green') ? '#22C55E' : source?.color.includes('purple') ? '#A855F7' : '#9CA3AF') : '#EF4444'} 
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Profit Distribution */}
          {totalProfit > 0 && (
            <div className="border rounded-lg p-6">
              <h4 className="font-medium text-muted-foreground mb-4">Profit Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.filter(d => d.profit > 0)}
                    dataKey="profit"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                  >
                    {data.filter(d => d.profit > 0).map((entry, index) => {
                      const colors = ['#3B82F6', '#22C55E', '#A855F7', '#9CA3AF'];
                      return <Cell key={entry.incomeSource} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Line Chart - Profit Trend */}
          <div className="border rounded-lg p-6">
            <h4 className="font-medium text-muted-foreground mb-4">Profit Trend Over Time</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={(value) => `RM${(value / 100).toLocaleString()}`}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  name="Net Profit" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Empty State */}
      {data.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No profit data for this period.</p>
          <p className="text-sm mt-1">Add income and expenses to see profit breakdown.</p>
        </div>
      )}
    </div>
  );
}
