'use client';

import Link from 'next/link';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';

interface RoomCardProps {
  room: {
    id: string;
    name: string;
    type: string;
    beds: number;
    baths: number;
    areaSqft: number | null;
    rentSen: number;
    status: string;
    photos: string | null;
  };
  propertyId: string;
  onStatusChange?: (roomId: string, status: string) => void;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  available: 'bg-green-100 text-green-700',
  listed: 'bg-yellow-100 text-yellow-700',
  rented: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-orange-100 text-orange-700',
};

export function RoomCard({ room, propertyId, onStatusChange }: RoomCardProps) {
  const photos = room.photos ? JSON.parse(room.photos) : [];
  const mainPhoto = photos[0];

  return (
    <div className="border rounded-lg p-4 bg-card">
      {mainPhoto && (
        <div className="relative h-32 rounded-lg overflow-hidden mb-3">
          <img src={mainPhoto} alt={room.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{room.name}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[room.status] || statusColors.draft}`}>
          {room.status === 'available' ? 'Available' : room.status === 'listed' ? 'Listed' : room.status === 'rented' ? 'Rented' : room.status === 'maintenance' ? 'Maintenance' : 'Draft'}
        </span>
      </div>

      <div className="text-sm text-muted-foreground mb-1">
        {room.type} • {room.beds} bed • {room.baths} bath
        {room.areaSqft && ` • ${room.areaSqft} sqft`}
      </div>

      <p className="font-semibold text-lg mb-3">{formatCurrency(room.rentSen)}/mo</p>

      <div className="flex gap-2">
        <Link href={`/properties/${propertyId}/rooms/${room.id}`}>
          <Button variant="outline" size="sm">View</Button>
        </Link>
        <Link href={`/properties/${propertyId}/rooms/${room.id}/edit`}>
          <Button variant="ghost" size="sm">Edit</Button>
        </Link>
        {room.status === 'draft' && onStatusChange && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(room.id, 'available')}
          >
            Make Available
          </Button>
        )}
        {room.status === 'available' && onStatusChange && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(room.id, 'draft')}
          >
            Hide
          </Button>
        )}
      </div>
    </div>
  );
}