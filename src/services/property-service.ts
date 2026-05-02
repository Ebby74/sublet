import { prisma } from '@/lib/prisma';

export interface CreatePropertyInput {
  name: string;
  address: string;
  type?: string;
  status?: 'vacant' | 'occupied' | 'maintenance' | 'under-renovation' | 'listed-for-sale';
  userId: string;
}

export interface UpdatePropertyInput {
  name?: string;
  address?: string;
  type?: string;
  status?: string;
}

export async function createProperty(input: CreatePropertyInput) {
  return prisma.property.create({
    data: {
      name: input.name,
      address: input.address,
      type: input.type ?? 'apartment',
      status: input.status ?? 'active',
      userId: input.userId,
    },
  });
}

export async function getProperties(userId: string, includeDeleted = false) {
  // If userId is 'all', return all properties (no filter)
  const where = userId === 'all' 
    ? { deletedAt: includeDeleted ? undefined : null }
    : { userId, deletedAt: includeDeleted ? undefined : null };
  
  return prisma.property.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProperty(id: string) {
  return prisma.property.findUnique({
    where: { id },
  });
}

export async function updateProperty(id: string, input: UpdatePropertyInput) {
  return prisma.property.update({
    where: { id },
    data: input,
  });
}

export async function deleteProperty(id: string) {
  return prisma.property.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function getVacantProperties(userId: string) {
  return prisma.property.findMany({
    where: {
      userId,
      status: 'vacant',
      deletedAt: null,
    },
    orderBy: { name: 'asc' },
  });
}