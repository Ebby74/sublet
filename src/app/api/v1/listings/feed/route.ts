import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/v1/listings/feed
 * Get vacant property listings as JSON feed for external websites
 * 
 * Query params:
 *   - user_id: The user ID to get listings for (required)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json(
      { error: 'user_id parameter required' },
      { status: 400 }
    );
  }

  // Get user for contact info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  // Get vacant properties with rooms
  const properties = await prisma.property.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    include: {
      floors: {
        include: {
          rooms: {
            where: { status: 'active', deletedAt: null },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Filter to properties with active rooms and get min rent
  const listings = properties
    .filter(p => p.floors.some(f => f.rooms.length > 0))
    .map((property) => {
      const allRooms = property.floors.flatMap(f => f.rooms);
      const minRentSen = allRooms.length > 0 ? Math.min(...allRooms.map(r => r.rentSen)) : 0;
      return {
        id: property.id,
        name: property.name,
        address: property.address,
        type: property.type,
        rent: {
          amount: minRentSen / 100,
          currency: 'MYR',
          formatted: new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR',
            minimumFractionDigits: 0,
          }).format(minRentSen / 100),
        },
        contact: {
          email: user.email,
          owner: user.name,
        },
        listed_at: property.createdAt.toISOString(),
        updated_at: property.updatedAt.toISOString(),
        url: `/properties/${property.id}`,
      };
    });

  // Add metadata
  const feed = {
    version: '1.0',
    generated_at: new Date().toISOString(),
    count: listings.length,
    user: userId,
    listings,
  };

  return NextResponse.json(feed, {
    headers: {
      'Cache-Control': 'public, max-age=300', // 5 min cache
      'Access-Control-Allow-Origin': '*',
    },
  });
}
