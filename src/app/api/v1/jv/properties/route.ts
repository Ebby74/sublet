import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { withRequestContext } from '@/lib/logger';

/**
 * GET /api/v1/jv/properties
 * Returns list of properties assigned to JV stakeholder
 * Read-only - no create, update, delete operations
 */
export async function GET(request: NextRequest) {
  const log = withRequestContext(request, { route: 'jv/properties' });
  try {
    const user = await getCurrentUser(request);

    if (!user?.userId) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has JV role
    const jvUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true, jvProperties: true },
    });

    if (!jvUser || jvUser.role !== 'jv') {
      return NextResponse.json(
        { data: null, error: 'JV access required' },
        { status: 403 }
      );
    }

    // Parse assigned property IDs from jvProperties JSON
    let assignedPropertyIds: string[] = [];
    if (jvUser.jvProperties) {
      try {
        assignedPropertyIds = JSON.parse(jvUser.jvProperties);
      } catch {
        assignedPropertyIds = [];
      }
    }

    // Get properties where user is the jvStakeholder OR in assigned list
    const properties = await prisma.property.findMany({
      where: {
        OR: [
          { jvStakeholderId: user.userId },
          { id: { in: assignedPropertyIds } },
        ],
        deletedAt: null,
      },
      include: {
        floors: {
          include: {
            rooms: {
              where: { deletedAt: null },
              select: {
                id: true,
                name: true,
                status: true,
                rentSen: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Calculate status for each property
    const propertiesWithStatus = properties.map((property) => {
      const allRooms = property.floors.flatMap(f => f.rooms);
      const vacantRooms = allRooms.filter((r: { status: string }) => r.status === 'draft' || r.status === 'available' || r.status === 'listed');
      const tenantedRooms = allRooms.filter((r: { status: string }) => r.status === 'rented');
      const totalRent = allRooms.reduce((sum: number, r: { rentSen: number }) => sum + r.rentSen, 0);

      return {
        id: property.id,
        name: property.name,
        address: property.address,
        type: property.type,
        status: property.status,
        rentAmountSen: totalRent,
        totalRooms: allRooms.length,
        vacantRooms: vacantRooms.length,
        tenantedRooms: tenantedRooms.length,
        createdAt: property.createdAt,
      };
    });

    return NextResponse.json({
      data: propertiesWithStatus,
      meta: {
        total: propertiesWithStatus.length,
        generatedAt: new Date().toISOString(),
      },
      error: null,
    });
  } catch (error) {
    log.error({ error }, 'Failed to get JV properties');
    return NextResponse.json(
      { data: null, error: 'Failed to get properties' },
      { status: 500 }
    );
  }
}