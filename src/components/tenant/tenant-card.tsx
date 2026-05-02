import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface TenantCardProps {
  tenant: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    icNumber: string | null;
    leases: Array<{ room: { floor: { property: { name: string } } } }>;
  };
}

export function TenantCard({ tenant }: TenantCardProps) {
  const router = useRouter();
  const activeLease = tenant.leases?.[0];

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{tenant.name}</h3>
        {tenant.icNumber && (
          <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary font-medium">
            IC: {tenant.icNumber}
          </span>
        )}
      </div>

      {tenant.phone && (
        <p className="text-sm text-muted-foreground mb-1">📞 {tenant.phone}</p>
      )}
      {tenant.email && (
        <p className="text-sm text-muted-foreground mb-2">✉️ {tenant.email}</p>
      )}

      {activeLease && (
        <p className="text-sm text-muted-foreground mb-4">
          🏠 {activeLease.room.floor.property.name}
        </p>
      )}

      <Button variant="outline" size="sm" onClick={() => router.push(`/tenants/${tenant.id}`)}>
        View
      </Button>
    </div>
  );
}
