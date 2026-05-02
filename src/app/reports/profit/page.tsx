import { getSession } from '@/lib/auth';

/**
 * Profit by Source Report Page
 *
 * Displays profit/loss breakdown by income source:
 * - Sublet: Co-living room rental income
 * - Autoren Sell: Property sales (future)
 * - Autoren Rent: Property rentals (future)
 *
 * Features:
 * - Table and card views
 * - Date filtering (presets + custom range)
 * - Loss highlighting with warning indicators
 */

import { ProfitBySourceReport } from '@/components/reports/profit-by-source-report';

export default async function ProfitBySourcePage() {
  // TODO: Get userId from session
  const session = await getSession();
  const userId = session?.user.id;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Profit by Source</h1>
        <p className="text-muted-foreground mt-1">
          View profit/loss breakdown by income source with date filtering.
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <ProfitBySourceReport userId={userId} />
      </div>
    </div>
  );
}
