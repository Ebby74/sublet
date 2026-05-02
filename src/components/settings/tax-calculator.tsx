'use client';

/**
 * Tax Calculator Component
 * 
 * Interactive Zakat and Tax calculator for manual estimation
 */

import { useState } from 'react';
import { calculateTaxWithZakatOffset } from '@/lib/tax-offset';
import { formatCurrency } from '@/lib/format';
import { LHDN_TAX_BRACKETS } from '@/lib/tax-calculation';

export function TaxCalculator() {
  const [netProfit, setNetProfit] = useState<string>('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [result, setResult] = useState<ReturnType<typeof calculateTaxWithZakatOffset> | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = () => {
    setError('');
    const profit = parseFloat(netProfit);
    
    if (isNaN(profit)) {
      setError('Please enter a valid number');
      return;
    }
    
    if (profit < 0) {
      setError('Net profit cannot be negative');
      return;
    }
    
    // Convert to sen for calculation
    const profitSen = Math.round(profit * 100);
    const calcResult = calculateTaxWithZakatOffset(profitSen);
    setResult(calcResult);
  };

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <h3 className="text-lg font-semibold">Zakat & Tax Calculator</h3>
        <p className="text-sm opacity-90">Year {year}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Input Section */}
        <div className="space-y-3">
          <div>
            <label htmlFor="netProfit" className="block text-sm font-medium mb-1">
              Net Profit (RM)
            </label>
            <input
              id="netProfit"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter annual net profit"
              value={netProfit}
              onChange={(e) => setNetProfit(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium mb-1">
              Year
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={handleCalculate}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Calculate
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-4 border-t pt-4">
            {/* Net Profit */}
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Net Profit</span>
              <span className="text-lg font-bold">
                {formatCurrency(result.taxableIncomeSen)}
              </span>
            </div>

            {/* Zakat */}
            <section>
              <h4 className="font-medium text-muted-foreground mb-2">Zakat Perniagaan</h4>
              <div className="space-y-2 text-sm">
                {result.ZakatAmount > 0 ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-foreground">Zakat Amount (2.5% of profit &gt; RM 20k)</span>
                      <span className="font-medium text-orange-600">
                        {formatCurrency(result.ZakatAmount)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      * Zakat can be offset against income tax
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not applicable - Below nisab threshold (RM 20,000)
                  </p>
                )}
              </div>
            </section>

            {/* Tax */}
            <section>
              <h4 className="font-medium text-muted-foreground mb-2">Income Tax (LHDN)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground">Gross Tax</span>
                  <span className="font-medium">{formatCurrency(result.grossTax)}</span>
                </div>
                {result.ZakatAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-foreground">Zakat Offset</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(result.ZakatOffset)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-foreground">Effective Rate</span>
                  <span className="font-medium">{result.effectiveRate.toFixed(2)}%</span>
                </div>
              </div>
            </section>

            {/* Net Tax Payable */}
            <section>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-lg font-semibold">Net Tax Payable</span>
                <span className="text-xl font-bold text-green-700">
                  {formatCurrency(result.netTaxPayable)}
                </span>
              </div>
            </section>

            {/* Bracket Info */}
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                View Tax Bracket Breakdown
              </summary>
              <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-1">Income Range (RM)</th>
                      <th className="pb-1">Rate</th>
                      <th className="pb-1">Base Tax (RM)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LHDN_TAX_BRACKETS.map((bracket, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                        <td className="py-1">
                          {bracket.max < Number.MAX_SAFE_INTEGER
                            ? `${bracket.min.toLocaleString()} - ${bracket.max.toLocaleString()}`
                            : `${bracket.min.toLocaleString()}+`}
                        </td>
                        <td className="py-1">{(bracket.rate * 100).toFixed(0)}%</td>
                        <td className="py-1">{bracket.baseTax.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}