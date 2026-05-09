import { prisma } from '@/lib/prisma';
import { ringgitToSen } from '@/lib/format';

export type RoomStatus = 'draft' | 'available' | 'listed' | 'rented' | 'maintenance';

export interface CreateRoomInput {
  floorId: string;
  name: string;
  type?: 'master' | 'single' | 'shared';
  beds?: number;
  baths?: number;
  areaSqft?: number;
  rentSen: number;
  depositSen?: number;
  photos?: string[];
  videos?: string[];
  status?: RoomStatus;
}

export interface UpdateRoomInput {
  name?: string;
  type?: string;
  beds?: number;
  baths?: number;
  areaSqft?: number;
  rentAmount?: number; // in ringgit
  depositAmount?: number; // in ringgit
  photos?: string[];
  videos?: string[];
  status?: string;
}

export async function createRoom(input: CreateRoomInput) {
  return prisma.room.create({
    data: {
      floorId: input.floorId,
      name: input.name,
      type: input.type ?? 'single',
      beds: input.beds ?? 1,
      baths: input.baths ?? 1,
      areaSqft: input.areaSqft,
      rentSen: input.rentSen,
      depositSen: input.depositSen,
      photos: input.photos ? JSON.stringify(input.photos) : null,
      videos: input.videos ? JSON.stringify(input.videos) : null,
      status: input.status ?? 'draft',
    },
  });
}

export async function getRoomsByProperty(propertyId: string, includeDeleted = false) {
  return prisma.room.findMany({
    where: {
      floor: { propertyId },
      deletedAt: includeDeleted ? undefined : null,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getRoom(id: string) {
  return prisma.room.findUnique({
    where: { id },
    include: { floor: { include: { property: true } } },
  });
}

export async function updateRoom(id: string, input: UpdateRoomInput) {
  const data: Record<string, unknown> = { ...input };

  if (input.rentAmount !== undefined) {
    data.rentSen = ringgitToSen(input.rentAmount);
    delete data.rentAmount;
  }
  if (input.depositAmount !== undefined) {
    data.depositSen = input.depositAmount ? ringgitToSen(input.depositAmount) : null;
    delete data.depositAmount;
  }
  if (input.photos !== undefined) {
    data.photos = JSON.stringify(input.photos);
  }
  if (input.videos !== undefined) {
    data.videos = JSON.stringify(input.videos);
  }

  // Remove undefined values
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) {
      delete data[key];
    }
  });

  return prisma.room.update({
    where: { id },
    data,
  });
}

export async function deleteRoom(id: string) {
  return prisma.room.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function getAvailableRoomsByProperty(propertyId: string) {
  return prisma.room.findMany({
    where: {
      floor: { propertyId },
      status: 'available',
      deletedAt: null,
    },
    orderBy: { name: 'asc' },
  });
}

export async function updateRoomStatus(id: string, status: RoomStatus) {
  return prisma.room.update({
    where: { id },
    data: { status },
  });
}

export async function getPublicRooms() {
  return prisma.room.findMany({
    where: {
      status: 'available',
      deletedAt: null,
    },
    include: {
      floor: { include: { property: { select: { id: true, name: true, address: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllRoomsForAdmin() {
  return prisma.room.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      floor: { include: { property: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getRoomsForJVStakeholder(propertyIds: string[]) {
  return prisma.room.findMany({
    where: {
      floor: {
        propertyId: { in: propertyIds },
      },
      deletedAt: null,
    },
    include: {
      floor: { include: { property: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addMediaToRoom(id: string, mediaType: 'photos' | 'videos', url: string) {
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) {
    throw new Error('Room not found');
  }

  const existing = mediaType === 'photos' ? room.photos : room.videos;
  const mediaList = existing ? JSON.parse(existing) : [];
  mediaList.push(url);

  return prisma.room.update({
    where: { id },
    data: { [mediaType]: JSON.stringify(mediaList) },
  });
}

export async function removeMediaFromRoom(id: string, mediaType: 'photos' | 'videos', url: string) {
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) {
    throw new Error('Room not found');
  }

  const existing = mediaType === 'photos' ? room.photos : room.videos;
  const mediaList = existing ? JSON.parse(existing) : [];
  const filtered = mediaList.filter((u: string) => u !== url);

  return prisma.room.update({
    where: { id },
    data: { [mediaType]: filtered.length > 0 ? JSON.stringify(filtered) : null },
  });
}