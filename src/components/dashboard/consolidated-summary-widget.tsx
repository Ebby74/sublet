'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Building2, Percent, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ConsolidatedSummaryWidgetProps {
  userId?: string;
}

interface ConsolidatedData {
  current: {
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
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

interface TrendData {
  month: string;
  profit: number;
}

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  suffix?: string;
  children?: React.ReactNode;
}

function MetricCard({ label, value, icon: Icon, colorClass, suffix, children }: MetricCardProps) {
  const displayValue = suffix === '%' 
    ? `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
    : formatCurrency(value);
  
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        <Icon className={`h-4 w-4 ${colorClass}`} />
        {label}
      </div>
      {children || <p className="text-xl font-bold">{displayValue}</p>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-4 animate-pulse">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        <div className="h-4 w-4 bg-muted rounded" />
        <div className="h-4 w-16 bg-muted rounded" />
      </div>
      <div className="h-6 w-24 bg-muted rounded mt-1" />
    </div>
  );
}

export function ConsolidatedSummaryWidget({ userId }: ConsolidatedSummaryWidgetProps) {
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    // Set current month as default
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];

    async function fetchData() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (userId) params.set("userId", userId);
        params.set("startDate", startDate);
        params.set("endDate", endDate);
        const res = await fetch(`/api/v1/reports/consolidated-pl?${params}`);
        const json = await res.json();
        setData(json.data || null);
      } catch (error) {
        console.error('Failed to fetch consolidated data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  // Generate 6-month trend data
  useEffect(() => {
    const fetchTrendData = async () => {
      const trends: TrendData[] = [];
      const now = new Date();

      // Get last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const startDate = monthDate.toISOString().split('T')[0];
        const endDate = monthEnd.toISOString().split('T')[0];

        try {
          const params = new URLSearchParams();
        if (userId) params.set("userId", userId);
        params.set("startDate", startDate);
        params.set("endDate", endDate);
          const res = await fetch(`/api/v1/reports/consolidated-pl?${params}`);
          const json = await res.json();
          const monthName = monthDate.toLocaleString('default', { month: 'short' });

          if (json.data?.current?.profit) {
            trends.push({ month: monthName, profit: json.data.current.profit });
          } else {
            trends.push({ month: monthName, profit: 0 });
          }
        } catch {
          const monthName = monthDate.toLocaleString('default', { month: 'short' });
          trends.push({ month: monthName, profit: 0 });
        }
      }

      setTrendData(trends);
    };

    fetchTrendData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="h-32 border rounded-lg bg-muted/20 animate-pulse" />
      </div>
    );
  }

  const hasData = data?.current && (data.current.revenue > 0 || data.current.expenses > 0);

  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue"
          value={data?.current?.revenue || 0}
          icon={DollarSign}
          colorClass="text-green-600"
        />
        <MetricCard
          label="Total Expenses"
          value={data?.current?.expenses || 0}
          icon={TrendingUp}
          colorClass="text-red-600"
        />
        <MetricCard
          label="Net Profit"
          value={data?.current?.profit || 0}
          icon={Building2}
          colorClass={(data?.current?.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <MetricCard
          label="Profit Margin"
          value={data?.current?.margin || 0}
          icon={Percent}
          colorClass="text-blue-600"
          suffix="%"
        />
      </div>

      {/* Mini Trend Chart */}
      {!hasData ? (
        <div className="text-center py-6 text-muted-foreground border rounded-lg">
          <p>No transactions this month</p>
        </div>
      ) : trendData.length > 0 && (
        <div className="border rounded-lg p-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">6-Month Profit Trend</h4>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <XAxis
                dataKey="month"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `RM${(value / 100).toLocaleString()}`}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip />
              <Bar dataKey="profit" radius={[2, 2, 0, 0]}>
                {trendData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.profit >= 0 ? '#22C55E' : '#EF4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}