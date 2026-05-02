import { prisma } from '@/lib/prisma';
import type { DamageReport } from '@prisma/client';

export interface CreateDamageReportInput {
  leaseId: string;
  reporterName?: string;
  damageType: string;
  severity?: string;
  description: string;
  photos?: string[];
  estimatedCostSen?: number;
}

export interface UpdateDamageReportInput {
  reporterName?: string;
  damageType?: string;
  severity?: string;
  description?: string;
  photos?: string[];
  estimatedCostSen?: number;
  actualCostSen?: number;
  status?: string;
  repairNotes?: string;
  repairedAt?: Date;
}

export async function getDamageReports(leaseId?: string): Promise<DamageReport[]> {
  return prisma.damageReport.findMany({
    where: leaseId ? { leaseId } : undefined,
    include: { lease: { include: { tenant: true, room: true } } },
    orderBy: { reportedAt: 'desc' },
  });
}

export async function getDamageReportById(id: string): Promise<DamageReport | null> {
  return prisma.damageReport.findUnique({
    where: { id },
    include: { lease: { include: { tenant: true, room: true } } },
  });
}

export async function createDamageReport(data: CreateDamageReportInput): Promise<DamageReport> {
  return prisma.damageReport.create({
    data: {
      leaseId: data.leaseId,
      reporterName: data.reporterName,
      damageType: data.damageType,
      severity: data.severity ?? 'minor',
      description: data.description,
      photos: data.photos ? JSON.stringify(data.photos) : null,
      estimatedCostSen: data.estimatedCostSen,
    },
    include: { lease: { include: { tenant: true, room: true } } },
  });
}

export async function updateDamageReport(id: string, data: UpdateDamageReportInput): Promise<DamageReport> {
  return prisma.damageReport.update({
    where: { id },
    data: {
      reporterName: data.reporterName,
      damageType: data.damageType,
      severity: data.severity,
      description: data.description,
      photos: data.photos ? JSON.stringify(data.photos) : undefined,
      estimatedCostSen: data.estimatedCostSen,
      actualCostSen: data.actualCostSen,
      status: data.status,
      repairNotes: data.repairNotes,
      repairedAt: data.repairedAt,
    },
    include: { lease: { include: { tenant: true, room: true } } },
  });
}

export async function deleteDamageReport(id: string): Promise<DamageReport> {
  return prisma.damageReport.delete({
    where: { id },
  });
}

export async function getDamageReportsByStatus(status: string): Promise<DamageReport[]> {
  return prisma.damageReport.findMany({
    where: { status },
    include: { lease: { include: { tenant: true, room: true } } },
    orderBy: { reportedAt: 'desc' },
  });
}
