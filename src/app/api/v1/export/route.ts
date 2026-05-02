import { NextRequest, NextResponse } from 'next/server';
import {
  exportTransactions,
  exportByTenant,
  exportByProperty,
  exportBills,
  exportLHDN,
  exportProfitLoss,
  exportBalanceSheet,
  exportCashBook,
  exportTaxSummary,
  exportPropertyPerformance,
  exportTenantAnalytics,
  exportBusinessSummary,
  exportExpenses,
  exportExpenseAllocation,
  exportConsolidatedReport,
  exportSSMForm9,
  exportSSMForm44,
  generateExcelBuffer,
  type ExportFormat,
} from '@/services/export-service';
import { requireAuth } from '@/lib/auth';

const SUPPORTED_FORMATS: ExportFormat[] = [
  'transactions', 'by-tenant', 'by-property', 'bills', 'lhdn',
  'profit-loss', 'balance-sheet', 'cash-book', 'tax-summary',
  'property-performance', 'tenant-analytics', 'business-summary',
  'expenses', 'expense-allocation', 'consolidated', 'ssm-form9', 'ssm-form44',
];

const PERIODS = ['this-month', 'last-month', 'this-year', 'custom'] as const;

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.session) return auth.response;

  const userId = auth.session.user.id;
  const { searchParams } = new URL(request.url);

  const format = searchParams.get('format') as ExportFormat | null;
  if (!format || !SUPPORTED_FORMATS.includes(format)) {
    return NextResponse.json(
      { error: `Invalid format. Supported: ${SUPPORTED_FORMATS.join(', ')}` },
      { status: 400 }
    );
  }

  const period = searchParams.get('period') as typeof PERIODS[number] | null;
  const filters: { startDate?: string; endDate?: string; tenantId?: string; propertyId?: string; year?: string } = {};

  const now = new Date();

  switch (period) {
    case 'this-month':
      filters.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      filters.endDate = now.toISOString().split('T')[0];
      break;
    case 'last-month':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      filters.startDate = lastMonth.toISOString().split('T')[0];
      filters.endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      break;
    case 'this-year':
      filters.startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      filters.endDate = now.toISOString().split('T')[0];
      break;
    case 'custom':
      filters.startDate = searchParams.get('startdate') || undefined;
      filters.endDate = searchParams.get('enddate') || undefined;
      break;
  }

  if (searchParams.get('tenantId')) filters.tenantId = searchParams.get('tenantId')!;
  if (searchParams.get('propertyId')) filters.propertyId = searchParams.get('propertyId')!;
  if (searchParams.get('year')) filters.year = searchParams.get('year')!;

  try {
    let workbook;
    let filename: string;

    switch (format) {
      case 'transactions':
        workbook = await exportTransactions(userId, filters);
        filename = `transactions-${now.toISOString().split('T')[0]}.xlsx`;
        break;
      case 'by-tenant':
        if (!filters.tenantId) return NextResponse.json({ error: 'tenantId is required for by-tenant format' }, { status: 400 });
        workbook = await exportByTenant(userId, filters.tenantId);
        filename = `tenant-payments-${filters.tenantId}.xlsx`;
        break;
      case 'by-property':
        if (!filters.propertyId) return NextResponse.json({ error: 'propertyId is required for by-property format' }, { status: 400 });
        workbook = await exportByProperty(userId, filters.propertyId);
        filename = `property-summary-${filters.propertyId}.xlsx`;
        break;
      case 'bills':
        workbook = await exportBills(userId, filters);
        filename = `bills-${now.toISOString().split('T')[0]}.xlsx`;
        break;
      case 'lhdn':
        workbook = await exportLHDN(userId, filters);
        filename = `lhdn-report-${now.toISOString().split('T')[0]}.xlsx`;
        break;
      case 'profit-loss':
        workbook = await exportProfitLoss(userId, filters.year);
        filename = `profit-loss-${filters.year || now.getFullYear()}.xlsx`;
        break;
      case 'balance-sheet':
        workbook = await exportBalanceSheet(userId);
        filename = `balance-sheet-${now.toISOString().split('T')[0]}.xlsx`;
        break;
      case 'cash-book':
        workbook = await exportCashBook(userId, filters);
        filename = `cashbook-${now.toISOString().split('T')[0]}.xlsx`;
        break;
      case 'tax-summary':
        workbook = await exportTaxSummary(userId, filters.year);
        filename = `tax-summary-${filters.year || now.getFullYear()}.xlsx`;
        break;
      case 'property-performance':
        workbook = await exportPropertyPerformance(userId);
        filename = `property-performance-${now.toISOString().split('T')[0]}.xlsx`;
        break;
      case 'tenant-analytics':
        workbook = await exportTenantAnalytics(userId);
        filename = `tenant-analytics-${now.toISOString().split('T')[0]}.xlsx`;
        break;
      case 'business-summary':
        workbook = await exportBusinessSummary(userId);
        filename = `business-summary-${now.toISOString().split('T')[0]}.xlsx`;
        break;
      case 'expenses':
        workbook = await exportExpenses(userId);
        filename = `expenses-${now.toISOString().split('T')[0]}.xlsx`;
        break;
      case 'expense-allocation':
        workbook = await exportExpenseAllocation(userId);
        filename = `expense-allocation-${now.toISOString().split('T')[0]}.xlsx`;
        break;
      case 'consolidated':
        workbook = await exportConsolidatedReport(userId, filters);
        filename = `consolidated-report-${now.toISOString().split('T')[0]}.xlsx`;
        break;
      case 'ssm-form9':
        workbook = await exportSSMForm9(userId);
        filename = `ssm-form-9-${now.toISOString().split('T')[0]}.xlsx`;
        break;
      case 'ssm-form44':
        workbook = await exportSSMForm44(userId);
        filename = `ssm-form-44-${now.toISOString().split('T')[0]}.xlsx`;
        break;
      default:
        return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

    const buffer = generateExcelBuffer(workbook);
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
