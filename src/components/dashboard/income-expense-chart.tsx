'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/format';

type Period = 'this-month' | 'last-month' | 'this-year';

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface IncomeExpenseChartProps {
  userId?: string;
  period?: Period;
}

interface ChartResponse {
  data: MonthlyData[];
}

function SkeletonChart() {
  return (
    <div className="h-[300px] w-full animate-pulse bg-muted rounded-lg" />
  );
}

export function IncomeExpenseChart({ userId, period = 'this-month' }: IncomeExpenseChartProps) {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/payments/chart&period=${period}`);
        const result: ChartResponse = await response.json();
        if (result.data) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, period]);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Income vs Expenses</h3>
        <SkeletonChart />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Income vs Expenses</h3>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No payment data available for this period.
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey === 'income' ? 'Income' : 'Expenses'}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            tickFormatter={(value) => `RM${(value / 100).toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="income" 
            name="Income" 
            fill="#22c55e" 
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            dataKey="expenses" 
            name="Expenses" 
            fill="#ef4444" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
