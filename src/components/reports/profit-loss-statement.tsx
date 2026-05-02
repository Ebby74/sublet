'use client';

/**
 * Profit & Loss Statement Component with Zakat Section
 * 
 * Displays income, expenses, net profit, and Zakat calculation
 */

import { formatCurrency } from '@/lib/format';
import type { ProfitLossData } from '@/services/profit-loss-service';

interface ProfitLossStatementProps {
  data: ProfitLossData;
}

export function ProfitLossStatement({ data }: ProfitLossStatementProps) {
  const { year, incomeByCategory, expensesByCategory, totalIncome, totalExpenses, netProfit, Zakat, isZakatLiable } = data;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <h3 className="text-lg font-semibold">Profit & Loss Statement</h3>
        <p className="text-sm opacity-90">Year {year}</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Income Section */}
        <section>
          <h4 className="font-medium text-muted-foreground mb-3">Income</h4>
          {incomeByCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No income recorded</p>
          ) : (
            <div className="space-y-2">
              {incomeByCategory.map((item) => (
                <div key={item.category} className="flex justify-between text-sm">
                  <span className="text-foreground">{item.category}</span>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total Income</span>
                <span>{formatCurrency(totalIncome)}</span>
              </div>
            </div>
          )}
        </section>

        {/* Expenses Section */}
        <section>
          <h4 className="font-medium text-muted-foreground mb-3">Expenses</h4>
          {expensesByCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses recorded</p>
          ) : (
            <div className="space-y-2">
              {expensesByCategory.map((item) => (
                <div key={item.category} className="flex justify-between text-sm">
                  <span className="text-foreground">{item.category}</span>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total Expenses</span>
                <span>{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          )}
        </section>

        {/* Net Profit */}
        <section className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Net Profit</span>
            <span className={`text-lg font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </span>
          </div>
        </section>

        {/* Zakat Section */}
        <section className="border-t pt-4">
          <h4 className="font-medium text-muted-foreground mb-3">Zakat Perniagaan</h4>
          {isZakatLiable ? (
            <div className="space-y-2">
              <p className="text-sm text-foreground">
                Zakat Perniagaan (2.5% of net profit exceeding RM 20,000)
              </p>
              <div className="flex justify-between font-semibold">
                <span>Zakat Amount</span>
                <span className="text-orange-600">{formatCurrency(Zakat)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Zakat can be offset against income tax liability
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Zakat: Not applicable
              </p>
              <p className="text-xs text-muted-foreground">
                Net profit (RM {(netProfit / 100).toFixed(2)}) is below nisab threshold (RM 20,000)
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}