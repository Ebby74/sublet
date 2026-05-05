'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Wrench, UserMinus } from 'lucide-react';

interface RoomStatusActionsProps {
  roomId: string;
  status: string;
  onStatusChange?: (newStatus: string) => void;
}

export function RoomStatusActions({ roomId, status, onStatusChange }: RoomStatusActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update status');
      }

      onStatusChange?.(newStatus);
    } catch (error) {
      console.error('Error updating room status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {status === 'draft' && (
        <Button
          variant="default"
          size="sm"
          disabled={loading}
          onClick={() => handleStatusChange('available')}
        >
          <Upload className="h-3.5 w-3.5 mr-1" />
          Publish
        </Button>
      )}
      {status === 'maintenance' && (
        <Button
          variant="default"
          size="sm"
          disabled={loading}
          onClick={() => handleStatusChange('available')}
        >
          <Upload className="h-3.5 w-3.5 mr-1" />
          Publish
        </Button>
      )}
      {status === 'available' && (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => handleStatusChange('maintenance')}
        >
          <Wrench className="h-3.5 w-3.5 mr-1" />
          Mark Maintenance
        </Button>
      )}
      {status === 'rented' && (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => handleStatusChange('maintenance')}
        >
          <UserMinus className="h-3.5 w-3.5 mr-1" />
          Tenant Moved Out
        </Button>
      )}
    </div>
  );
}
