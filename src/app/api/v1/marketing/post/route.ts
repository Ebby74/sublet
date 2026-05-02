import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { socialPostingService } from '@/services/social-posting-service';
import { z } from 'zod';

const postSchema = z.object({
  propertyId: z.string().uuid(),
  platforms: z.array(z.enum(['instagram', 'facebook'])).optional(),
});

/**
 * POST /api/v1/marketing/post
 * Post a vacant property to social media channels
 */
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { propertyId, platforms } = postSchema.parse(body);

  // Get property
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

  // Check if property has active rooms
  const allRooms = property.floors.flatMap(f => f.rooms);
  if (allRooms.length === 0) {
    return NextResponse.json(
      { error: 'No active rooms found for this property' },
      { status: 400 }
    );
  }

  const minRentSen = Math.min(...allRooms.map(r => r.rentSen));

  const propertyData = {
    id: property.id,
    name: property.name,
    address: property.address,
    rentAmountSen: minRentSen,
    description: property.type,
    type: property.type,
  };

  // Determine which platforms to post to
  const platformsToPost = platforms || ['instagram', 'facebook'];
  const results = [];

  for (const platform of platformsToPost) {
    if (platform === 'instagram') {
      const result = await socialPostingService.postToInstagram(userId, propertyData);
      results.push(result);
    } else if (platform === 'facebook') {
      const result = await socialPostingService.postToFacebook(userId, propertyData);
      results.push(result);
    }
  }

  const allSuccess = results.every((r) => r.success);

  return NextResponse.json({
    success: allSuccess,
    results: results,
  });
}
