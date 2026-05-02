import { formatDate } from '@/lib/format';

interface Lease {
  id: string;
  property: { name: string };
  tenant: { name: string };
  startDate: Date;
  endDate: Date;
  monthlyRentSen: number;
  status: string;
}

interface LeaseTimelineProps {
  leases: Lease[];
  currentLease?: Lease;
}

export function LeaseTimeline({ leases, currentLease }: LeaseTimelineProps) {
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  return (
    <div className="space-y-4">
      {/* Current/Active Lease */}
      {currentLease && (
        <div className="border rounded-lg p-4 bg-green-50">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{currentLease.property.name}</h3>
              <p className="text-sm text-muted-foreground">
                Tenant: {currentLease.tenant.name}
              </p>
            </div>
            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 font-medium">
              Active
            </span>
          </div>
          <div className="mt-2 text-sm">
            {formatDate(currentLease.startDate)} - {formatDate(currentLease.endDate)}
          </div>
        </div>
      )}

      {/* Expiring Soon */}
      {leases.filter((l) => l.status === 'active' && new Date(l.endDate) <= thirtyDaysFromNow).length > 0 && (
        <div className="border rounded-lg p-4 bg-yellow-50">
          <h3 className="font-semibold mb-2">Expiring Soon</h3>
          {leases
            .filter((l) => l.status === 'active' && new Date(l.endDate) <= thirtyDaysFromNow)
            .map((lease) => (
              <div key={lease.id} className="text-sm mt-2">
                <span className="font-medium">{lease.property.name}</span>
                <span className="text-muted-foreground"> expires {formatDate(lease.endDate)}</span>
              </div>
            ))}
        </div>
      )}

      {/* Lease History */}
      {leases.filter((l) => l.status !== 'active').length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Lease History</h3>
          <div className="space-y-2">
            {leases
              .filter((l) => l.status !== 'active')
              .map((lease) => (
                <div key={lease.id} className="border rounded p-3">
                  <div className="flex justify-between">
                    <span className="font-medium">{lease.property.name}</span>
                    <span className="text-xs px-2 py-1 rounded bg-muted capitalize">
                      {lease.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {lease.tenant.name} • {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}