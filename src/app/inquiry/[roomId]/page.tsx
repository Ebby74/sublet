import { InquiryForm } from '@/components/prospect/inquiry-form';
import { getRoom } from '@/services/room-service';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default async function InquiryPage({ params }: PageProps) {
  const { roomId } = await params;
  const room = await getRoom(roomId);

  if (!room) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">{room.name}</h1>
          <p className="text-gray-600">{room.floor.property.name}</p>
          <p className="text-blue-600 font-semibold mt-2">
            RM {room.rentSen / 100}/month
          </p>
        </div>

        <InquiryForm roomId={roomId} source="website" />
      </div>
    </main>
  );
}