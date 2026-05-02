import { getSession } from '@/lib/auth';

/**
 * Consolidated Financials Report Page
 * 
 * Full consolidated P&L and Balance Sheet view with export options.
 * Combines all income sources (Sublet, Autoren Sell, Autoren Rent).
 */

import { ConsolidatedPLReport } from '@/components/reports/consolidated-pl-report';
import { BalanceSheetReport } from '@/components/reports/balance-sheet-report';
import { ExportButton, FORMAT_LABELS } from '@/components/reports/export-button';

export default async function ConsolidatedReportsPage() {
  // TODO: Get userId from session
  const session = await getSession();
  const userId = session?.user.id;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Consolidated Financials</h1>
        <p className="text-muted-foreground mt-1">
          Combined financial reports across all income sources (Sublet, Autoren Sell, Autoren Rent).
        </p>
      </div>

      {/* Export Actions */}
      <div className="flex gap-4 mb-8">
        <ExportButton format="consolidated" label="Export PDF" />
        <ExportButton format="consolidated" label="Export Excel" />
      </div>

      {/* P&L Report */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Profit & Loss Statement</h2>
        <div className="border rounded-lg overflow-hidden">
          <ConsolidatedPLReport userId={userId} />
        </div>
      </section>

      {/* Balance Sheet Report */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Balance Sheet</h2>
        <div className="border rounded-lg overflow-hidden">
          <BalanceSheetReport userId={userId} />
        </div>
      </section>

      {/* Notes */}
      <section className="bg-muted/50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Understanding Consolidated Reports</h2>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• <strong>Revenue</strong> — Total income from all sources combined</li>
          <li>• <strong>Expenses</strong> — Direct costs allocated to each income source</li>
          <li>• <strong>Net Profit</strong> — Revenue minus Expenses</li>
          <li>• <strong>Balance Sheet</strong> — Assets (cash, receivables) vs Liabilities (deposits held)</li>
          <li>• Use period selector to view monthly, quarterly, or yearly totals</li>
          <li>• Enable "Compare to Prior Period" to see period-over-period changes</li>
        </ul>
      </section>
    </div>
  );
}