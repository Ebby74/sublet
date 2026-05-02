'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Payment } from '@/types';
import { INCOME_SOURCES } from '@/lib/payment-constants';

interface PaymentListProps {
  initialPayments?: Payment[];
}

type FilterType = 'all' | 'income' | 'expense';
type FilterStatus = 'all' | 'pending' | 'paid' | 'overdue';
type FilterIncomeSource = 'all' | 'sublet' | 'autoren_sell' | 'autoren_rent' | 'unallocated';

export function PaymentList({ initialPayments = [] }: PaymentListProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterIncomeSource, setFilterIncomeSource] = useState<FilterIncomeSource>('all');
  const [loading, setLoading] = useState(false);

  // Fetch payments on mount if not provided
  useState(() => {
    if (initialPayments.length === 0 && typeof window !== 'undefined') {
      setLoading(true);
      fetch('/api/v1/payments')
        .then((res) => res.json())
        .then((data) => {
          setPayments(data.data || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  });

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (filterType !== 'all' && p.type !== filterType) return false;
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      // Income source filter only applies to expenses
      if (filterIncomeSource !== 'all' && p.type === 'expense') {
        if (p.incomeSource !== filterIncomeSource) return false;
      }
      return true;
    });
  }, [payments, filterType, filterStatus, filterIncomeSource]);

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    return type === 'income' ? (
      <span className="text-green-600 font-medium">Income</span>
    ) : (
      <span className="text-blue-600 font-medium">Expense</span>
    );
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading payments...</div>;
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No payments recorded yet.</p>
        <Link
          href="/payments/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Record Your First Payment
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              filterType === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              filterType === 'income' ? 'bg-green-600 text-white' : 'bg-muted'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              filterType === 'expense' ? 'bg-blue-600 text-white' : 'bg-muted'
            }`}
          >
            Expense
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              filterStatus === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              filterStatus === 'pending' ? 'bg-yellow-500 text-white' : 'bg-muted'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              filterStatus === 'paid' ? 'bg-green-600 text-white' : 'bg-muted'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilterStatus('overdue')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              filterStatus === 'overdue' ? 'bg-red-600 text-white' : 'bg-muted'
            }`}
          >
            Overdue
          </button>
        </div>

        {/* Income Source Filter - only visible when viewing expenses */}
        {filterType === 'expense' && (
          <select
            value={filterIncomeSource}
            onChange={(e) => setFilterIncomeSource(e.target.value as FilterIncomeSource)}
            className="px-3 py-1.5 rounded-md text-sm border bg-background"
          >
            <option value="all">All Income Sources</option>
            <option value="sublet">Sublet</option>
            <option value="autoren_sell">Autoren Sell</option>
            <option value="autoren_rent">Autoren Rent</option>
            <option value="unallocated">Unallocated</option>
          </select>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium">Date</th>
              <th className="text-left py-3 px-4 font-medium">Reference</th>
              <th className="text-left py-3 px-4 font-medium">Tenant</th>
              <th className="text-left py-3 px-4 font-medium">Type</th>
              <th className="text-left py-3 px-4 font-medium">Income Source</th>
              <th className="text-right py-3 px-4 font-medium">Amount</th>
              <th className="text-center py-3 px-4 font-medium">Status</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4">
                  {payment.paidAt ? formatDate(payment.paidAt) : '-'}
                </td>
                <td className="py-3 px-4 font-mono text-sm">
                  {payment.referenceNumber || '-'}
                </td>
                <td className="py-3 px-4">
                  {payment.tenant?.name || payment.lease?.tenant?.name || '-'}
                </td>
                <td className="py-3 px-4">
                  {getTypeBadge(payment.type ?? 'expense')}
                </td>
                <td className="py-3 px-4">
                  {payment.type === 'expense' ? (
                    (() => {
                      const source = INCOME_SOURCES.find(s => s.value === payment.incomeSource);
                      return source ? (
                        <span className={`px-2 py-1 rounded text-xs ${source.color}`}>
                          {source.label}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                          Unallocated
                        </span>
                      );
                    })()
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </td>
                <td className={`py-3 px-4 text-right font-medium ${payment.type === 'income' ? 'text-green-600' : 'text-blue-600'}`}>
                  {payment.type === 'income' ? '+' : '-'}
                  {formatCurrency(payment.amountSen ?? 0)}
                </td>
                <td className="py-3 px-4 text-center">
                  {getStatusBadge(payment.status ?? 'pending')}
                </td>
                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/payments/${payment.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPayments.length === 0 && payments.length > 0 && (
        <p className="text-center py-8 text-muted-foreground">
          No payments match your filters.
        </p>
      )}
    </div>
  );
}