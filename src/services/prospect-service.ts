import { prisma } from '@/lib/prisma';

export interface CreateProspectInput {
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  utmData?: string;
  roomId?: string;
  userId: string;
}

export interface UpdateProspectInput {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  utmData?: string;
  status?: string;
  roomId?: string;
}

export interface ChatProspectInput {
  name: string;
  phone?: string;
  email?: string;
  requirements?: string;
  source?: string;
  roomId?: string;
  userId?: string;
}

const VALID_STATUSES = [
  'new',
  'contacted',
  'interested',
  'viewing_scheduled',
  'viewed',
  'offer_made',
  'offer_accepted',
  'tenant',
];

export async function createProspect(input: CreateProspectInput) {
  return prisma.prospect.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      source: input.source,
      utmData: input.utmData,
      roomId: input.roomId,
      userId: input.userId,
    },
  });
}

export async function getProspects(userId: string, includeDeleted = false) {
  return prisma.prospect.findMany({
    where: {
      userId,
      deletedAt: includeDeleted ? undefined : null,
    },
    include: {
      room: {
        include: {
          floor: {
            include: {
              property: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProspect(id: string) {
  return prisma.prospect.findUnique({
    where: { id },
    include: {
      room: {
        include: {
          floor: {
            include: {
              property: true,
            },
          },
        },
      },
      viewings: {
        orderBy: { scheduledAt: 'desc' },
      },
      offers: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function updateProspect(id: string, input: UpdateProspectInput) {
  return prisma.prospect.update({
    where: { id },
    data: input,
  });
}

export async function deleteProspect(id: string) {
  return prisma.prospect.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function addProspectNote(
  prospectId: string,
  entry: { type: string; content: string; createdBy: string }
) {
  const prospect = await prisma.prospect.findUnique({
    where: { id: prospectId },
    select: { notes: true },
  });

  const notes: Array<{
    type: string;
    content: string;
    createdBy: string;
    createdAt: string;
  }> = prospect?.notes ? JSON.parse(prospect.notes) : [];

  notes.push({
    ...entry,
    createdAt: new Date().toISOString(),
  });

  return prisma.prospect.update({
    where: { id: prospectId },
    data: { notes: JSON.stringify(notes) },
  });
}

export async function updateProspectStatus(id: string, newStatus: string) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  return prisma.prospect.update({
    where: { id },
    data: { status: newStatus },
  });
}

export async function createOrUpdateProspectFromChat(input: ChatProspectInput) {
  const userId = input.userId || process.env.DEFAULT_ADMIN_USER_ID || '';
  if (!userId) {
    return null;
  }

  if (input.phone) {
    const existing = await prisma.prospect.findFirst({
      where: {
        phone: input.phone,
        deletedAt: null,
      },
    });

    if (existing) {
      return prisma.prospect.update({
        where: { id: existing.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.email && { email: input.email }),
          ...(input.requirements && { notes: input.requirements }),
          ...(input.roomId && { roomId: input.roomId }),
          ...(input.source && { source: input.source }),
        },
      });
    }
  }

  if (input.email) {
    const existing = await prisma.prospect.findFirst({
      where: {
        email: input.email,
        deletedAt: null,
      },
    });

    if (existing) {
      return prisma.prospect.update({
        where: { id: existing.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.phone && { phone: input.phone }),
          ...(input.requirements && { notes: input.requirements }),
          ...(input.roomId && { roomId: input.roomId }),
          ...(input.source && { source: input.source }),
        },
      });
    }
  }

  return prisma.prospect.create({
    data: {
      name: input.name,
      phone: input.phone || null,
      email: input.email || null,
      source: input.source || 'website_chat',
      notes: input.requirements || null,
      roomId: input.roomId || null,
      userId,
      status: 'new',
    },
  });
}