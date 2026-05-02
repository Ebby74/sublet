import Link from 'next/link';
import { getPayment } from '@/services/payment-service';
import { formatCurrency, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payment = await getPayment(id);

  if (!payment) {
    return (
      <div className="container py-8">
        <p>Payment not found</p>
        <Link href="/payments">
          <Button variant="link">Back to payments</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const isIncome = payment.type === 'income';

  return (
    <div className="container py-8">
      <Link href="/payments" className="text-sm text-muted-foreground hover:text-foreground mb-4 block">
        ← Back to payments
      </Link>

      <div className="border rounded-lg p-6 bg-card">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {payment.referenceNumber || 'Payment'}
              </h1>
              {getStatusBadge(payment.status ?? 'pending')}
            </div>
            <p className={`text-lg font-semibold ${isIncome ? 'text-green-600' : 'text-blue-600'}`}>
              {isIncome ? 'Income' : 'Expense'}: {formatCurrency(payment.amountSen ?? 0)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-sm text-muted-foreground">Payment Type</p>
            <p className="font-medium">{payment.category || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date Paid</p>
            <p className="font-medium">{payment.paidAt ? formatDate(payment.paidAt) : '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Due Date</p>
            <p className="font-medium">{payment.dueDate ? formatDate(payment.dueDate) : '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Recorded</p>
            <p className="font-medium">{formatDate(payment.createdAt ?? new Date())}</p>
          </div>
          {(payment.tenant || payment.lease?.tenant) && (
            <div>
              <p className="text-sm text-muted-foreground">Tenant</p>
              <p className="font-medium">{payment.tenant?.name || payment.lease?.tenant?.name}</p>
            </div>
          )}
          {payment.lease && (
            <div>
              <p className="text-sm text-muted-foreground">Property (Lease)</p>
              <p className="font-medium">{payment.lease.room?.floor?.property?.name ?? '-'}</p>
            </div>
          )}
          {payment.description && (
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{payment.description}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Link href={`/payments/${payment.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Link href={`/payments`}>
            <Button variant="ghost">Delete</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}