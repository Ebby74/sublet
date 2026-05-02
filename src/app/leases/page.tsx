import Link from 'next/link';
import { getLeases } from '@/services/lease-service';
import { formatCurrency, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth';

export default async function LeasesPage() {
  const session = await getSession();
  const userId = session?.user?.id ?? '';
  const leases = await getLeases(userId);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leases</h1>
        <Link href="/leases/new">
          <Button>Create Lease</Button>
        </Link>
      </div>

      {leases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No leases yet.</p>
          <p className="text-sm text-muted-foreground">Create your first lease to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leases.map((lease) => (
            <div key={lease.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{lease.room.floor.property.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {lease.tenant.name}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    lease.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {lease.status}
                </span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {formatDate(lease.startDate)} - {formatDate(lease.endDate)} •{' '}
                {formatCurrency(lease.monthlyRentSen)}/month
              </div>
              <Link
                href={`/leases/${lease.id}`}
                className="text-sm text-primary hover:underline mt-2 block"
              >
                View details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}