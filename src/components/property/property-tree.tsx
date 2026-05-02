'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, ChevronRight, Home, Plus, MapPin } from 'lucide-react';
import { senToRinggit } from '@/lib/format';

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

interface PropertyTreeProps {
  properties: Property[];
}

function RoomItem({ room }: { room: Room }) {
  const statusColors: Record<string, string> = {
    rented: 'bg-green-100 text-green-700',
    active: 'bg-blue-100 text-blue-700',
    draft: 'bg-gray-100 text-gray-600',
    maintenance: 'bg-yellow-100 text-yellow-700',
    vacant: 'bg-red-100 text-red-700',
  };

  return (
    <Link
      href={`/properties/rooms/${room.id}`}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${statusColors[room.status] || 'bg-gray-300'}`} />
        <div>
          <p className="font-medium text-sm">{room.name}</p>
          <p className="text-xs text-muted-foreground">{room.beds} bed, {room.baths} bath</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-sm">RM {senToRinggit(room.rentSen)}</p>
        <p className="text-xs text-muted-foreground capitalize">{room.status}</p>
      </div>
    </Link>
  );
}

function FloorItem({ floor, propertyId }: { floor: Floor; propertyId: string }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-l-2 border-muted ml-4 pl-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 py-2 w-full hover:bg-accent rounded-lg px-2"
      >
        <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        <Home className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">{floor.name}</span>
        <span className="text-xs text-muted-foreground ml-auto">({floor.rooms.length} rooms)</span>
      </button>
      {expanded && (
        <div className="space-y-1 mt-1">
          {floor.rooms.map(room => (
            <RoomItem key={room.id} room={room} />
          ))}
        </div>
      )}
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
          <ChevronRight className={`h-5 w-5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </div>
      {expanded && (
        <div className="border-t p-4 space-y-3">
          {property.floors.map(floor => (
            <FloorItem key={floor.id} floor={floor} propertyId={property.id} />
          ))}
          <Link
            href={`/properties/${property.id}/floors/new`}
            className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed rounded-lg text-muted-foreground hover:text-primary hover:border-primary transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Floor
          </Link>
        </div>
      )}
    </div>
  );
}

export function PropertyTree({ properties }: PropertyTreeProps) {
  if (properties.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
      {properties.map(property => (
        <PropertyItem key={property.id} property={property} />
      ))}
    </div>
  );
}