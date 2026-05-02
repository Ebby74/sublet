import { NextRequest, NextResponse } from 'next/server';
import { getPropertyWithHierarchy, getAllPropertiesWithHierarchy } from '@/services/floor-service';
import { getCurrentUser } from '@/services/auth-service';
import { withRequestContext } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const log = withRequestContext(request, { route: 'properties/hierarchy' });
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (propertyId) {
      const property = await getPropertyWithHierarchy(propertyId);
      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }
      return NextResponse.json({ data: property });
    }

    const properties = await getAllPropertiesWithHierarchy(user.id);
    return NextResponse.json({ data: properties });
  } catch (error) {
    log.error({ error }, 'Get property hierarchy error');
    return NextResponse.json({ error: 'Failed to get properties' }, { status: 500 });
  }
}