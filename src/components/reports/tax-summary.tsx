'use client';

/**
 * Tax Summary Component with Zakat Offset
 * 
 * Displays income tax calculation with Zakat perniagaan offset
 */

import { calculateTaxWithZakatOffset } from '@/lib/tax-offset';
import { formatCurrency } from '@/lib/format';

interface TaxSummaryProps {
  netProfit: number; // in sen
  year: number;
}

export function TaxSummary({ netProfit, year }: TaxSummaryProps) {
  const result = calculateTaxWithZakatOffset(netProfit);
  const netProfitRM = netProfit / 100;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <h3 className="text-lg font-semibold">Tax Calculation</h3>
        <p className="text-sm opacity-90">Year {year}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Net Profit */}
        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
          <span className="font-medium">Net Profit (Taxable Income)</span>
          <span className={`text-lg font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netProfit)}
          </span>
        </div>

        {/* Tax Calculation */}
        <section className="border-t pt-4">
          <h4 className="font-medium text-muted-foreground mb-3">Income Tax (LHDN Brackets)</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground">Gross Tax</span>
              <span className="font-medium">{formatCurrency(result.grossTax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">Effective Rate</span>
              <span className="font-medium">{result.effectiveRate.toFixed(2)}%</span>
            </div>
          </div>
        </section>

        {/* Zakat */}
        <section className="border-t pt-4">
          <h4 className="font-medium text-muted-foreground mb-3">Zakat Perniagaan</h4>
          <div className="space-y-2 text-sm">
            {result.ZakatAmount > 0 ? (
              <>
                <div className="flex justify-between">
                  <span className="text-foreground">Zakat Amount (2.5% of profit &gt; RM 20k)</span>
                  <span className="font-medium text-orange-600">{formatCurrency(result.ZakatAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Zakat Offset Against Tax</span>
                  <span className="font-medium text-green-600">-{formatCurrency(result.ZakatOffset)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * Zakat offset is limited to the lesser of Zakat amount or tax due
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Not applicable - Net profit below nisab threshold (RM 20,000)
              </p>
            )}
          </div>
        </section>

        {/* Net Tax Payable */}
        <section className="border-t pt-4">
          <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
            <span className="text-lg font-semibold">Net Tax Payable</span>
            <span className="text-xl font-bold text-green-700">
              {formatCurrency(result.netTaxPayable)}
            </span>
          </div>
          {result.ZakatAmount > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              After applying Zakat offset of {formatCurrency(result.ZakatOffset)} 
              {' '}against gross tax of {formatCurrency(result.grossTax)}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}