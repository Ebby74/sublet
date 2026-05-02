import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { whatsappService } from '@/services/whatsapp-service';
import { z } from 'zod';

const whatsappBroadcastSchema = z.object({
  propertyId: z.string().uuid(),
  tenantIds: z.array(z.string().uuid()).optional(),
});

/**
 * POST /api/v1/marketing/whatsapp
 * Send a WhatsApp broadcast to interested tenants for a vacant property
 */
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { propertyId, tenantIds } = whatsappBroadcastSchema.parse(body);

  // Get property (must belong to user)
  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId },
    include: {
      floors: {
        include: {
          rooms: {
            where: { status: 'active', deletedAt: null },
            select: { rentSen: true },
          },
        },
      },
    },
  });

  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  // Check if property has vacant rooms
  const allRooms = property.floors.flatMap(f => f.rooms);
  if (allRooms.length === 0) {
    return NextResponse.json(
      { error: 'No active rooms found for this property' },
      { status: 400 }
    );
  }

  // Use lowest room rent for the listing
  const minRentSen = Math.min(...allRooms.map(r => r.rentSen));

  // Prepare property data for the service
  const propertyData = {
    id: property.id,
    name: property.name,
    address: property.address,
    rentAmountSen: minRentSen,
    type: property.type,
  };

  // Call WhatsApp service to broadcast
  const result = await whatsappService.broadcastToTenants(
    userId,
    propertyData,
    tenantIds
  );

  return NextResponse.json({
    success: result.success,
    sentCount: result.sentCount,
    failedCount: result.failedCount,
    errors: result.errors,
  });
}