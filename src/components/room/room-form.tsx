'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RoomFormData {
  name: string;
  type: 'master' | 'single' | 'shared';
  beds: number;
  baths: number;
  areaSqft?: number;
  rentAmount: number;
  depositAmount?: number;
}

interface RoomFormProps {
  propertyId: string;
  room?: Partial<RoomFormData & { id: string }>;
  onSuccess?: () => void;
}

const initialData: RoomFormData = {
  name: '',
  type: 'single',
  beds: 1,
  baths: 1,
  rentAmount: 0,
};

export function RoomForm({ propertyId, room, onSuccess }: RoomFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<RoomFormData>({
    ...initialData,
    name: room?.name || '',
    type: (room?.type as RoomFormData['type']) || 'single',
    beds: room?.beds || 1,
    baths: room?.baths || 1,
    areaSqft: room?.areaSqft,
    rentAmount: room?.rentAmount || 0,
    depositAmount: room?.depositAmount,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = room?.id
        ? `/api/v1/rooms/${room.id}`
        : '/api/v1/rooms';
      const method = room?.id ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, propertyId }),
      });

      if (res.ok) {
        onSuccess?.();
        router.refresh();
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof RoomFormData>(field: K, value: RoomFormData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Room Name</label>
        <Input
          value={data.name}
          onChange={e => updateField('name', e.target.value)}
          placeholder="e.g., Master Bedroom"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={data.type}
            onChange={e => updateField('type', e.target.value as RoomFormData['type'])}
          >
            <option value="single">Single</option>
            <option value="master">Master</option>
            <option value="shared">Shared</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Area (sqft)</label>
          <Input
            type="number"
            value={data.areaSqft || ''}
            onChange={e => updateField('areaSqft', parseInt(e.target.value) || undefined)}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Beds</label>
          <Input
            type="number"
            min={1}
            value={data.beds}
            onChange={e => updateField('beds', parseInt(e.target.value) || 1)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Baths</label>
          <Input
            type="number"
            min={1}
            value={data.baths}
            onChange={e => updateField('baths', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Monthly Rent (RM)</label>
          <Input
            type="number"
            step={0.01}
            min={0}
            value={data.rentAmount}
            onChange={e => updateField('rentAmount', parseFloat(e.target.value) || 0)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deposit (RM)</label>
          <Input
            type="number"
            step={0.01}
            min={0}
            value={data.depositAmount || ''}
            onChange={e => updateField('depositAmount', parseFloat(e.target.value) || undefined)}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : room?.id ? 'Update Room' : 'Create Room'}
        </Button>
      </div>
    </form>
  );
}