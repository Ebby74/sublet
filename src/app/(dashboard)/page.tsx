'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, DollarSign, TrendingUp } from 'lucide-react';
import { FinancialSummary } from '@/components/dashboard/financial-summary';
import { IncomeExpenseChart } from '@/components/dashboard/income-expense-chart';
import { OutstandingList } from '@/components/dashboard/outstanding-list';
import { YtdSummary } from '@/components/dashboard/ytd-summary';
import { PropertyPerformance } from '@/components/dashboard/property-performance';
import { OccupancyTrendsChart } from '@/components/dashboard/occupancy-trends-chart';
import { CashFlowForecast } from '@/components/dashboard/cash-flow-forecast';

type Period = 'this-month' | 'last-month' | 'this-year';

const periods: { value: Period; label: string }[] = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'this-year', label: 'This Year' },
];

interface DashboardStats {
  properties: number;
  tenants: number;
  monthlyIncome: number;
  occupancyRate: number;
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-muted rounded" />
        <div className="h-5 w-5 bg-muted rounded" />
      </div>
      <div className="mt-2 h-8 w-16 bg-muted rounded" />
    </div>
  );
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('this-month');
  const [stats, setStats] = useState<DashboardStats>({
    properties: 0,
    tenants: 0,
    monthlyIncome: 0,
    occupancyRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const propertiesRes = await fetch('/api/v1/properties');
        const propertiesData = await propertiesRes.json();
        const properties = propertiesData.data || [];

        const tenantsRes = await fetch('/api/v1/tenants');
        const tenantsData = await tenantsRes.json();
        const tenants = tenantsData.data || [];

        const statsRes = await fetch(`/api/v1/payments/stats?period=${period}`);
        const statsData = await statsRes.json();

        const occupiedCount = properties.filter((p: { status: string }) => p.status === 'occupied').length;
        const occupancyRate = properties.length > 0
          ? Math.round((occupiedCount / properties.length) * 100)
          : 0;

        setStats({
          properties: properties.length,
          tenants: tenants.length,
          monthlyIncome: statsData.data?.totalIncome || 0,
          occupancyRate,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [period]);

  const statsCards = [
    { label: 'Properties', value: stats.properties, icon: Building2, color: 'text-blue-600' },
    { label: 'Tenants', value: stats.tenants, icon: Users, color: 'text-green-600' },
    { label: 'Monthly Income', value: `RM ${(stats.monthlyIncome / 100).toLocaleString('ms-MY', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-yellow-600' },
    { label: 'Occupancy Rate', value: `${stats.occupancyRate}%`, icon: TrendingUp, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your property management dashboard
          </p>
        </div>

        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Year-to-Date Summary</h2>
        <YtdSummary />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <FinancialSummary period={period} />

      <PropertyPerformance />

      <div className="grid gap-6 lg:grid-cols-2">
        <OccupancyTrendsChart />
        <CashFlowForecast />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <IncomeExpenseChart period={period} />
        <OutstandingList showAll={false} />
      </div>
    </div>
  );
}
