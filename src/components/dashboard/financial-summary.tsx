'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatCurrencyWithSign } from '@/lib/format';
import type { PaymentStats } from '@/services/payment-service';

type Period = 'this-month' | 'last-month' | 'this-year';

interface FinancialSummaryProps {
  userId?: string;
  period?: Period;
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
          {formatCurrencyWithSign(change)}
        </span>
      );
    }
    return (
      <span className="flex items-center text-red-600 text-sm">
        <ArrowDownRight className="h-4 w-4 mr-1" />
        {formatCurrencyWithSign(change)}
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

export function FinancialSummary({ userId, period = 'this-month' }: FinancialSummaryProps) {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/payments/stats&period=${period}`);
        const data = await response.json();
        if (data.data) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch payment stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [userId, period]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Income"
          value={0}
          icon={TrendingUp}
          colorClass="text-green-600"
        />
        <SummaryCard
          label="Total Expenses"
          value={0}
          icon={TrendingDown}
          colorClass="text-red-600"
        />
        <SummaryCard
          label="Net Profit"
          value={0}
          icon={DollarSign}
          colorClass="text-blue-600"
        />
        <SummaryCard
          label="Outstanding"
          value={0}
          icon={ArrowUpRight}
          colorClass="text-yellow-600"
        />
      </div>
    );
  }

  const netProfit = stats.totalIncome - stats.totalExpenses;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        label="Total Income"
        value={stats.totalIncome}
        change={stats.incomeThisMonth}
        icon={TrendingUp}
        colorClass="text-green-600"
      />
      <SummaryCard
        label="Total Expenses"
        value={stats.totalExpenses}
        change={stats.expensesThisMonth}
        icon={TrendingDown}
        colorClass="text-red-600"
      />
      <SummaryCard
        label="Net Profit"
        value={netProfit}
        icon={DollarSign}
        colorClass="text-blue-600"
      />
      <SummaryCard
        label="Outstanding"
        value={stats.outstandingAmount}
        icon={ArrowUpRight}
        colorClass="text-yellow-600"
      />
    </div>
  );
}
