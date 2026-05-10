import { getPublicRooms } from '@/services/room-service';
import Link from 'next/link';
import { Suspense } from 'react';

export const revalidate = 60;

function RoomCard({ room }: { room: import('@prisma/client').Room & { floor: { level: number; property: { id: string; name: string; address: string } | null } | null } }) {
  const photos = room.photos ? JSON.parse(room.photos) as string[] : [];
  const img = photos[0] || '';
  const propertyName = room.floor?.property?.name || '';
  const address = room.floor?.property?.address || '';
  const locationStr = [propertyName, address].filter(Boolean).join(' — ') || 'Contact for location';

  return (
    <Link
      href={`/rooms/${room.id}`}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-[#FF6600]/30 hover:shadow-xl transition-all duration-300 overflow-hidden block"
    >
      <div className="h-52 bg-slate-100 relative overflow-hidden">
        {img ? (
          <img src={img} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🏠</div>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-white/95 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
            {room.type === 'master' ? 'Master Room' : room.type === 'shared' ? 'Shared Room' : 'Single Room'}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-slate-800 group-hover:text-[#FF6600] transition-colors mb-1">{room.name}</h3>
        <p className="text-sm text-slate-500 mb-3 line-clamp-1">{locationStr}</p>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-2xl font-bold text-[#FF6600]">RM {(room.rentSen / 100).toLocaleString()}</span>
          <span className="text-sm text-slate-500">/month</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span>{room.beds} bed{room.beds > 1 ? 's' : ''}</span>
          <span className="text-slate-300">•</span>
          <span>{room.baths} bath{room.baths > 1 ? 's' : ''}</span>
          {room.areaSqft && (
            <>
              <span className="text-slate-300">•</span>
              <span>{room.areaSqft} sqft</span>
            </>
          )}
          {room.floor && (
            <>
              <span className="text-slate-300">•</span>
              <span>Floor {room.floor.level}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

function RoomCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-52 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-6 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
      </div>
    </div>
  );
}

async function RoomGrid({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  const params = await searchParams;
  const allRooms = await getPublicRooms();

  const rooms = params.location
    ? allRooms.filter(r =>
        r.floor?.property?.name.toLowerCase().includes((params.location ?? '').toLowerCase()) ||
        r.floor?.property?.address.toLowerCase().includes((params.location ?? '').toLowerCase()) ||
        r.name.toLowerCase().includes((params.location ?? '').toLowerCase())
      )
    : allRooms;

  if (rooms.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">🔍</div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">No rooms found</h3>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          {params.location
            ? `No available rooms in that area right now. Check other locations or chat with AIrene for updates.`
            : 'No rooms are currently available. Check back soon or chat with AIrene.'}
        </p>
        <a
          href="/inquiry"
          className="inline-flex items-center gap-2 bg-[#FF6600] hover:bg-[#e55a00] text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat with AIrene
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">{rooms.length} room{rooms.length > 1 ? 's' : ''} available</p>
        {params.location && (
          <Link href="/rooms" className="text-sm text-[#FF6600] hover:underline font-medium">Clear filter</Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room as Parameters<typeof RoomCard>[0]['room']} />
        ))}
      </div>
    </>
  );
}

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-[#FF6600] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Available Rooms</h1>
              <p className="text-slate-500 text-sm mt-1">Fully furnished rooms in KL — Muslim co-living</p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <RoomCardSkeleton key={i} />)}
          </div>
        }>
          <RoomGrid searchParams={searchParams} />
        </Suspense>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-[#FF6600]/5 to-orange-50 rounded-3xl p-8 border border-[#FF6600]/10">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Not sure which room is right for you?</h3>
            <p className="text-slate-500 mb-6">Chat with AIrene — she&apos;ll help you find the perfect room in 2 minutes.</p>
            <a
              href="/inquiry"
              className="inline-flex items-center gap-2 bg-[#FF6600] hover:bg-[#e55a00] text-white font-semibold px-8 py-3 rounded-full transition-all hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat with AIrene
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
