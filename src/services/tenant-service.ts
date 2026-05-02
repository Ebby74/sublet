import { prisma } from '@/lib/prisma';

export interface CreateTenantInput {
  name: string;
  phone?: string;
  email?: string;
  icNumber: string; // REQUIRED - LHDN compliance
  userId: string;
}

export interface UpdateTenantInput {
  name?: string;
  phone?: string;
  email?: string;
  icNumber?: string;
}

export async function createTenant(input: CreateTenantInput) {
  return prisma.tenant.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      icNumber: input.icNumber,
      userId: input.userId,
    },
  });
}

export async function getTenants(userId: string, includeDeleted = false) {
  return prisma.tenant.findMany({
    where: {
      userId,
      deletedAt: includeDeleted ? undefined : null,
    },
    include: {
      leases: {
        where: { status: 'active', deletedAt: null },
        include: {
          room: { include: { floor: { include: { property: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTenant(id: string) {
  return prisma.tenant.findUnique({
    where: { id },
    include: {
      leases: {
        where: { deletedAt: null },
        include: {
          room: { include: { floor: { include: { property: true } } } },
        },
        orderBy: { startDate: 'desc' },
      },
      payments: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
}

export async function updateTenant(id: string, input: UpdateTenantInput) {
  return prisma.tenant.update({
    where: { id },
    data: input,
  });
}

export async function deleteTenant(id: string) {
  return prisma.tenant.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function saveTenantIcDocument(
  tenantId: string,
  documentType: 'ic-front' | 'ic-back',
  file: { name: string; buffer: Buffer }
) {
  const fs = await import('fs/promises');
  const path = await import('path');

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tenants', tenantId);
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name);
  const filename = `${documentType}${ext}`;
  const filepath = path.join(uploadDir, filename);

  await fs.writeFile(filepath, file.buffer);

  return `/uploads/tenants/${tenantId}/${filename}`;
}

export async function getTenantIcDocuments(tenantId: string) {
  const fs = await import('fs/promises');
  const path = await import('path');

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tenants', tenantId);

  try {
    const files = await fs.readdir(uploadDir);
    return files.map((file) => ({
      type: file.includes('front') ? 'ic-front' : 'ic-back',
      url: `/uploads/tenants/${tenantId}/${file}`,
    }));
  } catch {
    return [];
  }
}
