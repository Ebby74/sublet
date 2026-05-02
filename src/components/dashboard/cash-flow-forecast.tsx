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
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/format';

interface ForecastData {
  month: string;
  expectedIncome: number;
  expectedExpenses: number;
  net: number;
}

interface CashFlowForecastProps {
  userId?: string;
}

function SkeletonChart() {
  return (
    <div className="h-[250px] w-full animate-pulse bg-muted rounded-lg" />
  );
}

export function CashFlowForecast({ userId }: CashFlowForecastProps) {
  const [data, setData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForecastData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/reports/cash-flow-forecast`);
        const result = await response.json();
        if (result.data) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch forecast data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchForecastData();
  }, [userId]);

  const totalIncome = data.reduce((sum, d) => sum + d.expectedIncome, 0);
  const totalExpenses = data.reduce((sum, d) => sum + d.expectedExpenses, 0);
  const totalNet = totalIncome - totalExpenses;

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium text-foreground mb-2">{label}</p>
          <p className="text-sm text-green-600">
            Expected Income: {formatCurrency(payload.find(p => p.dataKey === 'expectedIncome')?.value || 0)}
          </p>
          <p className="text-sm text-red-600">
            Expected Expenses: {formatCurrency(payload.find(p => p.dataKey === 'expectedExpenses')?.value || 0)}
          </p>
          <p className="text-sm text-blue-600">
            Net: {formatCurrency(payload.find(p => p.dataKey === 'net')?.value || 0)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Cash Flow Forecast</h3>
        <SkeletonChart />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Cash Flow Forecast</h3>
        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
          No forecast data available.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Cash Flow Forecast (Next 3 Months)</h3>
      <ResponsiveContainer width="100%" height={250}>
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
            dataKey="expectedIncome" 
            name="Income" 
            fill="#22c55e" 
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            dataKey="expectedExpenses" 
            name="Expenses" 
            fill="#ef4444" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Summary Totals */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Total Expected Income</span>
          <p className="font-semibold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Total Expected Expenses</span>
          <p className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Total Net</span>
          <p className={`font-semibold ${totalNet >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(totalNet)}
          </p>
        </div>
      </div>
    </div>
  );
}