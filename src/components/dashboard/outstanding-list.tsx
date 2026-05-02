'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/format';
import { ArrowRight, AlertCircle } from 'lucide-react';

type OutstandingPayment = {
  id: string;
  amountSen: number;
  dueDate: Date | null;
  status: 'pending' | 'overdue';
  type: 'income' | 'expense';
  tenant: { name: string } | null;
  lease: {
    property: { name: string };
    tenant: { name: string };
  } | null;
};

interface OutstandingListProps {
  userId?: string;
  showAll?: boolean;
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b animate-pulse">
      <div className="flex-1">
        <div className="h-4 w-24 bg-muted rounded mb-2" />
        <div className="h-3 w-32 bg-muted rounded" />
      </div>
      <div className="h-4 w-20 bg-muted rounded" />
    </div>
  );
}

function getStatusStyle(status: 'pending' | 'overdue', daysOverdue: number) {
  if (status === 'pending') {
    if (daysOverdue >= 4) {
      return { bg: 'bg-red-100', text: 'text-red-800', label: `${daysOverdue} days overdue` };
    }
    if (daysOverdue >= 1) {
      return { bg: 'bg-orange-100', text: 'text-orange-800', label: `${daysOverdue} days overdue` };
    }
    return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Due soon' };
  }
  // overdue
  if (daysOverdue >= 4) {
    return { bg: 'bg-red-100', text: 'text-red-800', label: `${daysOverdue} days overdue` };
  }
  return { bg: 'bg-orange-100', text: 'text-orange-800', label: `${daysOverdue} days overdue` };
}

export function OutstandingList({ userId, showAll = false }: OutstandingListProps) {
  const [payments, setPayments] = useState<OutstandingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    async function fetchOutstanding() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/v1/payments&status=pending,overdue&limit=${showAll ? 100 : 5}`
        );
        const data = await response.json();
        const fetchedPayments = data.data || [];
        setPayments(fetchedPayments);
        
        const total = fetchedPayments.reduce((sum: number, p: OutstandingPayment) => sum + p.amountSen, 0);
        setTotalAmount(total);
      } catch (error) {
        console.error('Failed to fetch outstanding payments:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOutstanding();
  }, [userId, showAll]);

  const getDaysOverdue = (dueDate: Date | null): number => {
    if (!dueDate) return 0;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTenantName = (payment: OutstandingPayment): string => {
    return payment.tenant?.name || payment.lease?.tenant?.name || 'No tenant';
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Outstanding Payments</h3>
        {[1, 2, 3].map((i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Outstanding Payments</h3>
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>No outstanding payments</p>
          </div>
        </div>
      </div>
    );
  }

  // Sort by due date (earliest first)
  const sortedPayments = [...payments].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Outstanding Payments</h3>
        <span className="text-sm text-muted-foreground">
          {payments.length} totaling {formatCurrency(totalAmount)}
        </span>
      </div>

      <div className="space-y-1">
        {sortedPayments.slice(0, showAll ? 100 : 5).map((payment) => {
          const daysOverdue = getDaysOverdue(payment.dueDate);
          const style = getStatusStyle(payment.status, daysOverdue);

          return (
            <div
              key={payment.id}
              className="flex items-center justify-between py-3 px-3 rounded-md hover:bg-muted/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground truncate">
                    {getTenantName(payment)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span>{payment.type === 'income' ? 'Receivable' : 'Payable'}</span>
                  {payment.dueDate && (
                    <span>Due: {formatDate(payment.dueDate)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-semibold ${payment.type === 'income' ? 'text-green-600' : 'text-blue-600'}`}>
                  {payment.type === 'income' ? '+' : '-'}
                  {formatCurrency(payment.amountSen)}
                </span>
                <Link
                  href={`/payments/${payment.id}`}
                  className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {!showAll && payments.length > 5 && (
        <div className="mt-4 pt-4 border-t">
          <Link
            href="/payments?status=pending"
            className="text-sm text-primary hover:underline flex items-center justify-center"
          >
            View all {payments.length} outstanding payments
          </Link>
        </div>
      )}
    </div>
  );
}
