import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/v1/listings/rss
 * Get vacant property listings as RSS 2.0 feed
 * 
 * Query params:
 *   - user_id: The user ID to get listings for (required)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><error>user_id parameter required</error>',
      { status: 400, headers: { 'Content-Type': 'application/xml' } }
    );
  }

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) {
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><error>User not found</error>',
      { status: 404, headers: { 'Content-Type': 'application/xml' } }
    );
  }

  // Get properties with active rooms
  const properties = await prisma.property.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    include: {
      floors: {
        include: {
          rooms: {
            where: { status: { in: ['available', 'rented', 'maintenance'] }, deletedAt: null },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const siteTitle = user.name ? `${user.name}'s Properties` : 'Vacant Property Listings';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sublet.example.com';

  // Build RSS XML
  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <description>Vacant property listings available for rent</description>
    <link>${escapeXml(appUrl)}</link>
    <atom:link href="${escapeXml(request.url)}" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <language>en-my</language>
`;

  for (const property of properties) {
    const allRooms = property.floors.flatMap(f => f.rooms);
    const minRentSen = allRooms.length > 0 ? Math.min(...allRooms.map(r => r.rentSen)) : 0;
    const rentFormatted = new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
    }).format(minRentSen / 100);

    const title = `${property.name} - ${rentFormatted}/month`;
    const description = `${property.type} • ${property.address}`;

    rss += `
    <item>
      <title>${escapeXml(title)}</title>
      <description>${escapeXml(description)}</description>
      <link>${escapeXml(`${appUrl}/properties/${property.id}`)}</link>
      <guid isPermaLink="true">${escapeXml(`${appUrl}/properties/${property.id}`)}</guid>
      <pubDate>${new Date(property.createdAt).toUTCString()}</pubDate>
    </item>
`;
  }

  rss += `
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
