import { getSession } from '@/lib/auth';

/**
 * Financial Reports Page
 * 
 * Provides export options for financial reports including:
 * - Transaction Reports: All Transactions, By Tenant, By Property, Bills
 * - Accounting Reports: LHDN, P&L, Balance Sheet, Cash Book
 * - P&L with Zakat Calculator
 * - Tax Calculation with Zakat Offset
 * - Business Analytics: Property Performance, Tenant Analytics, Business Summary
 */

import { getProperties } from '@/services/property-service';
import { getTenants } from '@/services/tenant-service';
import { getProfitLoss } from '@/services/profit-loss-service';
import { ExportButton, FORMAT_LABELS } from '@/components/reports/export-button';
import { Building } from 'lucide-react';
import { ProfitLossStatement } from '@/components/reports/profit-loss-statement';
import { TaxSummary } from '@/components/reports/tax-summary';
import { PropertyPerformanceReport } from '@/components/reports/property-performance-report';
import { TenantAnalyticsReport } from '@/components/reports/tenant-analytics-report';
import { BusinessSummaryReport } from '@/components/reports/business-summary-report';
import { getTaxWithOffset } from '@/lib/tax-offset';

export default async function ReportsPage() {
  // TODO: Get userId from session
  const session = await getSession();
  const userId = session?.user.id;

  if (!userId) {
    return <div className="container py-8"><p>Please sign in to view reports.</p></div>;
  }
  
  // Fetch properties and tenants for filter options
  const properties = await getProperties(userId);
  const tenants = await getTenants(userId);

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <p className="text-muted-foreground mt-1">
          Export financial data in various formats for accounting and compliance.
        </p>
      </div>

      {/* Transaction Reports */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Transaction Reports</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          
          {/* All Transactions */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-1">{FORMAT_LABELS.transactions}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Export all income and expense transactions with filtering options.
            </p>
            <form action="/api/v1/export" method="GET" target="_blank">
              <input type="hidden" name="format" value="transactions" />
              <input type="hidden" name="period" value="this-year" />
              <ExportButton format="transactions" label="Export" />
            </form>
          </div>

          {/* By Tenant */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-1">{FORMAT_LABELS['by-tenant']}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Export payment history for a specific tenant.
            </p>
            <ExportButton 
              format="by-tenant" 
              filters={{ tenantId: tenants[0]?.id }}
              disabled={tenants.length === 0}
            />
            {tenants.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">No tenants available</p>
            )}
          </div>

          {/* By Property */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-1">{FORMAT_LABELS['by-property']}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Export income summary for a specific property.
            </p>
            <ExportButton 
              format="by-property"
              filters={{ propertyId: properties[0]?.id }}
              disabled={properties.length === 0}
            />
            {properties.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">No properties available</p>
            )}
          </div>

          {/* Bills Summary */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-1">{FORMAT_LABELS.bills}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Export utility bills: TNB, SYABAS, Internet, IWK.
            </p>
            <form action="/api/v1/export" method="GET" target="_blank">
              <input type="hidden" name="format" value="bills" />
              <input type="hidden" name="period" value="this-year" />
              <ExportButton format="bills" label="Export" />
            </form>
          </div>
        </div>
      </section>

      {/* Accounting Reports */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Accounting Reports</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          
          {/* LHDN Report */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-1">{FORMAT_LABELS.lhdn}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              LHDN Perbent 2024 format with tenant IC numbers for tax reporting.
            </p>
            <form action="/api/v1/export" method="GET" target="_blank">
              <input type="hidden" name="format" value="lhdn" />
              <ExportButton format="lhdn" label="Export LHDN" />
            </form>
          </div>

          {/* Profit & Loss */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-1">{FORMAT_LABELS['profit-loss']}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Annual P&L statement with income and expense breakdown.
            </p>
            <ExportButton 
              format="profit-loss" 
              filters={{ year: currentYear.toString() }}
            />
          </div>

          {/* Balance Sheet */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-1">{FORMAT_LABELS['balance-sheet']}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Assets, liabilities, and net worth summary.
            </p>
            <form action="/api/v1/export" method="GET" target="_blank">
              <input type="hidden" name="format" value="balance-sheet" />
              <ExportButton format="balance-sheet" label="Export" />
            </form>
          </div>

          {/* Cash Book */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-1">{FORMAT_LABELS['cash-book']}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Cash receipts and payments with running balance.
            </p>
            <form action="/api/v1/export" method="GET" target="_blank">
              <input type="hidden" name="format" value="cash-book" />
              <input type="hidden" name="period" value="this-year" />
              <ExportButton format="cash-book" label="Export" />
            </form>
          </div>

          {/* Tax Summary */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-1">{FORMAT_LABELS['tax-summary']}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tax calculation with Zakat offset for the year.
            </p>
            <ExportButton 
              format="tax-summary" 
              filters={{ year: currentYear.toString() }}
            />
          </div>
        </div>
      </section>

      {/* P&L with Zakat Calculator */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Profit & Loss with Zakat</h2>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-4">
            View your annual profit & loss statement with Zakat perniagaan calculation.
            Zakat is calculated at 2.5% of net profit exceeding RM 20,000 nisab threshold.
          </p>
          <ProfitLossStatement data={await getProfitLoss(userId, currentYear)} />
        </div>
      </section>

      {/* Tax Calculation with Zakat Offset */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Tax Calculation</h2>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Calculate income tax using LHDN progressive brackets with Zakat offset.
            Under Malaysian law, Zakat paid can be deducted from income tax liability.
          </p>
          <TaxSummary 
            netProfit={(await getProfitLoss(userId, currentYear)).netProfit} 
            year={currentYear} 
          />
        </div>
      </section>

      {/* Business Analytics Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Business Analytics</h2>
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <PropertyPerformanceReport userId={userId} />
            <TenantAnalyticsReport userId={userId} />
          </div>
          <BusinessSummaryReport userId={userId} />
        </div>
      </section>

      {/* SSM Documents */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building className="h-5 w-5" />
          SSM Documents
        </h2>
        <div className="border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Export company documents for SSM (Companies Commission of Malaysia) submission.
          </p>
          <div className="flex flex-wrap gap-3">
            <ExportButton 
              format="ssm-form9" 
              variant="ssm-export"
              label="SSM Form 9"
            />
            <ExportButton 
              format="ssm-form44" 
              variant="ssm-export"
              label="SSM Form 44"
            />
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-muted/50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Export Notes</h2>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• All amounts are in Malaysian Ringgit (MYR) format: RM 1,500.00</li>
          <li>• Dates follow Malaysian format: DD/MM/YYYY</li>
          <li>• Files are exported as Excel (.xlsx) format</li>
          <li>• LHDN report includes tenant IC numbers for tax compliance</li>
          <li>• Use period filters to export specific date ranges</li>
        </ul>
      </section>
    </div>
  );
}