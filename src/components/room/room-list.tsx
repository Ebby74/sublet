'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RoomCard } from './room-card';
import { Button } from '@/components/ui/button';

interface Room {
  id: string;
  name: string;
  type: string;
  beds: number;
  baths: number;
  areaSqft: number | null;
  rentSen: number;
  status: string;
  photos: string | null;
}

interface RoomListProps {
  propertyId: string;
  initialRooms?: Room[];
}

export function RoomList({ propertyId, initialRooms = [] }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [isLoading, setIsLoading] = useState(!initialRooms.length);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch(`/api/v1/rooms?propertyId=${propertyId}`);
        const data = await res.json();
        if (data.data) {
          setRooms(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (!initialRooms.length) {
      fetchRooms();
    }
  }, [propertyId, initialRooms.length]);

  const handleStatusChange = async (roomId: string, status: string) => {
    try {
      const res = await fetch(`/api/v1/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRooms(rooms.map(r => r.id === roomId ? { ...r, status } : r));
      }
    } catch (error) {
      console.error('Status change failed:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading rooms...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Rooms ({rooms.length})</h2>
        <Link href={`/properties/${propertyId}/rooms/new`}>
          <Button>Add Room</Button>
        </Link>
      </div>

      {rooms.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
          No rooms yet. Add your first room to start renting.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              propertyId={propertyId}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}