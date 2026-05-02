'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, MapPin } from 'lucide-react';
import { senToRinggit } from '@/lib/format';
import { Button } from '@/components/ui/button';

interface Room {
  id: string;
  name: string;
  rentSen: number;
  status: string;
  beds: number;
  baths: number;
}

interface Floor {
  id: string;
  name: string;
  level: number;
  rooms: Room[];
}

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  floors: Floor[];
}

function RoomItem({ room }: { room: Room }) {
  const statusColors: Record<string, string> = {
    rented: 'bg-green-500',
    active: 'bg-blue-500',
    draft: 'bg-gray-400',
    maintenance: 'bg-yellow-500',
  };

  return (
    <div className="flex items-center justify-between p-2 rounded hover:bg-accent transition-colors">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColors[room.status] || 'bg-gray-300'}`} />
        <span className="text-sm">{room.name}</span>
      </div>
      <div className="text-right">
        <span className="text-sm font-medium">RM {senToRinggit(room.rentSen)}</span>
      </div>
    </div>
  );
}

function PropertyItem({ property }: { property: Property }) {
  const [expanded, setExpanded] = useState(true);
  const totalRooms = property.floors.reduce((sum, f) => sum + f.rooms.length, 0);
  const vacantRooms = property.floors.reduce(
    (sum, f) => sum + f.rooms.filter(r => r.status !== 'rented').length,
    0
  );

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <div>
            <h3 className="font-semibold">{property.name}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {property.address}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <p className="font-medium">{totalRooms} rooms</p>
            <p className="text-xs text-red-500">{vacantRooms} vacant</p>
          </div>
          <span className="text-muted-foreground">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && (
        <div className="border-t p-4 space-y-2">
          {property.floors.map(floor => (
            <div key={floor.id} className="border-l-2 border-muted ml-2 pl-3">
              <p className="text-sm font-medium text-muted-foreground mb-1">{floor.name}</p>
              {floor.rooms.length === 0 ? (
                <p className="text-xs text-muted-foreground ml-3">No rooms</p>
              ) : (
                floor.rooms.map(room => (
                  <Link
                    key={room.id}
                    href={`/properties/${property.id}/rooms/${room.id}`}
                    className="block"
                  >
                    <RoomItem room={room} />
                  </Link>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch('/api/properties/hierarchy');
        const data = await res.json();
        setProperties(data.data || []);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="container py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-sm text-muted-foreground">Property → Floor → Room hierarchy</p>
        </div>
        <Link href="/properties/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Properties Yet</h3>
          <p className="text-muted-foreground mb-4">Add your first property to get started</p>
          <Link
            href="/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Property
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map(property => (
            <PropertyItem key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}