import { getPublicRooms } from '@/services/room-service';
import Link from 'next/link';

export const revalidate = 60;

export default async function RoomsPage() {
  const rooms = await getPublicRooms();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Room Listings</h1>
        <p className="text-gray-600 mb-8">Find your perfect room in Malaysia</p>

        {rooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No rooms available right now.</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden block"
              >
                <div className="h-48 bg-blue-100 flex items-center justify-center">
                  {room.photos ? (
                    <img
                      src={JSON.parse(room.photos)[0]}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">🏠</span>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-lg">{room.name}</h2>
                  <p className="text-gray-600 text-sm">{typeof room.floor === 'object' && room.floor.property ? room.floor.property.name : 'Contact for location'}</p>
                  <p className="text-blue-600 font-bold mt-2">
                    RM {room.rentSen / 100}/month
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">
                    <span>{room.beds} bed</span>
                    <span>•</span>
                    <span>{room.baths} bath</span>
                    {room.areaSqft && (
                      <>
                        <span>•</span>
                        <span>{room.areaSqft} sqft</span>
                      </>
                    )}
                    {room.floor && (
                      <>
                        <span>•</span>
                        <span>Floor {(room.floor as { level: number }).level}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-green-600 mt-2">Click to inquire about this room</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}