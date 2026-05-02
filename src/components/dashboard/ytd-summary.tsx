'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatCurrencyWithSign } from '@/lib/format';

interface YtdStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  incomeChange: number;
  expensesChange: number;
  profitChange: number;
}

interface YtdSummaryProps {
  userId?: string;
}

interface SummaryCardProps {
  label: string;
  value: number;
  change?: number;
  icon: React.ElementType;
  colorClass: string;
}

function SummaryCard({ label, value, change, icon: Icon, colorClass }: SummaryCardProps) {
  const getChangeIndicator = () => {
    if (change === undefined || change === 0) {
      return (
        <span className="flex items-center text-muted-foreground text-sm">
          <Minus className="h-4 w-4 mr-1" />
          No change
        </span>
      );
    }
    if (change > 0) {
      return (
        <span className="flex items-center text-green-600 text-sm">
          <ArrowUpRight className="h-4 w-4 mr-1" />
          {change > 100 ? '>100%' : `${change.toFixed(1)}%`}
        </span>
      );
    }
    return (
      <span className="flex items-center text-red-600 text-sm">
        <ArrowDownRight className="h-4 w-4 mr-1" />
        {Math.abs(change) > 100 ? '>100%' : `${Math.abs(change).toFixed(1)}%`}
      </span>
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(value)}</p>
      <div className="mt-2">{getChangeIndicator()}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-muted rounded" />
        <div className="h-5 w-5 bg-muted rounded" />
      </div>
      <div className="mt-2 h-8 w-32 bg-muted rounded" />
      <div className="mt-2 h-4 w-24 bg-muted rounded" />
    </div>
  );
}

export function YtdSummary({ userId }: YtdSummaryProps) {
  const [stats, setStats] = useState<YtdStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchYtdStats() {
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/reports/ytd-stats`);
        const data = await response.json();
        if (data.data) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch YTD stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchYtdStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="YTD Income"
          value={0}
          icon={TrendingUp}
          colorClass="text-green-600"
        />
        <SummaryCard
          label="YTD Expenses"
          value={0}
          icon={TrendingDown}
          colorClass="text-red-600"
        />
        <SummaryCard
          label="YTD Net Profit"
          value={0}
          icon={DollarSign}
          colorClass="text-blue-600"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SummaryCard
        label="YTD Income"
        value={stats.totalIncome}
        change={stats.incomeChange}
        icon={TrendingUp}
        colorClass="text-green-600"
      />
      <SummaryCard
        label="YTD Expenses"
        value={stats.totalExpenses}
        change={stats.expensesChange}
        icon={TrendingDown}
        colorClass="text-red-600"
      />
      <SummaryCard
        label="YTD Net Profit"
        value={stats.netProfit}
        change={stats.profitChange}
        icon={DollarSign}
        colorClass="text-blue-600"
      />
    </div>
  );
}