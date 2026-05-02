import { prisma } from '@/lib/prisma';
import { whatsappService } from './whatsapp-service';
import { marketingChannelService } from './marketing-channel-service';
import { format } from 'date-fns';

function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  if (phone.startsWith('+')) {
    return digits;
  }
  if (digits.startsWith('0')) {
    return `+60${digits.slice(1)}`;
  }
  return `+60${digits}`;
}

export interface CreateViewingInput {
  roomId: string;
  prospectId: string;
  scheduledAt: Date;
}

export interface ViewingFilters {
  roomId?: string;
  status?: string;
  from?: Date;
  to?: Date;
}

export async function createViewing(input: CreateViewingInput, userId: string) {
  const room = await prisma.room.findUnique({
    where: { id: input.roomId },
    include: { floor: { include: { property: true } } },
  });

  if (!room || room.status !== 'active') {
    throw new Error('Room not available for viewing');
  }

  const prospect = await prisma.prospect.findUnique({
    where: { id: input.prospectId },
  });

  if (!prospect) {
    throw new Error('Prospect not found');
  }

  const property = room.floor.property;

  const viewing = await prisma.viewing.create({
    data: {
      roomId: input.roomId,
      prospectId: input.prospectId,
      scheduledAt: input.scheduledAt,
      status: 'scheduled',
    },
    include: {
      room: { include: { floor: { include: { property: true } } } },
      prospect: true,
    },
  });

  if (prospect.phone) {
    const message = `🏠 Viewing Confirmed!\n\n` +
      `Room: ${viewing.room.name}\n` +
      `Property: ${property.address}\n` +
      `Date: ${format(viewing.scheduledAt, 'dd/MM/yyyy')}\n` +
      `Time: ${format(viewing.scheduledAt, 'hh:mm a')}\n\n` +
      `Reply CANCEL to reschedule`;

    try {
      const config = await marketingChannelService.getChannelConfig(userId, 'whatsapp');
      if (config?.whatsapp?.senderNumber) {
        await whatsappService.sendMessage(
          normalizePhoneNumber(prospect.phone),
          message);
      }
    } catch (e) {
      console.error('WhatsApp send error:', e);
    }
  }

  return viewing;
}

export async function getViewings(userId: string, filters?: ViewingFilters) {
  const where: Record<string, unknown> = {
    room: { property: { userId } },
  };
  if (filters?.roomId) where.roomId = filters.roomId;
  if (filters?.status) where.status = filters.status;
  if (filters?.from || filters?.to) {
    where.scheduledAt = {
      gte: filters.from,
      lte: filters.to,
    };
  }

  return prisma.viewing.findMany({
    where,
    include: {
      room: { include: { floor: { include: { property: true } } } },
      prospect: true,
    },
    orderBy: { scheduledAt: 'asc' },
  });
}

export async function getViewing(id: string) {
  return prisma.viewing.findUnique({
    where: { id },
    include: {
      room: { include: { floor: { include: { property: true } } } },
      prospect: true,
    },
  });
}

export async function completeViewing(id: string, result: 'interested' | 'not_interested', notes?: string) {
  return prisma.viewing.update({
    where: { id },
    data: {
      status: 'completed',
      result,
      notes,
    },
  });
}

export async function cancelViewing(id: string) {
  return prisma.viewing.update({
    where: { id },
    data: { status: 'cancelled' },
  });
}