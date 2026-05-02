import { prisma } from '@/lib/prisma';
import type { ExitProcess } from '@prisma/client';

export interface CreateExitProcessInput {
  leaseId: string;
  initiatedBy?: string;
  expectedMoveOut: Date;
  checklistData?: Record<string, boolean>;
  notes?: string;
}

export interface UpdateExitProcessInput {
  actualMoveOut?: Date;
  status?: string;
  checklistData?: Record<string, boolean>;
  damagesFound?: string[];
  totalDeductionsSen?: number;
  depositReturnSen?: number;
  finalPaymentSen?: number;
  refundMethod?: string;
  refundReference?: string;
  refundDate?: Date;
  notes?: string;
  completedAt?: Date;
}

export async function getExitProcesses(leaseId?: string): Promise<ExitProcess[]> {
  return prisma.exitProcess.findMany({
    where: leaseId ? { leaseId } : undefined,
    include: { lease: { include: { tenant: true, room: true } } },
    orderBy: { initiatedAt: 'desc' },
  });
}

export async function getExitProcessByLeaseId(leaseId: string): Promise<ExitProcess | null> {
  return prisma.exitProcess.findUnique({
    where: { leaseId },
    include: { lease: { include: { tenant: true, room: true, damageReports: true } } },
  });
}

export async function createExitProcess(data: CreateExitProcessInput): Promise<ExitProcess> {
  const lease = await prisma.lease.findUnique({
    where: { id: data.leaseId },
    include: { damageReports: true },
  });

  if (!lease) {
    throw new Error('Lease not found');
  }

  const damagesFound = lease.damageReports.map((d) => d.id);
  const totalDeductionsSen = lease.damageReports.reduce(
    (sum, d) => sum + (d.actualCostSen ?? d.estimatedCostSen ?? 0),
    0
  );

  return prisma.exitProcess.create({
    data: {
      leaseId: data.leaseId,
      initiatedBy: data.initiatedBy,
      expectedMoveOut: data.expectedMoveOut,
      checklistData: data.checklistData ? JSON.stringify(data.checklistData) : null,
      damagesFound: damagesFound.length > 0 ? JSON.stringify(damagesFound) : null,
      totalDeductionsSen,
      notes: data.notes,
    },
    include: { lease: { include: { tenant: true, room: true } } },
  });
}

export async function updateExitProcess(leaseId: string, data: UpdateExitProcessInput): Promise<ExitProcess> {
  return prisma.exitProcess.update({
    where: { leaseId },
    data: {
      actualMoveOut: data.actualMoveOut,
      status: data.status,
      checklistData: data.checklistData ? JSON.stringify(data.checklistData) : undefined,
      damagesFound: data.damagesFound ? JSON.stringify(data.damagesFound) : undefined,
      totalDeductionsSen: data.totalDeductionsSen,
      depositReturnSen: data.depositReturnSen,
      finalPaymentSen: data.finalPaymentSen,
      refundMethod: data.refundMethod,
      refundReference: data.refundReference,
      refundDate: data.refundDate,
      notes: data.notes,
      completedAt: data.completedAt,
    },
    include: { lease: { include: { tenant: true, room: true } } },
  });
}

export async function completeExitProcess(leaseId: string): Promise<ExitProcess> {
  const exitProcess = await prisma.exitProcess.findUnique({
    where: { leaseId },
    include: { lease: true },
  });

  if (!exitProcess) {
    throw new Error('Exit process not found');
  }

  await prisma.lease.update({
    where: { id: leaseId },
    data: { status: 'terminated', deletedAt: new Date() },
  });

  await prisma.room.update({
    where: { id: exitProcess.lease.roomId },
    data: { status: 'active', vacantSince: new Date() },
  });

  return prisma.exitProcess.update({
    where: { leaseId },
    data: { status: 'completed', completedAt: new Date() },
    include: { lease: { include: { tenant: true, room: true } } },
  });
}
