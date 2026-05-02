import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { senToRinggit } from '@/lib/format';

async function getRoomWithDetails(roomId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      floor: {
        include: {
          property: true,
        },
      },
      leases: {
        where: { status: 'active' },
        include: { tenant: true },
      },
    },
  });
  return room;
}

async function getRoomPayments(roomId: string) {
  return prisma.payment.findMany({
    where: { roomId, deletedAt: null },
    orderBy: { paidAt: 'desc' },
  });
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>;
}) {
  const { id: propertyId, roomId } = await params;
  const room = await getRoomWithDetails(roomId);
  
  if (!room || room.floor.propertyId !== propertyId) {
    notFound();
  }

  const payments = await getRoomPayments(roomId);
  const activeLease = room.leases[0];
  const vacancyDays = room.vacantSince
    ? Math.floor((Date.now() - new Date(room.vacantSince).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const income = payments
    .filter(p => p.type === 'income' && p.status === 'paid')
    .reduce((sum, p) => sum + p.amountSen, 0);
  const expenses = payments
    .filter(p => p.type === 'expense' && p.status === 'paid')
    .reduce((sum, p) => sum + p.amountSen, 0);
  const netProfit = income - expenses - (room.maintenanceCostSen ?? 0);

  return (
    <div className="container py-6 space-y-6">
      <Link href={`/properties/${propertyId}`} className="text-sm text-muted-foreground hover:underline">
        ← Back to {room.floor.property.name}
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{room.floor.property.name} → {room.floor.name}</p>
          <h1 className="text-2xl font-bold">{room.name}</h1>
          <p className="text-muted-foreground">
            {room.beds} bed, {room.baths} bath {room.areaSqft ? `• ${room.areaSqft} sqft` : ''}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          room.status === 'rented' ? 'bg-green-100 text-green-700' :
          room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {room.status}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Monthly Rent</p>
          <p className="text-xl font-bold">RM {senToRinggit(room.rentSen)}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Income</p>
          <p className="text-xl font-bold text-green-600">RM {senToRinggit(income)}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Expenses</p>
          <p className="text-xl font-bold text-red-600">RM {senToRinggit(expenses)}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Net Profit</p>
          <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            RM {senToRinggit(netProfit)}
          </p>
        </div>
      </div>

      {activeLease && (
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <h3 className="font-medium text-green-700 mb-2">Current Tenant</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{activeLease.tenant.name}</p>
              <p className="text-sm text-green-600">{activeLease.tenant.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600">Lease ends</p>
              <p className="font-medium">{new Date(activeLease.endDate).toLocaleDateString('en-MY')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Payment History</h2>
        </div>
        {payments.length === 0 ? (
          <p className="p-4 text-center text-muted-foreground">No payments recorded</p>
        ) : (
          <div className="divide-y">
            {payments.map(payment => (
              <div key={payment.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{payment.description || 'Payment'}</p>
                  <p className="text-xs text-muted-foreground">
                    {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-MY') : 'Pending'}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${payment.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {payment.type === 'income' ? '+' : '-'} RM {senToRinggit(payment.amountSen)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}