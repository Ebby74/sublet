'use client';

import { useEffect, useState } from 'react';
import { Building2, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface JVProperty {
  id: string;
  name: string;
  address: string;
  type: string;
  status: string;
  rentAmountSen: number;
  totalRooms: number;
  vacantRooms: number;
  tenantedRooms: number;
  createdAt: string;
}

interface PropertyFinancials {
  name: string;
  incomeSen: number;
  expensesSen?: number;
  netProfit?: number;
}

interface JVReportData {
  properties: PropertyFinancials[];
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-muted rounded" />
        <div className="h-5 w-5 bg-muted rounded" />
      </div>
      <div className="mt-2 h-8 w-24 bg-muted rounded" />
    </div>
  );
}

function PropertyCard({ property }: { property: JVProperty }) {
  const occupancyRate =
    property.totalRooms > 0
      ? Math.round((property.tenantedRooms / property.totalRooms) * 100)
      : 0;

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {property.name}
          </h3>
          <p className="text-sm text-muted-foreground">{property.address}</p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            property.status === 'occupied'
              ? 'bg-green-100 text-green-800'
              : property.status === 'maintenance'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {property.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Total Rooms</p>
          <p className="text-lg font-semibold">{property.totalRooms}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Tenanted</p>
          <p className="text-lg font-semibold text-green-600">
            {property.tenantedRooms}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Vacant</p>
          <p className="text-lg font-semibold text-orange-600">
            {property.vacantRooms}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Monthly Rent</p>
            <p className="text-lg font-semibold">
              {formatCurrency(property.rentAmountSen)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Occupancy</p>
            <p className="text-lg font-semibold">{occupancyRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JVDashboardPage() {
  const [properties, setProperties] = useState<JVProperty[]>([]);
  const [reportData, setReportData] = useState<JVReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJVData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch assigned properties
        const propertiesRes = await fetch('/api/v1/jv/properties');
        const propertiesData = await propertiesRes.json();

        if (propertiesData.error) {
          if (propertiesData.error === 'JV access required') {
            setError(
              'You do not have JV access. Please contact the administrator.'
            );
            return;
          }
          throw new Error(propertiesData.error);
        }

        setProperties(propertiesData.data || []);

        // Fetch income report
        const incomeRes = await fetch('/api/v1/jv/reports/income');
        const incomeData = await incomeRes.json();

        // Fetch expenses report
        const expensesRes = await fetch('/api/v1/jv/reports/expenses');
        const expensesData = await expensesRes.json();

        // Combine reports
        if (incomeData.data && expensesData.data) {
          const income = incomeData.data;
          const expenses = expensesData.data;

          setReportData({
            properties: income.properties || [],
            totalIncome: income.totalIncome || 0,
            totalExpenses: expenses.totalExpenses || 0,
            netProfit: (income.totalIncome || 0) - (expenses.totalExpenses || 0),
            dateRange: income.dateRange,
          });
        }
      } catch (err) {
        console.error('Failed to fetch JV data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchJVData();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-semibold">Access Denied</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          JV Stakeholder Dashboard
        </h1>
        <p className="text-muted-foreground">
          View your assigned properties and financial performance
        </p>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : reportData ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Total Income
              </p>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {formatCurrency(reportData.totalIncome)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Year-to-date
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </p>
              <TrendingUp className="h-5 w-5 text-red-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {formatCurrency(reportData.totalExpenses)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Year-to-date
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Net Profit
              </p>
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <p
              className={`mt-2 text-2xl font-bold ${
                reportData.netProfit >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {formatCurrency(reportData.netProfit)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Income - Expenses
            </p>
          </div>
        </div>
      ) : null}

      {/* Properties List */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Your Properties
        </h2>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted" />
            <p className="mt-4 text-muted-foreground">
              No properties assigned yet. Contact the administrator for
              access.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
              />
            ))}
          </div>
        )}
      </div>

      {/* Financial Details Per Property */}
      {reportData && reportData.properties.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Income by Property
          </h2>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Property
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Income
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.properties.map((prop, index) => (
                  <tr
                    key={index}
                    className="border-t border-border"
                  >
                    <td className="px-4 py-3">{prop.name}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">
                      {formatCurrency(prop.incomeSen)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-border bg-muted">
                  <td className="px-4 py-3 font-semibold">Total</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">
                    {formatCurrency(reportData.totalIncome)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is a read-only view. You can see
          your assigned properties and financial performance only. Contact
          the administrator for any questions or to update your
          information.
        </p>
      </div>
    </div>
  );
}