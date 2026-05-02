import { prisma } from '@/lib/prisma';

export interface CreateFloorInput {
  propertyId: string;
  name: string;
  level?: number;
}

export interface UpdateFloorInput {
  name?: string;
  level?: number;
  status?: string;
}

export async function createFloor(input: CreateFloorInput) {
  return prisma.floor.create({
    data: {
      propertyId: input.propertyId,
      name: input.name,
      level: input.level ?? 0,
    },
  });
}

export async function getFloor(id: string) {
  return prisma.floor.findUnique({
    where: { id },
    include: {
      property: true,
      rooms: {
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      },
    },
  });
}

export async function getFloorsByProperty(propertyId: string) {
  return prisma.floor.findMany({
    where: {
      propertyId,
      status: 'active',
    },
    include: {
      rooms: {
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { level: 'asc' },
  });
}

export async function updateFloor(id: string, input: UpdateFloorInput) {
  return prisma.floor.update({
    where: { id },
    data: input,
  });
}

export async function deleteFloor(id: string) {
  return prisma.floor.update({
    where: { id },
    data: { status: 'inactive' },
  });
}

export async function getPropertyWithHierarchy(propertyId: string) {
  return prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      floors: {
        where: { status: 'active' },
        orderBy: { level: 'asc' },
        include: {
          rooms: {
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
          },
        },
      },
    },
  });
}

export async function getAllPropertiesWithHierarchy(userId: string) {
  return prisma.property.findMany({
    where: {
      userId,
      deletedAt: null,
      status: 'active',
    },
    include: {
      floors: {
        where: { status: 'active' },
        orderBy: { level: 'asc' },
        include: {
          rooms: {
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}