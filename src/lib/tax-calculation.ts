/**
 * Malaysian Income Tax Calculation Utility
 * 
 * LHDN progressive tax brackets (2024):
 * - RM 0 - 5,000: 0%
 * - RM 5,001 - 20,000: 1%
 * - RM 20,001 - 35,000: 3%
 * - RM 35,001 - 50,000: 6%
 * - RM 50,001 - 70,000: 8%
 * - RM 70,001 - 100,000: 12%
 * - RM 100,001 - 150,000: 16%
 * - RM 150,001 - 200,000: 17%
 * - RM 200,001 - 250,000: 18%
 * - RM 250,001 - 400,000: 19%
 * - RM 400,001 - 600,000: 20%
 * - RM 600,001 - 750,000: 21%
 * - RM 750,001 - 1,000,000: 22%
 * - RM 1,000,001 - 2,000,000: 23%
 * - RM 2,000,001+: 24%
 */

import type { TaxCalculationResult, TaxBracket } from '@/types';

/** LHDN progressive tax brackets (2024) */
export const LHDN_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 5000, rate: 0, baseTax: 0 },
  { min: 5001, max: 20000, rate: 0.01, baseTax: 0 },
  { min: 20001, max: 35000, rate: 0.03, baseTax: 150 },
  { min: 35001, max: 50000, rate: 0.06, baseTax: 600 },
  { min: 50001, max: 70000, rate: 0.08, baseTax: 1500 },
  { min: 70001, max: 100000, rate: 0.12, baseTax: 3100 },
  { min: 100001, max: 150000, rate: 0.16, baseTax: 6700 },
  { min: 150001, max: 200000, rate: 0.17, baseTax: 14700 },
  { min: 200001, max: 250000, rate: 0.18, baseTax: 23200 },
  { min: 250001, max: 400000, rate: 0.19, baseTax: 32200 },
  { min: 400001, max: 600000, rate: 0.20, baseTax: 60700 },
  { min: 600001, max: 750000, rate: 0.21, baseTax: 100700 },
  { min: 750001, max: 1000000, rate: 0.22, baseTax: 132200 },
  { min: 1000001, max: 2000000, rate: 0.23, baseTax: 187200 },
  { min: 2000001, max: Number.MAX_SAFE_INTEGER, rate: 0.24, baseTax: 417200 },
];

/**
 * Calculate income tax using LHDN progressive brackets
 * 
 * @param taxableIncomeSen - Taxable income in sen (integer, e.g., 50000 = RM 500.00)
 * @returns TaxCalculationResult with total tax, bracket breakdown, and effective rate
 */
export function calculateTax(taxableIncomeSen: number): TaxCalculationResult {
  const taxableIncomeRM = taxableIncomeSen / 100;
  
  // Find the applicable bracket
  const bracket = LHDN_TAX_BRACKETS.find(
    (b) => taxableIncomeRM >= b.min && taxableIncomeRM <= b.max
  ) ?? LHDN_TAX_BRACKETS[LHDN_TAX_BRACKETS.length - 1];
  
  // Calculate tax using progressive formula: baseTax + (income - bracketMin) * rate
  const taxableAtRate = Math.max(0, taxableIncomeRM - bracket.min);
  const totalTaxRM = bracket.baseTax + (taxableAtRate * bracket.rate);
  const totalTaxSen = Math.floor(totalTaxRM * 100);
  
  // Calculate effective rate
  const effectiveRate = taxableIncomeRM > 0 
    ? (totalTaxRM / taxableIncomeRM) * 100 
    : 0;
  
  // Build bracket breakdown showing each bracket considered
  const taxBrackets: Array<{
    bracket: TaxBracket;
    taxableAmount: number;
    taxAtBracket: number;
  }> = [];
  
  for (const b of LHDN_TAX_BRACKETS) {
    if (taxableIncomeRM > b.min) {
      const taxableAtThisBracket = Math.min(taxableIncomeRM, b.max) - b.min;
      if (taxableAtThisBracket > 0) {
        taxBrackets.push({
          bracket: b,
          taxableAmount: taxableAtThisBracket,
          taxAtBracket: Math.floor(taxableAtThisBracket * b.rate * 100) / 100,
        });
      }
    }
  }
  
  return {
    taxableIncomeSen,
    taxBrackets,
    totalTax: totalTaxSen,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
  };
}