'use client';

import { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from '@/lib/format';
import { INCOME_SOURCES } from '@/services/payment-service';
import type { PaymentWithRelations } from '@/services/payment-service';

interface ExpenseAllocationReportProps {
  userId?: string;
  year?: number;
}

interface AllocationData {
  incomeSource: string;
  label: string;
  total: number;
  count: number;
  percentage: number;
}

export function ExpenseAllocationReport({ userId = undefined, year }: ExpenseAllocationReportProps) {
  const [payments, setPayments] = useState<PaymentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(year || new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31, 23, 59, 59);

    fetch(
      `/api/v1/payments&type=expense&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    )
      .then((res) => res.json())
      .then((data) => {
        setPayments(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId, selectedYear]);

  const allocationData = useMemo(() => {
    const totalExpenses = payments.reduce((sum, p) => sum + p.amountSen, 0);
    const bySource: Record<string, { total: number; count: number }> = {
      sublet: { total: 0, count: 0 },
      autoren_sell: { total: 0, count: 0 },
      autoren_rent: { total: 0, count: 0 },
      unallocated: { total: 0, count: 0 },
    };

    payments.forEach((p) => {
      const source = p.incomeSource || 'unallocated';
      if (!bySource[source]) {
        bySource[source] = { total: 0, count: 0 };
      }
      bySource[source].total += p.amountSen;
      bySource[source].count += 1;
    });

    const result: AllocationData[] = INCOME_SOURCES.map((source) => ({
      incomeSource: source.value,
      label: source.label,
      total: bySource[source.value]?.total || 0,
      count: bySource[source.value]?.count || 0,
      percentage: totalExpenses > 0 ? ((bySource[source.value]?.total || 0) / totalExpenses) * 100 : 0,
    }));

    return result.sort((a, b) => b.total - a.total);
  }, [payments]);

  const grandTotal = allocationData.reduce((sum, d) => sum + d.total, 0);

  const getBarWidth = (total: number) => {
    if (grandTotal === 0) return 0;
    return (total / grandTotal) * 100;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading expense allocation data...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Year Selector */}
      <div className="flex justify-end mb-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 rounded-md border bg-background"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {allocationData.map((data) => {
          const source = INCOME_SOURCES.find((s) => s.value === data.incomeSource);
          return (
            <div
              key={data.incomeSource}
              className="p-4 rounded-lg border bg-card"
            >
              <p className="text-sm text-muted-foreground mb-1">{data.label}</p>
              <p className="text-2xl font-bold">{formatCurrency(data.total)}</p>
              <p className="text-sm text-muted-foreground">
                {data.count} expense{data.count !== 1 ? 's' : ''} ({data.percentage.toFixed(1)}%)
              </p>
            </div>
          );
        })}
      </div>

      {/* Breakdown Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Income Source</th>
              <th className="text-right py-3 px-4 font-medium">Total</th>
              <th className="text-center py-3 px-4 font-medium">Count</th>
              <th className="text-right py-3 px-4 font-medium">% of Total</th>
              <th className="text-left py-3 px-4 font-medium">Breakdown</th>
            </tr>
          </thead>
          <tbody>
            {allocationData.map((data) => {
              const source = INCOME_SOURCES.find((s) => s.value === data.incomeSource);
              return (
                <tr key={data.incomeSource} className="border-t">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${source?.color || 'bg-gray-100 text-gray-800'}`}>
                      {data.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">{formatCurrency(data.total)}</td>
                  <td className="py-3 px-4 text-center">{data.count}</td>
                  <td className="py-3 px-4 text-right">{data.percentage.toFixed(1)}%</td>
                  <td className="py-3 px-4 w-48">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${getBarWidth(data.total)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr className="border-t bg-muted/50">
              <td className="py-3 px-4 font-medium">Total</td>
              <td className="py-3 px-4 text-right font-bold">{formatCurrency(grandTotal)}</td>
              <td className="py-3 px-4 text-center font-bold">{payments.length}</td>
              <td className="py-3 px-4 text-right font-bold">100%</td>
              <td className="py-3 px-4"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {payments.length === 0 && (
        <p className="text-center py-8 text-muted-foreground">
          No expenses recorded for {selectedYear}. Add expenses to see allocation breakdown.
        </p>
      )}
    </div>
  );
}
