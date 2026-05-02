import { getPropertyFinancials } from '@/services/financial-service';
import { getPropertyWithHierarchy } from '@/services/floor-service';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { senToRinggit } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { MapPin, Home, Plus, AlertCircle } from 'lucide-react';

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyWithHierarchy(id);
  
  if (!property) {
    notFound();
  }

  const financials = await getPropertyFinancials(id);
  const amenities = property.amenities ? JSON.parse(property.amenities) : [];

  const vacantFloors = property.floors.filter(f => 
    f.rooms.every(r => r.status !== 'rented')
  );

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/properties" className="text-sm text-muted-foreground hover:underline mb-2 inline-block">
            ← Back to Properties
          </Link>
          <h1 className="text-2xl font-bold">{property.name}</h1>
          <p className="text-muted-foreground flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {property.address}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Property</Button>
          <Link href={`/properties/${id}/floors/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Add Floor
            </Button>
          </Link>
        </div>
      </div>

      {amenities.length > 0 && (
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-medium mb-2">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {amenities.map((a: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {financials && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total Rooms</p>
            <p className="text-2xl font-bold">{financials.summary.totalRooms}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Occupied</p>
            <p className="text-2xl font-bold text-green-600">{financials.summary.occupiedRooms}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Vacant</p>
            <p className="text-2xl font-bold text-red-500">{financials.summary.vacantRooms}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Potential Rent</p>
            <p className="text-2xl font-bold">RM {senToRinggit(financials.summary.totalPotentialRentSen)}</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <p className="text-sm text-green-600">Total Income</p>
            <p className="text-2xl font-bold text-green-700">RM {senToRinggit(financials.summary.totalIncomeSen)}</p>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-sm text-red-600">Total Expenses</p>
            <p className="text-2xl font-bold text-red-700">RM {senToRinggit(financials.summary.totalExpensesSen)}</p>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <p className="text-sm text-blue-600">Net Profit</p>
            <p className="text-2xl font-bold text-blue-700">RM {senToRinggit(financials.summary.netProfitSen)}</p>
          </div>
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <p className="text-sm text-amber-600">Zakat (2.5%)</p>
            <p className="text-2xl font-bold text-amber-700">RM {senToRinggit(financials.summary.zakatSen)}</p>
          </div>
        </div>
      )}

      {vacantFloors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-700">Vacant Floors</h3>
            <p className="text-sm text-red-600">
              {vacantFloors.map(f => f.name).join(', ')} have no occupied rooms
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {property.floors.map(floor => (
          <div key={floor.id} className="bg-card rounded-lg border">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">{floor.name}</h2>
                <span className="text-sm text-muted-foreground">({floor.rooms.length} rooms)</span>
              </div>
              <Link href={`/properties/${id}/floors/${floor.id}/rooms/new`}>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Room
                </Button>
              </Link>
            </div>
            <div className="p-4">
              {floor.rooms.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No rooms yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {floor.rooms.map(room => {
                    const roomFin = financials?.floors
                      .flatMap(f => f.rooms)
                      .find(r => r.roomId === room.id);
                    
                    return (
                      <Link
                        key={room.id}
                        href={`/properties/${id}/rooms/${room.id}`}
                        className="p-4 border rounded-lg hover:border-primary transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{room.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            room.status === 'rented' ? 'bg-green-100 text-green-700' :
                            room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {room.status}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-primary">
                          RM {senToRinggit(room.rentSen)}/mo
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {room.beds} bed, {room.baths} bath {room.areaSqft ? `• ${room.areaSqft} sqft` : ''}
                        </p>
                        {roomFin && (
                          <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                            Income: RM {senToRinggit(roomFin.totalIncomeSen)} | 
                            Profit: RM {senToRinggit(roomFin.netProfitSen)}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}