'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Upload, MapPin, Train, ChevronDown, ChevronRight } from 'lucide-react';

interface FloorData {
  id: string;
  name: string;
  level: number;
  rooms: RoomData[];
}

interface RoomData {
  name: string;
  rentSen: number;
  beds: number;
  baths: number;
  areaSqft: number;
  photos: string[];
  type: string;
  status: string;
}

interface PropertyFormProps {
  userId?: string;
  property?: {
    id: string;
    name: string;
    address: string;
    type: string;
  };
}

const LRT_STATIONS = [
  { id: 'lrt-damai', name: 'LRT Damai (5 min walk)' },
  { id: 'lrt-cahaya', name: 'LRT Cahaya (5 min walk)' },
  { id: 'lrt-pandan-jaya', name: 'LRT Pandan Jaya (3 min walk)' },
  { id: 'lrt-pandan-indah', name: 'LRT Pandan Indah (5 min walk)' },
  { id: 'mrt-taman-permai', name: 'MRT Taman Permai (10 min walk)' },
  { id: 'mrt-maluri', name: 'MRT Maluri (12 min walk)' },
];

const AMENITIES_OPTIONS = [
  'Air-Cond', 'Water Heater', 'WiFi', 'Parking', 'Furnished',
  'Washing Machine', 'Refrigerator', 'TV', 'Kitchen', '24hr Security',
  'Gym', 'Pool', 'Balcony', 'Close to LRT/MRT'
];

export function PropertyForm({ userId, property }: PropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [nearestLrt, setNearestLrt] = useState('');
  const [mapUrl, setMapUrl] = useState('');

  const [formData, setFormData] = useState({
    name: property?.name ?? '',
    address: property?.address ?? '',
    type: property?.type ?? 'apartment',
    amenities: [] as string[],
  });

  const [newFloorName, setNewFloorName] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set());

  const [newRoom, setNewRoom] = useState<RoomData>({
    name: '',
    rentSen: 0,
    beds: 1,
    baths: 1,
    areaSqft: 0,
    photos: [],
    type: 'single',
    status: 'draft',
  });

  useEffect(() => {
    if (formData.address) {
      const encodedAddress = encodeURIComponent(formData.address + ', Malaysia');
      setMapUrl(`https://www.google.com/maps?q=${encodedAddress}&output=embed`);
    }
  }, [formData.address]);

  const toggleFloorExpanded = (floorId: string) => {
    const newExpanded = new Set(expandedFloors);
    if (newExpanded.has(floorId)) {
      newExpanded.delete(floorId);
    } else {
      newExpanded.add(floorId);
    }
    setExpandedFloors(newExpanded);
  };

  const handleAddFloor = () => {
    if (!newFloorName.trim()) return;

    const level = floors.length;
    const floorId = `temp-${Date.now()}`;

    setFloors([...floors, {
      id: floorId,
      name: newFloorName,
      level,
      rooms: [],
    }]);
    setNewFloorName('');
    setSelectedFloor(floorId);
    setExpandedFloors(new Set([...expandedFloors, floorId]));
  };

  const handleAddRoom = () => {
    if (!selectedFloor || !newRoom.name || newRoom.rentSen <= 0) return;

    setFloors(floors.map(floor => {
      if (floor.id === selectedFloor) {
        return {
          ...floor,
          rooms: [...floor.rooms, { ...newRoom }],
        };
      }
      return floor;
    }));

    setNewRoom({
      name: '',
      rentSen: 0,
      beds: 1,
      baths: 1,
      areaSqft: 0,
      photos: [],
      type: 'single',
      status: 'draft',
    });
  };

  const handleRemoveRoom = (floorId: string, roomIndex: number) => {
    setFloors(floors.map(floor => {
      if (floor.id === floorId) {
        return {
          ...floor,
          rooms: floor.rooms.filter((_, i) => i !== roomIndex),
        };
      }
      return floor;
    }));
  };

  const handleRemoveFloor = (floorId: string) => {
    setFloors(floors.filter(f => f.id !== floorId));
    if (selectedFloor === floorId) setSelectedFloor(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewRoom({ ...newRoom, photos: [...newRoom.photos, reader.result as string] });
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenity) });
    } else {
      setFormData({ ...formData, amenities: [...formData.amenities, amenity] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = property ? 'PUT' : 'POST';
      const propUrl = property ? `/api/v1/properties/${property.id}` : '/api/v1/properties';

      const propRes = await fetch(propUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          type: formData.type,
          amenities: JSON.stringify(formData.amenities),
        }),
      });

      if (!propRes.ok) throw new Error('Failed to save property');
      const propData = await propRes.json();
      const propertyId = propData.data?.id || property?.id;

      for (const floor of floors) {
        const floorRes = await fetch('/api/floors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId, name: floor.name, level: floor.level }),
        });
        const floorData = await floorRes.json();
        const floorId = floorData.data?.id;

        for (const room of floor.rooms) {
          await fetch('/api/v1/rooms', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(userId ? { 'x-user-id': userId } : {}),
            },
            body: JSON.stringify({
              floorId,
              name: room.name,
              rentSen: room.rentSen * 100,
              beds: room.beds,
              baths: room.baths,
              areaSqft: room.areaSqft,
              photos: JSON.stringify(room.photos),
              type: room.type,
              status: room.status,
            }),
          });
        }
      }

      router.push(`/properties/${propertyId}`);
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const totalRooms = floors.reduce((sum, f) => sum + f.rooms.length, 0);
  const totalRent = floors.reduce((sum, f) => sum + f.rooms.reduce((rs, r) => rs + r.rentSen, 0), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-none">
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Property Details</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Property Name *</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Keramat LK10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Full address with postcode"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                <Train className="w-4 h-4 inline mr-1" />
                Nearest LRT/MRT
              </label>
              <select
                value={nearestLrt}
                onChange={(e) => setNearestLrt(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select...</option>
                {LRT_STATIONS.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_OPTIONS.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      formData.amenities.includes(a)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <div className="border rounded-md overflow-hidden h-[300px] bg-muted">
              {formData.address ? (
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Property Location"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Enter address to see location
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Floors & Rooms</h2>
          <div className="text-sm text-muted-foreground">
            {floors.length} floors, {totalRooms} rooms, RM {totalRent.toLocaleString()}/mo potential
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Add Floor</h3>
            <div className="flex gap-2">
              <Input
                value={newFloorName}
                onChange={(e) => setNewFloorName(e.target.value)}
                placeholder="e.g., G Floor, 1st Floor"
              />
              <Button type="button" onClick={handleAddFloor} disabled={!newFloorName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {floors.length > 0 && (
            <div className="lg:col-span-2 border rounded-lg p-4">
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                {floors.map(floor => (
                  <button
                    key={floor.id}
                    type="button"
                    onClick={() => setSelectedFloor(floor.id)}
                    className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                      selectedFloor === floor.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    }`}
                  >
                    {floor.name} ({floor.rooms.length})
                  </button>
                ))}
              </div>

              {floors.map(floor => (
                <div key={floor.id} className="border-t pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleFloorExpanded(floor.id)}
                        className="p-1 hover:bg-accent rounded"
                      >
                        {expandedFloors.has(floor.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <span className="font-medium">{floor.name}</span>
                      <span className="text-xs text-muted-foreground">({floor.rooms.length} rooms)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFloor(floor.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {expandedFloors.has(floor.id) && (
                    <div className="ml-6 space-y-1">
                      {floor.rooms.map((room, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                          <span>{room.name}</span>
                          <span className="text-green-600 font-medium">RM {room.rentSen}/mo</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRoom(floor.id, i)}
                            className="text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedFloor && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-medium mb-3">Add Room to {floors.find(f => f.id === selectedFloor)?.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Room Name *</label>
              <Input
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                placeholder="Master Bedroom"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Rent (RM) *</label>
              <Input
                type="number"
                value={newRoom.rentSen || ''}
                onChange={(e) => setNewRoom({ ...newRoom, rentSen: parseFloat(e.target.value) || 0 })}
                placeholder="800"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Beds</label>
              <select
                value={newRoom.beds}
                onChange={(e) => setNewRoom({ ...newRoom, beds: parseInt(e.target.value) })}
                className="w-full border rounded-md px-3 py-2"
              >
                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Baths</label>
              <select
                value={newRoom.baths}
                onChange={(e) => setNewRoom({ ...newRoom, baths: parseInt(e.target.value) })}
                className="w-full border rounded-md px-3 py-2"
              >
                {[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Size (sqft)</label>
              <Input
                type="number"
                value={newRoom.areaSqft || ''}
                onChange={(e) => setNewRoom({ ...newRoom, areaSqft: parseInt(e.target.value) || 0 })}
                placeholder="200"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Type</label>
              <select
                value={newRoom.type}
                onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="single">Single</option>
                <option value="master">Master</option>
                <option value="shared">Shared</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Status</label>
              <select
                value={newRoom.status}
                onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="draft">Draft</option>
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="rented">Rented</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Photo</label>
              <label className="flex items-center justify-center w-full h-10 border rounded-md cursor-pointer bg-muted hover:bg-accent">
                <Upload className="h-4 w-4 mr-2" />
                <span className="text-sm">Upload</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleAddRoom}
            disabled={!newRoom.name || newRoom.rentSen <= 0}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading || floors.length === 0}>
          {loading ? 'Saving...' : 'Save Property'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}