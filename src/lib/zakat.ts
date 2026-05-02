/**
 * Zakat Perniagaan (Business Zakat) Calculation Utility
 * 
 * Malaysian Zakat for business income:
 * - Rate: 2.5% of net profit
 * - Nisab threshold: RM 20,000 (annual)
 * - Only payable if net profit exceeds nisab
 */

import type { ZakatCalculationResult } from '@/types';

/** Nisab threshold - minimum profit before Zakat becomes liable (RM 20,000) */
export const NISAB_THRESHOLD = 20000;

/** Zakat rate (2.5%) */
export const ZAKAT_RATE = 0.025;

/**
 * Calculate Zakat perniagaan based on net profit
 * 
 * @param netProfitSen - Net profit in sen (integer, e.g., 50000 = RM 500.00)
 * @returns ZakatCalculationResult with amount and liability status
 */
export function calculateZakat(netProfitSen: number): ZakatCalculationResult {
  // Convert sen to ringgit for threshold comparison
  const netProfitRM = netProfitSen / 100;
  
  // Check if profit exceeds nisab threshold
  if (netProfitRM <= NISAB_THRESHOLD) {
    return {
      netProfitSen,
      isLiable: false,
      calculation: `Net profit (RM ${netProfitRM.toFixed(2)}) <= nisab (RM ${NISAB_THRESHOLD})`,
      amount: 0,
    };
  }
  
  // Calculate Zakat on amount exceeding nisab
  const taxableAmountSen = netProfitSen - (NISAB_THRESHOLD * 100);
  const amount = Math.floor(taxableAmountSen * ZAKAT_RATE);
  
  return {
    netProfitSen,
    isLiable: true,
    calculation: `(RM ${netProfitRM.toFixed(2)} - RM ${NISAB_THRESHOLD}) × 2.5% = RM ${(amount / 100).toFixed(2)}`,
    amount,
  };
}