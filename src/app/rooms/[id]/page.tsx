import { getRoom } from '@/services/room-service';
import { notFound } from 'next/navigation';
import { InquiryForm } from '@/components/prospect/inquiry-form';
import { PostHistoryPanel } from '@/components/ui/post-history-panel';
import { RoomShareButtons } from '@/components/ui/room-share-buttons';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomDetailPage({ params }: PageProps) {
  const { id } = await params;
  const room = await getRoom(id);

  if (!room) {
    notFound();
  }

  const photos = room.photos ? JSON.parse(room.photos) : [];
  const mainPhoto = photos[0] || '/amr-logo.jpg';
  const roomUrl = `https://sublet-zeta.vercel.app/rooms/${id}`;
  const shareTitle = `${room.name} - ${room.floor?.property?.name || 'AMR Home Solutions'} - RM ${room.rentSen / 100}/month`;

  const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-700',
    listed: 'bg-yellow-100 text-yellow-700',
    rented: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-orange-100 text-orange-700',
    draft: 'bg-gray-100 text-gray-700',
  };

  const statusLabels: Record<string, string> = {
    available: 'Available',
    listed: 'Listed',
    rented: 'Rented',
    maintenance: 'Maintenance',
    draft: 'Draft',
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Room Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{room.name}</h1>
              <p className="text-gray-600">
                {room.floor?.property?.name || 'AMR Home Solutions'} - Contact for exact location
              </p>
              <p className="text-blue-600 text-xl font-bold mt-2">
                RM {room.rentSen / 100}/month
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[room.status] || statusColors.draft}`}>
                {statusLabels[room.status] || room.status}
              </span>
              <RoomShareButtons url={roomUrl} title={shareTitle} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-lg mb-4">Room Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Bedrooms</span>
                <span className="font-medium">{room.beds}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bathrooms</span>
                <span className="font-medium">{room.baths}</span>
              </div>
              {room.areaSqft && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Area</span>
                  <span className="font-medium">{room.areaSqft} sqft</span>
                </div>
              )}
              {room.floor && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Floor</span>
                  <span className="font-medium">Floor {(room.floor as { level: number }).level}</span>
                </div>
              )}
              {room.depositSen && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Deposit</span>
                  <span className="font-medium">RM {room.depositSen / 100}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {room.descriptionV2 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{room.descriptionV2}</p>
              </div>
            )}
          </div>

          {/* Inquiry Form */}
          <div>
            <InquiryForm roomId={id} source="website" />
          </div>

          {/* Post History */}
          <div className="lg:col-span-2">
            <PostHistoryPanel roomId={id} />
          </div>
        </div>
      </div>
    </main>
  );
}