import { prisma } from '@/lib/prisma';

export interface CreateLeaseInput {
  roomId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number; // in ringgit
  deposit?: number; // in ringgit (separate, not set-off)
  userId: string;
}

export interface UpdateLeaseInput {
  startDate?: Date;
  endDate?: Date;
  monthlyRent?: number;
  deposit?: number;
  status?: 'active' | 'expired' | 'terminated';
}

// Cron job should run daily to update expired leases
export async function updateExpiredLeases() {
  const now = new Date();
  return prisma.lease.updateMany({
    where: {
      status: 'active',
      endDate: { lt: now },
      deletedAt: null,
    },
    data: { status: 'expired' },
  });
}

export async function createLease(input: CreateLeaseInput) {
  const { ringgitToSen } = await import('@/lib/format');

  return prisma.lease.create({
    data: {
      roomId: input.roomId,
      tenantId: input.tenantId,
      startDate: input.startDate,
      endDate: input.endDate,
      monthlyRentSen: ringgitToSen(input.monthlyRent),
      depositSen: ringgitToSen(input.deposit ?? 0),
      status: 'active',
      userId: input.userId,
    },
  });
}

export async function getLeases(userId: string, includeDeleted = false) {
  return prisma.lease.findMany({
    where: {
      userId,
      deletedAt: includeDeleted ? undefined : null,
    },
    include: {
      room: {
        include: {
          floor: {
            include: {
              property: { select: { name: true } }
            }
          }
        }
      },
      tenant: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getActiveLeases(userId: string) {
  return prisma.lease.findMany({
    where: {
      userId,
      status: 'active',
      deletedAt: null,
    },
    include: {
      room: {
        include: {
          floor: {
            include: {
              property: { select: { name: true } }
            }
          }
        }
      },
      tenant: true,
    },
    orderBy: { endDate: 'asc' },
  });
}

export async function getLease(id: string) {
  return prisma.lease.findUnique({
    where: { id },
    include: {
      room: {
        include: {
          floor: {
            include: {
              property: { select: { name: true } }
            }
          }
        }
      },
      tenant: true,
      payments: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function updateLease(id: string, input: UpdateLeaseInput) {
  const data: Record<string, unknown> = { ...input }
  if (input.monthlyRent !== undefined) {
    data.monthlyRentSen = (await import('@/lib/format')).ringgitToSen(input.monthlyRent);
    delete data.monthlyRent;
  }
  if (input.deposit !== undefined) {
    data.depositSen = (await import('@/lib/format')).ringgitToSen(input.deposit);
    delete data.deposit;
  }
  return prisma.lease.update({
    where: { id },
    data,
  });
}

export async function extendLease(id: string, newEndDate: Date) {
  return prisma.lease.update({
    where: { id },
    data: {
      endDate: newEndDate,
      status: 'active',
    },
  });
}

export async function terminateLease(id: string) {
  return prisma.lease.update({
    where: { id },
    data: { status: 'terminated' },
  });
}

export async function getLeasesExpiringSoon(userId: string, days = 60) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return prisma.lease.findMany({
    where: {
      userId,
      status: 'active',
      endDate: {
        lte: futureDate,
        gte: new Date(),
      },
      deletedAt: null,
    },
    include: {
      room: {
        include: {
          floor: {
            include: {
              property: { select: { id: true, name: true, address: true } }
            }
          }
        }
      },
      tenant: true,
    },
    orderBy: { endDate: 'asc' },
  });
}

export async function getLeaseHistory(propertyId: string) {
  return prisma.lease.findMany({
    where: {
      room: { floor: { propertyId } },
      deletedAt: null,
    },
    include: {
      tenant: true,
    },
    orderBy: { startDate: 'desc' },
  });
}