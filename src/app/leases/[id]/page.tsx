import Link from 'next/link';
import { getLease } from '@/services/lease-service';
import { formatCurrency, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';

export default async function LeaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lease = await getLease(id);

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

  return (
    <div className="container py-8">
      <Link href="/leases" className="text-sm text-muted-foreground hover:text-foreground mb-4 block">
        ← Back to leases
      </Link>

      <div className="border rounded-lg p-6 bg-card">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{lease.room.floor.property.name}</h1>
            <p className="text-muted-foreground">Tenant: {lease.tenant.name}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full font-medium ${
              lease.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {lease.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="font-medium">{formatDate(lease.startDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">End Date</p>
            <p className="font-medium">{formatDate(lease.endDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly Rent</p>
            <p className="font-medium">{formatCurrency(lease.monthlyRentSen)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Deposit</p>
            <p className="font-medium">{formatCurrency(lease.depositSen)}</p>
          </div>
        </div>

        {lease.status === 'active' && (
          <div className="flex gap-2 mt-6">
            <Link href={`/leases/${lease.id}/extend`}>
              <Button variant="outline">Extend Lease</Button>
            </Link>
            <Link href={`/leases/${lease.id}/damage`}>
              <Button variant="outline">Damage Reports</Button>
            </Link>
            <Link href={`/leases/${lease.id}/exit`}>
              <Button variant="outline">Exit Process</Button>
            </Link>
            <Link href={`/leases/${lease.id}/terminate`}>
              <Button variant="destructive">Terminate</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}