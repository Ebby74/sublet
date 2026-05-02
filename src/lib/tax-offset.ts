/**
 * Tax Offset Calculation Utility
 * 
 * Calculates income tax with Zakat offset (allowed under Malaysian law)
 * Zakat can be deducted from income tax liability, up to the tax amount
 */

import { calculateTax } from '@/lib/tax-calculation';
import { calculateZakat } from '@/lib/zakat';

/** Tax with Zakat offset result */
export interface TaxWithOffsetResult {
  taxableIncomeSen: number;
  grossTax: number;
  ZakatAmount: number;
  ZakatOffset: number;
  netTaxPayable: number;
  effectiveRate: number;
}

/**
 * Calculate tax with Zakat offset
 * 
 * @param netProfitSen - Net profit in sen (this is the taxable income for rental business)
 * @returns TaxWithOffsetResult with gross tax, Zakat amount, offset, and net tax payable
 */
export function calculateTaxWithZakatOffset(netProfitSen: number): TaxWithOffsetResult {
  // Calculate Zakat (only if net profit > 0)
  const netProfitForZakat = Math.max(0, netProfitSen);
  const ZakatResult = calculateZakat(netProfitForZakat);
  
  // Calculate tax on net profit (which is taxable income for rental business)
  const taxResult = calculateTax(netProfitSen);
  
  // Zakat offset: cannot offset more than the tax due
  const ZakatOffset = Math.min(ZakatResult.amount, taxResult.totalTax);
  
  // Net tax payable: tax minus Zakat offset (cannot go below 0)
  const netTaxPayable = Math.max(0, taxResult.totalTax - ZakatOffset);
  
  return {
    taxableIncomeSen: netProfitSen,
    grossTax: taxResult.totalTax,
    ZakatAmount: ZakatResult.amount,
    ZakatOffset,
    netTaxPayable,
    effectiveRate: taxResult.effectiveRate,
  };
}

/**
 * Get tax with offset (async wrapper for convenience)
 * 
 * @param netProfitSen - Net profit in sen
 * @returns TaxWithOffsetResult
 */
export async function getTaxWithOffset(netProfitSen: number): Promise<TaxWithOffsetResult> {
  return calculateTaxWithZakatOffset(netProfitSen);
}