import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';

interface PropertyCardProps {
  property: {
    id: string;
    name: string;
    address: string;
    type: string;
    rentAmountSen: number;
    status: string;
  };
}

const statusColors = {
  vacant: 'bg-yellow-100 text-yellow-800',
  occupied: 'bg-green-100 text-green-800',
  maintenance: 'bg-red-100 text-red-800',
  'under-renovation': 'bg-red-100 text-red-800',
  'listed-for-sale': 'bg-blue-100 text-blue-800',
};

export function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter();
  const statusClass = statusColors[property.status as keyof typeof statusColors] ?? 'bg-gray-100';

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{property.name}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusClass}`}>
          {property.status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{property.address}</p>
      <p className="text-sm text-muted-foreground mb-4">{property.type}</p>
      <div className="flex justify-between items-center">
        <span className="font-medium">{formatCurrency(property.rentAmountSen)}/month</span>
        <Button variant="outline" size="sm" onClick={() => router.push(`/properties/${property.id}`)}>
          View
        </Button>
      </div>
    </div>
  );
}