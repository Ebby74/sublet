/**
 * Payment Service
 * 
 * Handles CRUD operations for payments (income and expenses).
 * Supports lease-linked and standalone payments.
 */

import { prisma } from '@/lib/prisma';
import { ringgitToSen } from '@/lib/format';
import type { Payment, Lease, Tenant } from '@prisma/client';

export interface CreatePaymentInput {
  type: 'income' | 'expense';
  amount: number; // in ringgit
  description?: string;
  referenceNumber?: string;
  paidAt?: Date;
  dueDate?: Date;
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  leaseId?: string;
  tenantId?: string;
  category?: string;
  userId: string;
}

export interface UpdatePaymentInput {
  type?: 'income' | 'expense';
  amount?: number; // in ringgit
  description?: string;
  referenceNumber?: string;
  paidAt?: Date | null;
  dueDate?: Date | null;
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  leaseId?: string | null;
  tenantId?: string | null;
  category?: string | null;
}

export interface PaymentFilters {
  type?: 'income' | 'expense';
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  statusIn?: Array<'pending' | 'paid' | 'overdue' | 'cancelled'>;
  tenantId?: string;
  leaseId?: string;
  startDate?: Date;
  endDate?: Date;
  incomeSource?: string;
  limit?: number;
}

/**
 * Generate reference number in format RCP-YYYYMMDD-XXXX
 */
function generateReferenceNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RCP-${dateStr}-${random}`;
}

/**
 * Calculate payment status based on paidAt and dueDate
 */
function calculateStatus(paidAt: Date | null | undefined, dueDate: Date | null | undefined): string {
  if (paidAt) return 'paid';
  if (!dueDate) return 'pending';
  
  const now = new Date();
  const due = new Date(dueDate);
  
  if (due < now) return 'overdue';
  return 'pending';
}

/**
 * Create a new payment
 */
export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  const { leaseId, tenantId, userId, ...rest } = input;
  
  // If leaseId provided, auto-populate tenantId from lease
  let finalTenantId = tenantId;
  let finalLeaseId = leaseId;
  
  if (leaseId) {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      select: { tenantId: true },
    });
    if (lease) {
      finalTenantId = lease.tenantId;
    }
  }
  
  // Generate reference if not provided
  const referenceNumber = input.referenceNumber || generateReferenceNumber();
  
  // Calculate status
  const status = input.status || calculateStatus(input.paidAt, input.dueDate);
  
  return prisma.payment.create({
    data: {
      type: input.type,
      amountSen: ringgitToSen(input.amount),
      description: input.description,
      referenceNumber,
      paidAt: input.paidAt,
      dueDate: input.dueDate,
      status,
      leaseId: finalLeaseId,
      tenantId: finalTenantId,
      category: input.category,
    },
  });
}

/**
 * Get payments with filtering
 */
export async function getPayments(
  userId: string,
  filters: PaymentFilters = {},
  includeDeleted = false
): Promise<PaymentWithRelations[]> {
  const where: Record<string, unknown> = {
    userId,
  };
  
  if (!includeDeleted) {
    where.deletedAt = null;
  }
  
  if (filters.type) {
    where.type = filters.type;
  }
  
  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.statusIn && filters.statusIn.length > 0) {
    where.status = { in: filters.statusIn };
  }
  
  if (filters.tenantId) {
    where.tenantId = filters.tenantId;
  }
  
  if (filters.leaseId) {
    where.leaseId = filters.leaseId;
  }
  
  if (filters.incomeSource) {
    where.incomeSource = filters.incomeSource;
  }
  
  if (filters.startDate || filters.endDate) {
    where.paidAt = {};
    if (filters.startDate) {
      (where.paidAt as Record<string, Date>).gte = filters.startDate;
    }
    if (filters.endDate) {
      (where.paidAt as Record<string, Date>).lte = filters.endDate;
    }
  }
  
const payments = await prisma.payment.findMany({
    where,
    include: {
      tenant: true,
      lease: {
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
      },
    },
    orderBy: { createdAt: 'desc' },
    take: filters.limit,
  });
  
  return payments as unknown as PaymentWithRelations[];
}

/**
 * Get payment by ID
 */
export async function getPayment(id: string): Promise<PaymentWithRelations | null> {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      tenant: true,
      lease: {
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
      },
    },
  });
  
  return payment as unknown as PaymentWithRelations | null;
}

/**
 * Update a payment
 */
export async function updatePayment(id: string, input: UpdatePaymentInput): Promise<Payment> {
  const data: Record<string, unknown> = { ...input };
  
  // Convert amount from ringgit to sen if provided
  if (input.amount !== undefined) {
    data.amountSen = ringgitToSen(input.amount);
    delete data.amount;
  }
  
  // Recalculate status if paidAt or dueDate changed
  if (input.paidAt !== undefined || input.dueDate !== undefined) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      select: { paidAt: true, dueDate: true },
    });
    if (payment) {
      const newPaidAt = input.paidAt !== undefined ? input.paidAt : payment.paidAt;
      const newDueDate = input.dueDate !== undefined ? input.dueDate : payment.dueDate;
      data.status = calculateStatus(newPaidAt, newDueDate);
    }
  }
  
  return prisma.payment.update({
    where: { id },
    data,
  });
}

/**
 * Soft delete a payment
 */
export async function deletePayment(id: string): Promise<void> {
  await prisma.payment.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * Get payment statistics for dashboard
 */
export async function getPaymentStats(userId: string): Promise<PaymentStats> {
  return getPaymentStatsByPeriod(userId, 'this-month');
}

/**
 * Get payment statistics by period
 */
export async function getPaymentStatsByPeriod(
  userId: string,
  period: 'this-month' | 'last-month' | 'this-year' | 'custom',
  customStartDate?: Date,
  customEndDate?: Date
): Promise<PaymentStats> {
  const where = {
    userId,
    deletedAt: null,
  };

  const now = new Date();
  let startDate: Date;
  let previousStartDate: Date;
  let previousEndDate: Date;

  switch (period) {
    case 'this-month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'last-month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      previousEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 0);
      break;
    case 'this-year':
      startDate = new Date(now.getFullYear(), 0, 1);
      previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
      previousEndDate = new Date(now.getFullYear() - 1, 11, 31);
      break;
    case 'custom':
      if (!customStartDate || !customEndDate) {
        throw new Error('Custom period requires start and end dates');
      }
      startDate = customStartDate;
      previousStartDate = new Date(customStartDate.getTime() - (customEndDate.getTime() - customStartDate.getTime()));
      previousEndDate = new Date(customStartDate.getTime() - 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
  }

  // Income totals for current period
  const incomeTotals = await prisma.payment.aggregate({
    where: {
      ...where,
      type: 'income',
      status: 'paid',
      paidAt: { gte: startDate },
    },
    _sum: { amountSen: true },
  });

  // Income totals for previous period (for comparison)
  const incomePrevious = await prisma.payment.aggregate({
    where: {
      ...where,
      type: 'income',
      status: 'paid',
      paidAt: { gte: previousStartDate, lte: previousEndDate },
    },
    _sum: { amountSen: true },
  });

  // Expense totals for current period
  const expenseTotals = await prisma.payment.aggregate({
    where: {
      ...where,
      type: 'expense',
      status: 'paid',
      paidAt: { gte: startDate },
    },
    _sum: { amountSen: true },
  });

  // Expense totals for previous period (for comparison)
  const expensePrevious = await prisma.payment.aggregate({
    where: {
      ...where,
      type: 'expense',
      status: 'paid',
      paidAt: { gte: previousStartDate, lte: previousEndDate },
    },
    _sum: { amountSen: true },
  });

  // Outstanding (pending/overdue)
  const outstanding = await prisma.payment.aggregate({
    where: {
      ...where,
      status: { in: ['pending', 'overdue'] },
    },
    _sum: { amountSen: true },
    _count: true,
  });

  return {
    totalIncome: incomeTotals._sum.amountSen || 0,
    totalExpenses: expenseTotals._sum.amountSen || 0,
    incomeThisMonth: (incomeTotals._sum.amountSen || 0) - (incomePrevious._sum.amountSen || 0),
    expensesThisMonth: (expenseTotals._sum.amountSen || 0) - (expensePrevious._sum.amountSen || 0),
    outstandingAmount: outstanding._sum.amountSen || 0,
    outstandingCount: outstanding._count,
    outstandingIncome: 0,
    outstandingExpense: 0,
  };
}

/**
 * Get monthly income/expense data for charts
 */
export async function getMonthlyChartData(
  userId: string,
  months: number = 6
): Promise<MonthlyChartData[]> {
  const now = new Date();
  const data: MonthlyChartData[] = [];

  const where = {
    userId,
    deletedAt: null,
    status: 'paid',
  };

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const incomeResult = await prisma.payment.aggregate({
      where: {
        ...where,
        type: 'income',
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amountSen: true },
    });

    const expenseResult = await prisma.payment.aggregate({
      where: {
        ...where,
        type: 'expense',
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amountSen: true },
    });

    data.push({
      month: monthStart.toLocaleDateString('en-MY', { month: 'short', year: '2-digit' }),
      income: incomeResult._sum?.amountSen ?? 0,
      expenses: expenseResult._sum?.amountSen ?? 0,
    });
  }

  return data;
}

// Monthly chart data type
export interface MonthlyChartData {
  month: string;
  income: number;
  expenses: number;
}

// Type for payment with relations
export type PaymentWithRelations = Payment & {
  tenant: Tenant | null;
  lease: (Lease & {
    room: {
      floor: {
        property: { name: string };
      };
    };
    tenant: Tenant;
  }) | null;
incomeSource: string | null;
};

// Stats type
export interface PaymentStats {
  totalIncome: number;
  totalExpenses: number;
  incomeThisMonth: number;
  expensesThisMonth: number;
  outstandingAmount: number;
  outstandingCount: number;
  outstandingIncome: number;
  outstandingExpense: number;
}

import {
  INCOME_TYPES,
  EXPENSE_TYPES,
  PAYMENT_TYPES,
  LHDN_CATEGORIES,
  INCOME_SOURCES,
} from '@/lib/payment-constants';

export {
  INCOME_TYPES,
  EXPENSE_TYPES,
  PAYMENT_TYPES,
  LHDN_CATEGORIES,
  INCOME_SOURCES,
};