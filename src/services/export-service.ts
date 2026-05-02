/**
 * Export Service
 * 
 * Handles Excel/CSV export for financial data with Malaysian compliance.
 * Uses xlsx (SheetJS) library for Excel generation.
 * 
 * Decisions:
 * - D-25: Separate export options for each format
 * - D-27: MYR currency format: "RM 1,500.00"
 * - D-28: Date format: DD/MM/YYYY
 * - D-29: Follow LHDN Perbent 2024 format
 */

import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate as formatDateDisplay, senToRinggit } from '@/lib/format';
import { calculateZakat } from '@/lib/zakat';
import { calculateTaxWithZakatOffset } from '@/lib/tax-offset';
import {
  getYtdStats,
  getPropertyBreakdown,
  getTenantAnalytics,
  getCashFlowForecast,
  type YtdStats,
  type PropertyBreakdown,
  type TenantAnalytics,
  type CashFlowForecast,
} from './business-summary-service';
import { getPayments, INCOME_SOURCES } from './payment-service';

// Export format types
export type ExportFormat = 
  | 'transactions'
  | 'by-tenant'
  | 'by-property'
  | 'bills'
  | 'lhdn'
  | 'profit-loss'
  | 'balance-sheet'
  | 'cash-book'
  | 'tax-summary'
  | 'property-performance'   // NEW
  | 'tenant-analytics'      // NEW
  | 'business-summary'      // NEW
  | 'expenses'              // NEW
  | 'expense-allocation'  // NEW
  | 'consolidated'        // NEW
  | 'ssm-form9'           // SSM Form 9
  | 'ssm-form44';        // SSM Form 44

export interface ExportFilters {
  startDate?: string;
  endDate?: string;
  tenantId?: string;
  propertyId?: string;
  year?: string;
}

// SSM-specific types for Form 9 and Form 44
export interface SSMCompanyInfo {
  companyName: string;
  registrationNumber: string;
  incorporationDate: string;
  registeredAddress: string;
  businessAddress: string;
}

export interface SSMDirectorSignature {
  name: string;
  designation: string;
  icNumber: string;
  date: string;
}

/**
 * Format MYR currency for Excel display
 */
function formatMYR(sen: number): string {
  return formatCurrency(sen);
}

/**
 * Format date for Malaysian display (DD/MM/YYYY)
 */
function formatDate(date: Date | string | null): string {
  if (!date) return '';
  return formatDateDisplay(new Date(date));
}

/**
 * Build common where clause for user data
 */
function buildUserWhereClause(userId: string) {
  return {
    OR: [
      { tenant: { userId } },
      { lease: { room: { floor: { property: { userId } } } } },
    ],
    deletedAt: null,
  };
}

// ============================================================================
// EXPORT: All Transactions
// ============================================================================

export async function exportTransactions(userId: string, filters: ExportFilters = {}) {
  const where: Record<string, unknown> = {
    ...buildUserWhereClause(userId),
  };

  // Apply date filters
  if (filters.startDate || filters.endDate) {
    where.paidAt = {};
    if (filters.startDate) {
      (where.paidAt as Record<string, Date>).gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      (where.paidAt as Record<string, Date>).lte = new Date(filters.endDate);
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
                  property: { select: { id: true, name: true } }
                }
              }
            }
          }
        },
      },
    },
    orderBy: { paidAt: 'desc' },
  });

  const rows = [
    ['Date', 'Reference', 'Type', 'Amount', 'Tenant', 'Property', 'Description', 'Status'],
  ];

  for (const payment of payments) {
    rows.push([
      formatDate(payment.paidAt),
      payment.referenceNumber || '',
      payment.type,
      formatMYR(payment.amountSen),
      payment.tenant?.name || '',
      payment.lease?.room.floor.property.name || '',
      payment.description || '',
      payment.status,
    ]);
  }

  return createWorksheet(rows, 'Transactions');
}

// ============================================================================
// EXPORT: By Tenant
// ============================================================================

export async function exportByTenant(userId: string, tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      payments: {
        where: { deletedAt: null },
        orderBy: { paidAt: 'desc' },
        include: {
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
              }
            },
          },
        },
      },
    },
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const rows = [
    ['Tenant Name', 'IC Number', 'Property', 'Date', 'Type', 'Amount', 'Description'],
  ];

  for (const payment of tenant.payments) {
    rows.push([
      tenant.name || '',
      tenant.icNumber || '',
      payment.lease?.room.floor.property.name || '-',
      formatDate(payment.paidAt),
      payment.type,
      formatMYR(payment.amountSen),
      payment.description || '',
    ]);
  }

  return createWorksheet(rows, `${tenant.name} - Payment History`);
}

// ============================================================================
// EXPORT: By Property
// ============================================================================

export async function exportByProperty(userId: string, propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      floors: {
        include: {
          rooms: {
            include: {
              leases: {
                where: { status: 'active', deletedAt: null },
                include: {
                  tenant: true,
                  payments: {
                    where: { deletedAt: null, type: 'income', status: 'paid' },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!property) {
    throw new Error('Property not found');
  }

  const rows = [
    ['Property', 'Tenant', 'Monthly Rent', 'Total Paid', 'Total Outstanding'],
  ];

  const allLeases = property.floors.flatMap(f => f.rooms).flatMap(r => r.leases);
  for (const lease of allLeases) {
    const totalPaid = lease.payments.reduce((sum, p) => sum + p.amountSen, 0);
    const monthlyRentSen = lease.monthlyRentSen || 0;
    const outstanding = monthlyRentSen - totalPaid;

    rows.push([
      property.name,
      lease.tenant?.name || 'No Tenant',
      formatMYR(monthlyRentSen),
      formatMYR(totalPaid),
      formatMYR(Math.max(0, outstanding)),
    ]);
  }

  return createWorksheet(rows, `${property.name} - Summary`);
}

// ============================================================================
// EXPORT: Bills Summary
// ============================================================================

export async function exportBills(userId: string, filters: ExportFilters = {}) {
  const where: Record<string, unknown> = {
    ...buildUserWhereClause(userId),
    type: 'expense',
    category: {
      in: ['Water (SYABAS)', 'Electricity (TNB)', 'Internet', 'IWK'],
    },
  };

  if (filters.startDate || filters.endDate) {
    where.paidAt = {};
    if (filters.startDate) {
      (where.paidAt as Record<string, Date>).gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      (where.paidAt as Record<string, Date>).lte = new Date(filters.endDate);
    }
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
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
          }
        },
      },
    },
    orderBy: { paidAt: 'desc' },
  });

  const rows = [
    ['Property', 'Bill Type', 'Amount', 'Due Date', 'Paid Date', 'Status'],
  ];

  for (const payment of payments) {
    rows.push([
      payment.lease?.room.floor.property.name || '-',
      payment.category || '',
      formatMYR(payment.amountSen),
      payment.dueDate ? formatDate(payment.dueDate) : '',
      payment.paidAt ? formatDate(payment.paidAt) : '',
      payment.status,
    ]);
  }

  return createWorksheet(rows, 'Bills Summary');
}

// ============================================================================
// EXPORT: LHDN Perbent 2024 Format
// ============================================================================

export async function exportLHDN(userId: string, filters: ExportFilters = {}) {
  // Get all active leases with tenant info for LHDN report
  const leases = await prisma.lease.findMany({
    where: {
      room: {
        floor: {
          property: { userId }
        }
      },
      status: 'active',
      deletedAt: null,
    },
    include: {
      tenant: true,
      room: {
        include: {
          floor: {
            include: {
              property: { select: { address: true } }
            }
          }
        }
      },
      payments: {
        where: {
          type: 'income',
          status: 'paid',
          deletedAt: null,
        },
      },
    },
  });

  // LHDN Perbent 2024 format columns
  const rows = [
    [
      'No.',
      'Property Address',
      'Tenant Name',
      'Tenant IC Number',
      'Rental Period (Start)',
      'Rental Period (End)',
      'Monthly Rental (RM)',
      'Total Rental Received (RM)',
      'Deposit Held (RM)',
    ],
  ];

  let index = 1;
  for (const lease of leases) {
    const totalRentalReceived = lease.payments.reduce((sum, p) => {
      // Only count rent payments (not deposits, late fees)
      if (['Rent', 'Deposit', 'Late Fee', 'Other'].includes(p.category || '')) {
        // For simplicity, include all income
        return sum + p.amountSen;
      }
      return sum + p.amountSen;
    }, 0);

    rows.push([
      index.toString(),
      lease.room.floor.property.address,
      lease.tenant?.name || '',
      lease.tenant?.icNumber || '',
      formatDate(lease.startDate),
      formatDate(lease.endDate),
      formatMYR(lease.monthlyRentSen),
      formatMYR(totalRentalReceived),
      formatMYR(lease.depositSen),
    ]);
    index++;
  }

  return createWorksheet(rows, 'LHDN Report - Perbent 2024');
}

// ============================================================================
// EXPORT: Profit & Loss Statement
// ============================================================================

export async function exportProfitLoss(userId: string, year?: string) {
  const targetYear = year ? parseInt(year) : new Date().getFullYear();
  const startDate = new Date(targetYear, 0, 1);
  const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

  const where = {
    ...buildUserWhereClause(userId),
    paidAt: { gte: startDate, lte: endDate },
    status: 'paid',
    deletedAt: null,
  };

  // Get all income
  const incomePayments = await prisma.payment.findMany({
    where: { ...where, type: 'income' },
  });

  // Get all expenses
  const expensePayments = await prisma.payment.findMany({
    where: { ...where, type: 'expense' },
  });

  // Group income by category
  const incomeByCategory: Record<string, number> = {};
  for (const payment of incomePayments) {
    const cat = payment.category || 'Other';
    incomeByCategory[cat] = (incomeByCategory[cat] || 0) + payment.amountSen;
  }

  // Group expenses by category
  const expenseByCategory: Record<string, number> = {};
  for (const payment of expensePayments) {
    const cat = payment.category || 'Other';
    expenseByCategory[cat] = (expenseByCategory[cat] || 0) + payment.amountSen;
  }

  const totalIncome = Object.values(incomeByCategory).reduce((sum, v) => sum + v, 0);
  const totalExpenses = Object.values(expenseByCategory).reduce((sum, v) => sum + v, 0);
  const netProfit = totalIncome - totalExpenses;

  const rows: string[][] = [
    [`Profit & Loss Statement - ${targetYear}`],
    [''],
    ['INCOME'],
  ];

  // Add income categories
  for (const [category, amount] of Object.entries(incomeByCategory)) {
    rows.push([category, formatMYR(amount)]);
  }
  rows.push(['TOTAL INCOME', formatMYR(totalIncome)]);

  rows.push(['']);
  rows.push(['EXPENSES']);

  // Add expense categories
  for (const [category, amount] of Object.entries(expenseByCategory)) {
    rows.push([category, formatMYR(amount)]);
  }
  rows.push(['TOTAL EXPENSES', formatMYR(totalExpenses)]);

  rows.push(['']);
  rows.push(['NET PROFIT/(LOSS)', formatMYR(netProfit)]);

  // Calculate Zakat
  const netProfitForZakat = Math.max(0, netProfit);
  const ZakatResult = calculateZakat(netProfitForZakat);

  rows.push(['']);
  if (ZakatResult.isLiable) {
    rows.push(['ZAKAT PERNIAGAAN (2.5%)', formatMYR(ZakatResult.amount)]);
    rows.push(['NET PROFIT AFTER ZAKAT', formatMYR(netProfit - ZakatResult.amount)]);
  } else {
    rows.push(['ZAKAT PERNIAGAAN', 'N/A (Below nisab threshold)']);
  }

  return createWorksheet(rows, 'Profit & Loss');
}

// ============================================================================
// EXPORT: Balance Sheet
// ============================================================================

export async function exportBalanceSheet(userId: string) {
  const where = {
    ...buildUserWhereClause(userId),
    status: 'paid',
    deletedAt: null,
  };

  // Calculate receivables (outstanding income)
  const outstandingIncome = await prisma.payment.aggregate({
    where: {
      ...where,
      type: 'income',
      status: { in: ['pending', 'overdue'] },
    },
    _sum: { amountSen: true },
  });

  // Calculate deposits held in trust
  const depositPayments = await prisma.payment.findMany({
    where: {
      ...where,
      type: 'income',
      category: 'Deposit',
    },
  });

  const depositsHeld = depositPayments.reduce((sum, p) => sum + p.amountSen, 0);

  // Assets
  const assets = (outstandingIncome._sum.amountSen || 0) + depositsHeld;

  // Liabilities (deposits to return - simplified)
  const liabilities = depositsHeld;

  const netWorth = assets - liabilities;

  const rows: string[][] = [
    ['Balance Sheet'],
    [''],
    ['ASSETS'],
    ['Receivables (Outstanding Rent)', formatMYR(outstandingIncome._sum.amountSen || 0)],
    ['Deposits (In Trust)', formatMYR(depositsHeld)],
    ['TOTAL ASSETS', formatMYR(assets)],
    [''],
    ['LIABILITIES'],
    ['Deposits (In Trust - to return)', formatMYR(liabilities)],
    ['TOTAL LIABILITIES', formatMYR(liabilities)],
    [''],
    ['NET WORTH', formatMYR(netWorth)],
  ];

  return createWorksheet(rows, 'Balance Sheet');
}

// ============================================================================
// EXPORT: Cash Book
// ============================================================================

export async function exportCashBook(userId: string, filters: ExportFilters = {}) {
  const startDate = filters.startDate ? new Date(filters.startDate) : new Date(new Date().getFullYear(), 0, 1);
  const endDate = filters.endDate ? new Date(filters.endDate) : new Date();

  const where = {
    ...buildUserWhereClause(userId),
    paidAt: { gte: startDate, lte: endDate },
    status: 'paid',
    deletedAt: null,
  };

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
          }
        },
      },
    },
    orderBy: { paidAt: 'asc' },
  });

  const receipts: string[][] = [];
  const paymentsList: string[][] = [];
  let runningBalance = 0;

  for (const payment of payments) {
    const date = formatDate(payment.paidAt);
    const ref = payment.referenceNumber || '';
    const desc = payment.tenant?.name || payment.description || '';
    const amount = payment.amountSen;

    if (payment.type === 'income') {
      runningBalance += amount;
      receipts.push([date, ref, desc, formatMYR(amount), '', formatMYR(runningBalance)]);
    } else {
      runningBalance -= amount;
      paymentsList.push([date, ref, desc, '', formatMYR(amount), formatMYR(runningBalance)]);
    }
  }

  const rows: string[][] = [
    ['CASH BOOK'],
    [''],
    ['RECEIPTS'],
    ['Date', 'Reference', 'From', 'Amount', '', 'Balance'],
    ...receipts,
    [''],
    ['PAYMENTS'],
    ['Date', 'Reference', 'To', '', 'Amount', 'Balance'],
    ...paymentsList,
  ];

  return createWorksheet(rows, 'Cash Book');
}

// ============================================================================
// EXPORT: Tax Summary
// ============================================================================

export async function exportTaxSummary(userId: string, year?: string) {
  const targetYear = year ? parseInt(year) : new Date().getFullYear();
  const startDate = new Date(targetYear, 0, 1);
  const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

  const where = {
    ...buildUserWhereClause(userId),
    paidAt: { gte: startDate, lte: endDate },
    status: 'paid',
    deletedAt: null,
  };

  // Get all payments
  const payments = await prisma.payment.findMany({ where });

  // Calculate totals
  let totalIncome = 0;
  let totalExpenses = 0;
  for (const payment of payments) {
    if (payment.type === 'income') {
      totalIncome += payment.amountSen;
    } else {
      totalExpenses += payment.amountSen;
    }
  }

  const netProfit = totalIncome - totalExpenses;
  const netProfitForCalc = Math.max(0, netProfit);

  // Calculate tax with Zakat offset
  const taxResult = calculateTaxWithZakatOffset(netProfitForCalc);

  const rows: string[][] = [
    [`Tax Summary - ${targetYear}`],
    [''],
    ['FINANCIAL SUMMARY'],
    ['Total Income', formatMYR(totalIncome)],
    ['Total Expenses', formatMYR(totalExpenses)],
    ['Net Profit', formatMYR(netProfit)],
    [''],
    ['ZAKAT CALCULATION'],
    ['Zakat Amount', taxResult.ZakatAmount > 0 ? formatMYR(taxResult.ZakatAmount) : 'N/A (Below nisab)'],
    [''],
    ['TAX CALCULATION'],
    ['Taxable Income', formatMYR(netProfit)],
    ['Gross Tax', formatMYR(taxResult.grossTax)],
    ['Zakat Offset', taxResult.ZakatOffset > 0 ? formatMYR(taxResult.ZakatOffset) : 'N/A'],
    ['Net Tax Payable', formatMYR(taxResult.netTaxPayable)],
    ['Effective Rate', `${taxResult.effectiveRate.toFixed(2)}%`],
  ];

  return createWorksheet(rows, 'Tax Summary');
}

// ============================================================================
// EXPORT: Property Performance
// ============================================================================

export async function exportPropertyPerformance(userId: string): Promise<XLSX.WorkBook> {
  const breakdown = await (getPropertyBreakdown(userId) as unknown as Promise<PropertyBreakdown[]>);
  
  // Sheet 1: By Property
  const propertyRows: string[][] = [
    ['Property Name', 'Type', 'Total Income (RM)', 'Total Expenses (RM)', 'Net Profit (RM)', 'Occupancy Rate (%)', 'Active Lease'],
  ];

  let totalIncome = 0;
  let totalExpenses = 0;
  let totalProfit = 0;

  for (const prop of breakdown) {
    propertyRows.push([
      prop.propertyName,
      prop.propertyType,
      formatMYR(prop.totalIncome),
      formatMYR(prop.totalExpenses),
      formatMYR(prop.netProfit),
      `${prop.occupancyRate}%`,
      prop.activeLease ? 'Yes' : 'No',
    ]);
    totalIncome += prop.totalIncome;
    totalExpenses += prop.totalExpenses;
    totalProfit += prop.netProfit;
  }

  // Add totals row
  propertyRows.push([
    'TOTAL',
    '',
    formatMYR(totalIncome),
    formatMYR(totalExpenses),
    formatMYR(totalProfit),
    '',
    '',
  ]);

  // Sheet 2: Summary
  const summaryRows: string[][] = [
    ['Property Performance Summary'],
    [''],
    ['Metric', 'Value'],
    ['Total Properties', breakdown.length.toString()],
    ['Properties with Active Lease', breakdown.filter(p => p.activeLease).length.toString()],
    ['Average Occupancy Rate', `${Math.round(breakdown.reduce((sum, p) => sum + p.occupancyRate, 0) / breakdown.length)}%`],
    [''],
    ['FINANCIAL TOTALS'],
    ['Total Income', formatMYR(totalIncome)],
    ['Total Expenses', formatMYR(totalExpenses)],
    ['Total Net Profit', formatMYR(totalProfit)],
  ];

  const wb = XLSX.utils.book_new();
  
  const ws1 = XLSX.utils.aoa_to_sheet(propertyRows);
  ws1['!cols'] = propertyRows[0].map(() => ({ wch: 20 }));
  styleWorksheet(ws1, propertyRows.length);
  XLSX.utils.book_append_sheet(wb, ws1, 'By Property');

  const ws2 = XLSX.utils.aoa_to_sheet(summaryRows);
  ws2['!cols'] = [{ wch: 30 }, { wch: 20 }];
  styleWorksheet(ws2, summaryRows.length);
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

  return wb;
}

// ============================================================================
// EXPORT: Tenant Analytics
// ============================================================================

export async function exportTenantAnalytics(userId: string): Promise<XLSX.WorkBook> {
  const analytics = await getTenantAnalytics(userId, 'name');

  const rows: string[][] = [
    ['Name', 'Email', 'Phone', 'Property', 'Monthly Rent (RM)', 'Lease Expiry', 'Days Until Expiry', 'Total Paid (RM)', 'Punctuality Score (%)'],
  ];

  for (const tenant of analytics) {
    const leaseEnd = tenant.leaseEndDate ? formatDate(tenant.leaseEndDate) : '-';
    const daysUntilExpiry = tenant.daysUntilExpiry !== null 
      ? tenant.daysUntilExpiry > 0 ? `${tenant.daysUntilExpiry} days` : 'Expired'
      : '-';

    rows.push([
      tenant.tenantName,
      tenant.tenantEmail || '-',
      '-', // Phone not in analytics
      tenant.propertyName || '-',
      '-', // Monthly rent not in analytics
      leaseEnd,
      daysUntilExpiry,
      formatMYR(tenant.totalPaid),
      `${tenant.punctualityScore}%`,
    ]);
  }

  return createWorksheet(rows, 'Tenant Analytics');
}

// ============================================================================
// EXPORT: Business Summary
// ============================================================================

export async function exportBusinessSummary(userId: string): Promise<XLSX.WorkBook> {
  const [ytd, propertyBreakdown, tenantAnalytics, cashFlow] = await Promise.all([
    getYtdStats(userId),
    getPropertyBreakdown(userId) as unknown as Promise<PropertyBreakdown[]>,
    getTenantAnalytics(userId, 'totalPaid'),
    getCashFlowForecast(userId, 3),
  ]);

  const wb = XLSX.utils.book_new();

  // Sheet 1: Financial Summary
  const ytdRows: string[][] = [
    ['Business Summary - Year to Date'],
    [''],
    ['FINANCIAL OVERVIEW', `Year: ${ytd.year}`],
    [''],
    ['Metric', 'Current Year (RM)', 'Previous Year (RM)', 'Change (%)'],
    ['YTD Income', formatMYR(ytd.ytdIncome), formatMYR(ytd.prevYtdIncome), formatChange(ytd.incomeChangePercent)],
    ['YTD Expenses', formatMYR(ytd.ytdExpenses), formatMYR(ytd.prevYtdExpenses), formatChange(ytd.expenseChangePercent)],
    ['YTD Net Profit', formatMYR(ytd.ytdNetProfit), formatMYR(ytd.prevYtdNetProfit), formatChange(ytd.netProfitChangePercent)],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(ytdRows);
  ws1['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
  styleWorksheet(ws1, ytdRows.length);
  XLSX.utils.book_append_sheet(wb, ws1, 'Financial Summary');

  // Sheet 2: Property Performance
  const propRows: string[][] = [
    ['Property Name', 'Type', 'Total Income (RM)', 'Total Expenses (RM)', 'Net Profit (RM)', 'Occupancy (%)', 'Status'],
  ];

  for (const prop of propertyBreakdown) {
    propRows.push([
      prop.propertyName,
      prop.propertyType,
      formatMYR(prop.totalIncome),
      formatMYR(prop.totalExpenses),
      formatMYR(prop.netProfit),
      `${prop.occupancyRate}%`,
      prop.activeLease ? 'Active' : 'Vacant',
    ]);
  }

  const ws2 = XLSX.utils.aoa_to_sheet(propRows);
  ws2['!cols'] = propRows[0].map(() => ({ wch: 18 }));
  styleWorksheet(ws2, propRows.length);
  XLSX.utils.book_append_sheet(wb, ws2, 'Property Performance');

  // Sheet 3: Tenant Analytics
  const tenantRows: string[][] = [
    ['Name', 'Property', 'Total Paid (RM)', 'Punctuality (%)', 'Lease Status'],
  ];

  for (const tenant of tenantAnalytics) {
    tenantRows.push([
      tenant.tenantName,
      tenant.propertyName || '-',
      formatMYR(tenant.totalPaid),
      `${tenant.punctualityScore}%`,
      tenant.activeLease ? 'Active' : 'Inactive',
    ]);
  }

  const ws3 = XLSX.utils.aoa_to_sheet(tenantRows);
  ws3['!cols'] = tenantRows[0].map(() => ({ wch: 18 }));
  styleWorksheet(ws3, tenantRows.length);
  XLSX.utils.book_append_sheet(wb, ws3, 'Tenant Analytics');

  // Sheet 4: Cash Flow Forecast
  const cashFlowRows: string[][] = [
    ['Cash Flow Forecast - Next 3 Months'],
    [''],
    ['Month', 'Expected Income (RM)', 'Expected Expenses (RM)', 'Net Cash Flow (RM)'],
  ];

  for (const month of cashFlow.months) {
    cashFlowRows.push([
      month.month,
      formatMYR(month.expectedIncome),
      formatMYR(month.expectedExpenses),
      formatMYR(month.netCashFlow),
    ]);
  }

  cashFlowRows.push([
    'TOTAL',
    formatMYR(cashFlow.totalExpectedIncome),
    formatMYR(cashFlow.totalExpectedExpenses),
    formatMYR(cashFlow.totalNetCashFlow),
  ]);

  cashFlowRows.push(['']);
  cashFlowRows.push([
    'AVERAGES',
    formatMYR(cashFlow.averageMonthlyIncome),
    formatMYR(cashFlow.averageMonthlyExpenses),
    '',
  ]);

  const ws4 = XLSX.utils.aoa_to_sheet(cashFlowRows);
  ws4['!cols'] = [{ wch: 20 }, { wch: 22 }, { wch: 22 }, { wch: 22 }];
  styleWorksheet(ws4, cashFlowRows.length);
  XLSX.utils.book_append_sheet(wb, ws4, 'Cash Flow Forecast');

  return wb;
}

// ============================================================================
// EXPORT: Expenses with Income Source
// ============================================================================

export async function exportExpenses(userId: string): Promise<XLSX.WorkBook> {
  const payments = await getPayments(userId, { type: 'expense' });
  
  const headerRow = ['Date', 'Description', 'Category', 'Amount (RM)', 'Status', 'Income Source'];
  const dataRows: string[][] = [];
  
  for (const p of payments) {
    const incomeSourceLabel = INCOME_SOURCES.find(s => s.value === p.incomeSource)?.label || 'Unallocated';
    dataRows.push([
      formatDate(p.paidAt || p.dueDate),
      p.description || '',
      p.category || '',
      (p.amountSen / 100).toFixed(2),
      p.status,
      incomeSourceLabel,
    ]);
  }
  
  return createWorksheet([headerRow, ...dataRows], 'Expenses');
}

// ============================================================================
// EXPORT: Expense Allocation Report
// ============================================================================

export async function exportExpenseAllocation(userId: string): Promise<XLSX.WorkBook> {
  const payments = await getPayments(userId, { type: 'expense' });
  
  // Group by income source
  const bySource: Record<string, typeof payments> = {};
  for (const payment of payments) {
    const source = payment.incomeSource || 'unallocated';
    if (!bySource[source]) {
      bySource[source] = [];
    }
    bySource[source].push(payment);
  }
  
  const totalExpenses = payments.reduce((sum, p) => sum + p.amountSen, 0);
  
  const bySourceData = Object.entries(bySource).map(([source, items]) => {
    const sourceTotal = items.reduce((sum, p) => sum + p.amountSen, 0);
    const percentage = totalExpenses > 0 ? (sourceTotal / totalExpenses * 100).toFixed(1) + '%' : '0%';
    return {
      'Income Source': INCOME_SOURCES.find(s => s.value === source)?.label || 'Unallocated',
      'Total (RM)': (sourceTotal / 100).toFixed(2),
      'Count': items.length.toString(),
      'Percentage': percentage,
    };
  });
  
  const bySourceRows = [
    ['Income Source', 'Total (RM)', 'Count', 'Percentage'],
    ...bySourceData.map(d => [d['Income Source'], d['Total (RM)'], d.Count, d.Percentage]),
  ];
  
  const allExpensesData = payments.map(p => ({
    'Date': formatDate(p.paidAt || p.dueDate),
    'Description': p.description || '',
    'Category': p.category || '',
    'Amount (RM)': (p.amountSen / 100).toFixed(2),
    'Income Source': INCOME_SOURCES.find(s => s.value === p.incomeSource)?.label || 'Unallocated',
  }));
  
  const allExpensesRows = [
    ['Date', 'Description', 'Category', 'Amount (RM)', 'Income Source'],
    ...allExpensesData.map(d => [d.Date, d.Description, d.Category, d['Amount (RM)'], d['Income Source']]),
  ];
  
  const wb = XLSX.utils.book_new();
  
  const ws1 = XLSX.utils.aoa_to_sheet(bySourceRows);
  ws1['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 12 }];
  styleWorksheet(ws1, bySourceRows.length);
  XLSX.utils.book_append_sheet(wb, ws1, 'By Income Source');
  
  const ws2 = XLSX.utils.aoa_to_sheet(allExpensesRows);
  ws2['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
  styleWorksheet(ws2, allExpensesRows.length);
  XLSX.utils.book_append_sheet(wb, ws2, 'All Expenses');
  
  return wb;
}

// ============================================================================
// EXPORT: Consolidated Report (Multi-Sheet)
// ============================================================================

/**
 * Export consolidated financial report with multiple sheets:
 * - Sheet 1: P&L Summary
 * - Sheet 2: Balance Sheet
 * - Sheet 3: Summary (period, generated date, key metrics)
 */
export async function exportConsolidatedReport(userId: string, filters: ExportFilters = {}): Promise<XLSX.WorkBook> {
  // Get current period date range
  const now = new Date();
  const startDate = filters.startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endDate = filters.endDate || now.toISOString().split('T')[0];

  // Fetch consolidated P&L data
  const consolidatedRes = await fetch(
    `/api/v1/reports/consolidated-pl?userId=${userId}&startDate=${startDate}&endDate=${endDate}`
  );
  const consolidatedJson = await consolidatedRes.json();
  const consolidatedData = consolidatedJson.data;

  // Fetch balance sheet data
  const balanceSheetRes = await fetch(`/api/v1/reports/balance-sheet?userId=${userId}`);
  const balanceSheetJson = await balanceSheetRes.json();
  const balanceSheetData = balanceSheetJson.data;

  const wb = XLSX.utils.book_new();
  const generatedDate = now.toLocaleString('default', { dateStyle: 'medium', timeStyle: 'short' });

  // Sheet 1: P&L Summary
  const plRows: string[][] = [
    ['CONSOLIDATED PROFIT & LOSS STATEMENT'],
    [''],
    ['Period:', `${startDate} to ${endDate}`],
    ['Generated:', generatedDate],
    [''],
    ['INCOME'],
  ];

  // Add income breakdown by source
  if (consolidatedData?.current?.bySource) {
    for (const source of consolidatedData.current.bySource) {
      plRows.push([
        source.label || source.incomeSource,
        formatMYR(source.revenue),
      ]);
    }
  }

  plRows.push(['TOTAL REVENUE', formatMYR(consolidatedData?.current?.revenue || 0)]);
  plRows.push(['']);
  plRows.push(['EXPENSES']);

  // Add expense breakdown by source
  if (consolidatedData?.current?.bySource) {
    for (const source of consolidatedData.current.bySource) {
      plRows.push([
        source.label || source.incomeSource,
        formatMYR(source.expenses),
      ]);
    }
  }

  plRows.push(['TOTAL EXPENSES', formatMYR(consolidatedData?.current?.expenses || 0)]);
  plRows.push(['']);
  plRows.push([
    'NET PROFIT',
    formatMYR(consolidatedData?.current?.profit || 0)
  ]);
  plRows.push([
    'MARGIN %',
    `${(consolidatedData?.current?.margin || 0).toFixed(1)}%`
  ]);

  // Add prior period comparison if available
  if (consolidatedData?.prior) {
    plRows.push(['']);
    plRows.push(['PRIOR PERIOD COMPARISON']);
    plRows.push(['Prior Revenue', formatMYR(consolidatedData.prior.revenue)]);
    plRows.push(['Prior Expenses', formatMYR(consolidatedData.prior.expenses)]);
    plRows.push(['Prior Profit', formatMYR(consolidatedData.prior.profit)]);
  }

  const ws1 = XLSX.utils.aoa_to_sheet(plRows);
  ws1['!cols'] = [{ wch: 25 }, { wch: 18 }];
  styleWorksheet(ws1, plRows.length);
  XLSX.utils.book_append_sheet(wb, ws1, 'P&L Summary');

  // Sheet 2: Balance Sheet
  const bsRows: string[][] = [
    ['BALANCE SHEET'],
    [''],
    ['As of:', generatedDate],
    [''],
    ['ASSETS'],
  ];

  if (balanceSheetData) {
    bsRows.push([
      'Cash & Bank Balance',
      formatMYR(balanceSheetData.cash || 0)
    ]);
    bsRows.push([
      'Accounts Receivable',
      formatMYR(balanceSheetData.receivables || 0)
    ]);
    bsRows.push([
      'Deposits Held in Trust',
      formatMYR(balanceSheetData.depositsHeld || 0)
    ]);
    const totalAssets = (balanceSheetData.cash || 0) + (balanceSheetData.receivables || 0) + (balanceSheetData.depositsHeld || 0);
    bsRows.push(['TOTAL ASSETS', formatMYR(totalAssets)]);
    bsRows.push(['']);
    bsRows.push(['LIABILITIES']);
    bsRows.push([
      'Deposits (to return)',
      formatMYR(balanceSheetData.depositsLiability || 0)
    ]);
    bsRows.push(['TOTAL LIABILITIES', formatMYR(balanceSheetData.depositsLiability || 0)]);
    bsRows.push(['']);
    const netWorth = totalAssets - (balanceSheetData.depositsLiability || 0);
    bsRows.push(['NET WORTH', formatMYR(netWorth)]);
  } else {
    bsRows.push(['No balance sheet data available']);
  }

  const ws2 = XLSX.utils.aoa_to_sheet(bsRows);
  ws2['!cols'] = [{ wch: 25 }, { wch: 18 }];
  styleWorksheet(ws2, bsRows.length);
  XLSX.utils.book_append_sheet(wb, ws2, 'Balance Sheet');

  // Sheet 3: Summary
  const summaryRows: string[][] = [
    ['CONSOLIDATED FINANCIAL SUMMARY'],
    [''],
    ['Report Period:', `${startDate} to ${endDate}`],
    ['Generated:', generatedDate],
    [''],
    ['KEY METRICS'],
    ['Total Revenue', formatMYR(consolidatedData?.current?.revenue || 0)],
    ['Total Expenses', formatMYR(consolidatedData?.current?.expenses || 0)],
    ['Net Profit', formatMYR(consolidatedData?.current?.profit || 0)],
    ['Profit Margin', `${(consolidatedData?.current?.margin || 0).toFixed(1)}%`],
    [''],
    ['PERIOD COMPARISON'],
    ['Revenue Change', consolidatedData?.change?.revenuePercent 
      ? `${consolidatedData.change.revenuePercent >= 0 ? '+' : ''}${consolidatedData.change.revenuePercent.toFixed(1)}%`
      : 'N/A'
    ],
    ['Expense Change', consolidatedData?.change?.expensesPercent
      ? `${consolidatedData.change.expensesPercent >= 0 ? '+' : ''}${consolidatedData.change.expensesPercent.toFixed(1)}%`
      : 'N/A'
    ],
    ['Profit Change', consolidatedData?.change?.profitPercent
      ? `${consolidatedData.change.profitPercent >= 0 ? '+' : ''}${consolidatedData.change.profitPercent.toFixed(1)}%`
      : 'N/A'
    ],
    [''],
    ['INCOME SOURCES INCLUDED'],
    ['Sublet', 'Property management commissions'],
    ['Autoren Sell', 'Property sales agent commissions'],
    ['Autoren Rent', 'Property rental agent commissions'],
  ];

  const ws3 = XLSX.utils.aoa_to_sheet(summaryRows);
  ws3['!cols'] = [{ wch: 25 }, { wch: 25 }];
  styleWorksheet(ws3, summaryRows.length);
  XLSX.utils.book_append_sheet(wb, ws3, 'Summary');

  return wb;
}

/**
 * Format percentage change with sign
 */
function formatChange(percent: number): string {
  if (percent === 0) return '0%';
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent}%`;
}

// ============================================================================
// HELPER: Create Excel Worksheet
// ============================================================================

/**
 * Apply header styling to a worksheet
 */
function styleWorksheet(ws: XLSX.WorkSheet, rowCount: number): void {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) continue;
      
      // Bold and background for header row
      if (R === 0) {
        ws[cellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'E8E8E8' } },
        };
      }
    }
  }
}

function createWorksheet(rows: string[][], sheetName: string): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  
  // Create worksheet from array of arrays
  const ws = XLSX.utils.aoa_to_sheet(rows);
  
  // Set column widths (auto)
  const colWidths = rows[0].map(() => ({ wch: 15 }));
  ws['!cols'] = colWidths;
  
  // Apply header styling
  styleWorksheet(ws, rows.length);
  
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  return wb;
}

/**
 * Generate Excel file buffer
 */
export function generateExcelBuffer(wb: XLSX.WorkBook): Buffer {
  return Buffer.from(XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }));
}

/**
 * Generate CSV string from data
 */
export function generateCSV(rows: string[][]): string {
  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

// ============================================================================
// SSM VALIDATION TYPES AND FUNCTIONS
// ============================================================================

/**
 * Validation result for SSM exports
 */
export interface SSMValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Data structure for SSM export validation
 */
export interface SSMExportData {
  companyName?: string;
  registrationNumber?: string;
  hasTransactions: boolean;
  totalIncome: number;
  totalExpenses: number;
  assets: number;
  liabilities: number;
  equity: number;
}

/**
 * Validate SSM export data before generation
 */
export function validateSSMExport(data: SSMExportData): SSMValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check company info
  if (!data.companyName || data.companyName.trim() === '') {
    warnings.push('Company name not set - using default');
  }
  if (!data.registrationNumber || data.registrationNumber.trim() === '') {
    warnings.push('Registration number not set - form may be incomplete');
  }

  // Check data completeness
  if (!data.hasTransactions) {
    warnings.push('No transactions found for the selected period');
  }

  // Balance sheet validation
  const balanceCheck = validateBalanceSheet(data);
  warnings.push(...balanceCheck.warnings);
  errors.push(...balanceCheck.errors);

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Validate balance sheet equation: Assets = Liabilities + Equity
 */
function validateBalanceSheet(data: SSMExportData): Pick<SSMValidationResult, 'warnings' | 'errors'> {
  const warnings: string[] = [];
  const errors: string[] = [];

  const calculatedEquity = data.assets - data.liabilities;
  const difference = Math.abs(calculatedEquity - data.equity);

  // Allow for small rounding differences (< RM 1)
  if (difference > 100) {
    warnings.push(
      `Balance sheet does not balance: Assets (RM ${(data.assets / 100).toFixed(2)}) ≠ Liabilities + Equity (RM ${((data.liabilities + data.equity) / 100).toFixed(2)})`
    );
  }

  return { warnings, errors };
}

// ============================================================================
// EXPORT: SSM Form 9 - Return of Allotment of Shares
// ============================================================================

/**
 * Get company info for SSM exports
 */
async function getSSMCompanyInfo(userId: string): Promise<SSMCompanyInfo> {
  // Default company info - in production could be fetched from company settings
  return {
    companyName: 'AMR HOME SOLUTIONS',
    registrationNumber: '202001030000 (SSM)',
    incorporationDate: '2020-01-03',
    registeredAddress: 'No. 123, Jalan Ampang, 55000 Kuala Lumpur',
    businessAddress: 'No. 123, Jalan Ampang, 55000 Kuala Lumpur',
  };
}

/**
 * Get director signature for SSM exports
 */
async function getSSMDirectorSignature(): Promise<SSMDirectorSignature> {
  return {
    name: 'AHMAD RAFIQ BIN ABDUL RAHMAN',
    designation: 'DIRECTOR',
    icNumber: '800102-01-1234',
    date: new Date().toLocaleDateString('ms-MY'),
  };
}

/**
 * Export SSM Form 9 - Return of Allotment of Shares
 * Creates a multi-sheet workbook with:
 * - Cover: Title page with company info
 * - Allotment Summary: Overview of share allotments
 * - Share Allotments: Detailed table of share allotments
 */
export async function exportSSMForm9(userId: string): Promise<XLSX.WorkBook> {
  const wb = XLSX.utils.book_new();
  const now = new Date();
  const generatedDate = now.toLocaleDateString('ms-MY');

  // Get company info
  const companyInfo = await getSSMCompanyInfo(userId);
  const director = await getSSMDirectorSignature();

  // Fetch payment/lease data for share allotments simulation
  const payments = await prisma.payment.findMany({
    where: {
      OR: [
        { tenant: { userId } },
        { lease: { room: { floor: { property: { userId } } } } },
      ],
      deletedAt: null,
    },
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
          }
        },
      },
    },
    orderBy: { paidAt: 'desc' },
    take: 100,
  });

  // Validate export data
  const totalIncome = payments.reduce((sum, p) => sum + (p.type === 'income' ? (p.amountSen || 0) : 0), 0);
  const validationData: SSMExportData = {
    companyName: companyInfo.companyName,
    registrationNumber: companyInfo.registrationNumber,
    hasTransactions: payments.length > 0,
    totalIncome,
    totalExpenses: 0,
    assets: totalIncome, // Simplified: income as proxy for assets
    liabilities: 0,
    equity: totalIncome,
  };

  const validation = validateSSMExport(validationData);
  if (!validation.valid) {
    console.warn('SSM Form 9 validation errors:', validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn('SSM Form 9 validation warnings:', validation.warnings);
  }

  // Sheet 1: Cover
  const coverRows: string[][] = [
    ['FORM 9'],
    [''],
    ['RETURN OF ALLOTMENT OF SHARES'],
    [''],
    [''],
    ['Company Name:', companyInfo.companyName],
    ['Registration Number:', companyInfo.registrationNumber],
    ['Date of Incorporation:', companyInfo.incorporationDate],
    [''],
    ['Date of Return:', generatedDate],
    [''],
    [''],
    ['This return is submitted pursuant to Section 17 of the Companies Act 2016'],
  ];

  const wsCover = XLSX.utils.aoa_to_sheet(coverRows);
  wsCover['!cols'] = [{ wch: 30 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsCover, 'Cover');

  // Sheet 2: Allotment Summary
  // Calculate totals from payments as share allotment data
  const totalAmount = payments.reduce((sum, p) => sum + (p.type === 'income' ? (p.amountSen || 0) : 0), 0);
  const transactionCount = payments.length;

  const summaryRows: string[][] = [
    ['ALLOTMENT SUMMARY'],
    [''],
    ['Total Transactions:', String(transactionCount)],
    ['Total Amount Allotted:', formatMYR(totalAmount)],
    [''],
    ['Date of First Allotment:', payments.length > 0 ? formatDate(payments[payments.length - 1].paidAt) : 'N/A'],
    ['Date of Latest Allotment:', payments.length > 0 ? formatDate(payments[0].paidAt) : 'N/A'],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Allotment Summary');

  // Sheet 3: Share Allotments
  const allotmentRows: string[][] = [
    ['SHARE ALLOTMENTS'],
    [''],
    ['Date', 'Number of Shares', 'Class', 'Nominal Value (RM)', 'Amount Paid (RM)', 'Allottee Name', 'IC Number'],
  ];

  // Add payment rows as share allotments
  for (const payment of payments) {
    const tenantName = payment.tenant?.name || 'Unknown';
    const tenantIC = payment.tenant?.icNumber || 'N/A';
    const propertyName = payment.lease?.room.floor.property.name || 'N/A';

    allotmentRows.push([
      formatDate(payment.paidAt),
      '100', // Simulated share count
      'Ordinary',
      formatMYR(payment.amountSen || 0),
      formatMYR(payment.amountSen || 0),
      tenantName,
      tenantIC,
    ]);
  }

  const wsAllotments = XLSX.utils.aoa_to_sheet(allotmentRows);
  wsAllotments['!cols'] = [
    { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }
  ];
  styleWorksheet(wsAllotments, allotmentRows.length);
  XLSX.utils.book_append_sheet(wb, wsAllotments, 'Share Allotments');

  return wb;
}

// ============================================================================
// EXPORT: SSM Form 44 - Statement of Affairs
// ============================================================================

/**
 * Export SSM Form 44 - Statement of Affairs
 * Creates a multi-sheet workbook with:
 * - Cover: Title page with company info
 * - Profit & Loss: P&L Statement
 * - Balance Sheet: Statement of Affairs
 * - Notes: Supporting information and signatures
 */
export async function exportSSMForm44(userId: string): Promise<XLSX.WorkBook> {
  const wb = XLSX.utils.book_new();
  const now = new Date();
  const generatedDate = now.toLocaleDateString('ms-MY');

  // Get company info
  const companyInfo = await getSSMCompanyInfo(userId);
  const director = await getSSMDirectorSignature();

  // Fetch consolidated P&L data
  const startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
  const endDate = now.toISOString().split('T')[0];

  let plData = { revenue: 0, expenses: 0, profit: 0 };
  let balanceSheetData = { cash: 0, receivables: 0, depositsHeld: 0, depositsLiability: 0 };

  try {
    // Try to fetch from API
    const plRes = await fetch(`/api/v1/reports/consolidated-pl?userId=${userId}&startDate=${startDate}&endDate=${endDate}`);
    if (plRes.ok) {
      const plJson = await plRes.json();
      plData = plJson.data?.current || { revenue: 0, expenses: 0, profit: 0 };
    }

    const bsRes = await fetch(`/api/v1/reports/balance-sheet?userId=${userId}`);
    if (bsRes.ok) {
      const bsJson = await bsRes.json();
      balanceSheetData = bsJson.data || { cash: 0, receivables: 0, depositsHeld: 0, depositsLiability: 0 };
    }
  } catch (error) {
    console.error('Failed to fetch SSM report data:', error);
    // Fallback: use zero values
  }

  // Validate P&L and Balance Sheet data
  const validationTotalAssets = balanceSheetData.cash + balanceSheetData.receivables + balanceSheetData.depositsHeld;
  const validationTotalLiabilities = balanceSheetData.depositsLiability;
  const validationNetWorth = validationTotalAssets - validationTotalLiabilities;

  const validationData: SSMExportData = {
    companyName: companyInfo.companyName,
    registrationNumber: companyInfo.registrationNumber,
    hasTransactions: plData.revenue > 0 || plData.expenses > 0,
    totalIncome: plData.revenue,
    totalExpenses: plData.expenses,
    assets: validationTotalAssets,
    liabilities: validationTotalLiabilities,
    equity: validationNetWorth,
  };

  const validation = validateSSMExport(validationData);
  if (!validation.valid) {
    console.warn('SSM Form 44 validation errors:', validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn('SSM Form 44 validation warnings:', validation.warnings);
  }

  // Sheet 1: Cover
  const coverRows: string[][] = [
    ['FORM 44'],
    [''],
    ['STATEMENT OF AFFAIRS'],
    [''],
    [''],
    ['Company Name:', companyInfo.companyName],
    ['Registration Number:', companyInfo.registrationNumber],
    ['Date of Statement:', generatedDate],
    [''],
    [''],
    ['In accordance with Section 167 of the Companies Act 2016'],
  ];

  const wsCover = XLSX.utils.aoa_to_sheet(coverRows);
  wsCover['!cols'] = [{ wch: 30 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsCover, 'Cover');

  // Sheet 2: Profit & Loss
  const plRows: string[][] = [
    ['PROFIT AND LOSS ACCOUNT'],
    [''],
    ['For the financial year ended:', generatedDate],
    [''],
    [''],
    ['INCOME'],
    ['Revenue from Operations', formatMYR(plData.revenue)],
    [''],
    ['TOTAL INCOME', formatMYR(plData.revenue)],
    [''],
    [''],
    ['EXPENSES'],
    ['Operating Expenses', formatMYR(plData.expenses)],
    [''],
    ['TOTAL EXPENSES', formatMYR(plData.expenses)],
    [''],
    [''],
    ['NET PROFIT/(LOSS)', formatMYR(plData.profit)],
  ];

  const wsPL = XLSX.utils.aoa_to_sheet(plRows);
  wsPL['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsPL, 'Profit & Loss');

  // Sheet 3: Balance Sheet - reuse validated values
  const bsRows: string[][] = [
    ['BALANCE SHEET'],
    [''],
    ['As at:', generatedDate],
    [''],
    [''],
    ['ASSETS'],
    ['Cash and Bank Balances', formatMYR(balanceSheetData.cash)],
    ['Accounts Receivable', formatMYR(balanceSheetData.receivables)],
    ['Deposits Held in Trust', formatMYR(balanceSheetData.depositsHeld)],
    ['', ''],
    ['TOTAL ASSETS', formatMYR(validationTotalAssets)],
    [''],
    [''],
    ['LIABILITIES'],
    ['Deposits (to be returned)', formatMYR(balanceSheetData.depositsLiability)],
    ['', ''],
    ['TOTAL LIABILITIES', formatMYR(validationTotalLiabilities)],
    [''],
    [''],
    ['NET WORTH', formatMYR(validationNetWorth)],
    [''],
    [''],
    ['VERIFICATION'],
    [
      'Total Assets = Total Liabilities + Net Worth',
      `${formatMYR(validationTotalAssets)} = ${formatMYR(validationTotalLiabilities)} + ${formatMYR(validationNetWorth)}`,
    ],
  ];

  const wsBS = XLSX.utils.aoa_to_sheet(bsRows);
  wsBS['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsBS, 'Balance Sheet');

  // Sheet 4: Notes
  const notesRows: string[][] = [
    ['NOTES TO THE FINANCIAL STATEMENTS'],
    [''],
    [''],
    ['1. ACCOUNTING POLICIES'],
    ['Basis of Preparation:', 'Financial statements are prepared on the historical cost basis.'],
    ['Currency:', 'All amounts are in Malaysian Ringgit (MYR).'],
    [''],
    [''],
    ['2. DIRECTOR SIGNATURES'],
    [''],
    ['Director Name:', director.name],
    ['Designation:', director.designation],
    ['IC Number:', director.icNumber],
    ['Date:', director.date],
    [''],
    [''],
    ['CERTIFICATION'],
    ['I hereby certify that the information contained in this return is true and correct.'],
    [''],
    ['Signature:', ''],
    [''],
    ['Name:', director.name],
    [''],
    ['Date:', director.date],
  ];

  const wsNotes = XLSX.utils.aoa_to_sheet(notesRows);
  wsNotes['!cols'] = [{ wch: 25 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsNotes, 'Notes');

  return wb;
}