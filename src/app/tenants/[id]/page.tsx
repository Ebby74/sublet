import Link from 'next/link';
import { getTenant } from '@/services/tenant-service';
import { formatCurrency, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await getTenant(id);

  if (!tenant) {
    return (
      <div className="container py-8">
        <p>Tenant not found</p>
        <Link href="/tenants">
          <Button variant="link">Back to tenants</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Link href="/tenants" className="text-sm text-muted-foreground hover:text-foreground mb-4 block">
        ← Back to tenants
      </Link>

      <div className="border rounded-lg p-6 bg-card">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{tenant.name}</h1>
            <p className="text-muted-foreground">IC: {tenant.icNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{tenant.phone ?? '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{tenant.email ?? '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">IC Number</p>
            <p className="font-medium">{tenant.icNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Added</p>
            <p className="font-medium">{formatDate(tenant.createdAt)}</p>
          </div>
        </div>

        {tenant.leases && tenant.leases.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold mb-2">Lease History</h2>
            {tenant.leases.map((lease) => (
              <div key={lease.id} className="border rounded p-3 mt-2">
                <p className="font-medium">{lease.room.floor.property.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                </p>
                <p className="text-sm">{formatCurrency(lease.monthlyRentSen)}/month</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <Link href={`/tenants/${tenant.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
