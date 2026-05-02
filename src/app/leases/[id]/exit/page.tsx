import Link from 'next/link';
import { getLease } from '@/services/lease-service';
import { getExitProcessByLeaseId } from '@/services/exit-process-service';
import { formatCurrency, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';

export default async function LeaseExitProcessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lease = await getLease(id);
  const exitProcess = await getExitProcessByLeaseId(id);

  if (!lease) {
    return (
      <div className="container py-8">
        <p>Lease not found</p>
        <Link href="/leases">
          <Button variant="link">Back to leases</Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'deposit_returned':
        return 'bg-blue-100 text-blue-800';
      case 'final_payment_calculated':
        return 'bg-purple-100 text-purple-800';
      case 'inspection_complete':
        return 'bg-yellow-100 text-yellow-800';
      case 'inspection_scheduled':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container py-8">
      <Link
        href={`/leases/${id}`}
        className="text-sm text-muted-foreground hover:text-foreground mb-4 block"
      >
        ← Back to lease
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exit Process</h1>
        {!exitProcess && (
          <Link href={`/leases/${id}/exit/initiate`}>
            <Button>Initiate Exit Process</Button>
          </Link>
        )}
      </div>

      <div className="border rounded-lg p-6 bg-card mb-6">
        <h2 className="font-semibold mb-2">Lease Details</h2>
        <p className="text-sm text-muted-foreground">
          {lease.room.floor.property.name} - {lease.room.name}
        </p>
        <p className="text-sm text-muted-foreground">Tenant: {lease.tenant.name}</p>
        <p className="text-sm text-muted-foreground">
          Lease Period: {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
        </p>
      </div>

      {!exitProcess ? (
        <div className="border rounded-lg p-6 bg-card">
          <p className="text-muted-foreground">No exit process initiated yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border rounded-lg p-6 bg-card">
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-semibold">Exit Status</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(exitProcess.status)}`}
              >
                {exitProcess.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Expected Move-Out</p>
                <p className="font-medium">{formatDate(exitProcess.expectedMoveOut)}</p>
              </div>
              {exitProcess.actualMoveOut && (
                <div>
                  <p className="text-sm text-muted-foreground">Actual Move-Out</p>
                  <p className="font-medium">{formatDate(exitProcess.actualMoveOut)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Initiated At</p>
                <p className="font-medium">{formatDate(exitProcess.initiatedAt)}</p>
              </div>
              {exitProcess.completedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Completed At</p>
                  <p className="font-medium">{formatDate(exitProcess.completedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {exitProcess.totalDeductionsSen > 0 && (
            <div className="border rounded-lg p-6 bg-card">
              <h2 className="font-semibold mb-4">Financial Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Deposit</p>
                  <p className="font-medium">{formatCurrency(lease.depositSen)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Deductions</p>
                  <p className="font-medium text-red-600">
                    -{formatCurrency(exitProcess.totalDeductionsSen)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deposit Return</p>
                  <p className="font-medium text-green-600">
                    {formatCurrency(exitProcess.depositReturnSen ?? 0)}
                  </p>
                </div>
                {exitProcess.finalPaymentSen && (
                  <div>
                    <p className="text-sm text-muted-foreground">Final Payment</p>
                    <p className="font-medium">{formatCurrency(exitProcess.finalPaymentSen)}</p>
                  </div>
                )}
              </div>

              {exitProcess.refundMethod && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Refund Method</p>
                  <p className="font-medium capitalize">{exitProcess.refundMethod.replace(/_/g, ' ')}</p>
                </div>
              )}
            </div>
          )}

          {exitProcess.status !== 'completed' && (
            <div className="flex gap-2">
              <Link href={`/leases/${id}/exit/update`}>
                <Button variant="outline">Update Exit Process</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
