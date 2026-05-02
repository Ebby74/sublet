/**
 * Income Source Constants
 *
 * Defines income sources for AMR Home Solutions:
 * - Sublet: Property management revenue
 * - Autoren Sell: Property sales commissions
 * - Autoren Rent: Property rental commissions
 * - Unallocated: Expenses not assigned to any source
 */

export type IncomeSource = 'sublet' | 'autoren_sell' | 'autoren_rent' | 'unallocated';

export interface IncomeSourceOption {
  value: IncomeSource;
  label: string;
  color: string;
}

export const INCOME_SOURCES: IncomeSourceOption[] = [
  { value: 'sublet', label: 'Sublet', color: 'bg-blue-100 text-blue-800' },
  { value: 'autoren_sell', label: 'Autoren Sell', color: 'bg-green-100 text-green-800' },
  { value: 'autoren_rent', label: 'Autoren Rent', color: 'bg-purple-100 text-purple-800' },
  { value: 'unallocated', label: 'Unallocated', color: 'bg-gray-100 text-gray-800' },
];

// Smart categorization rules: map expense category to suggested income source
export const CATEGORY_TO_INCOME_SOURCE: Record<string, IncomeSource> = {
  // Sublet categories - direct costs of property management
  'water (syabas)': 'sublet',
  'electricity (tnb)': 'sublet',
  'internet': 'sublet',
  'iwk': 'sublet',
  'maintenance': 'sublet',
  'insurance': 'sublet',
  'quit rent': 'sublet',
  'assessment': 'sublet',

  // Autoren Rent categories - rental agent operations
  'legal fees': 'autoren_rent',
  'agent commission': 'autoren_rent',
  'renovation': 'autoren_rent',

  // Autoren Sell categories - sales agent operations
  // (legal_fees already covered above for both)

  // Shared/default categories
  'other': 'unallocated',
};

/**
 * Get suggested income source based on expense category
 */
export function getSuggestedIncomeSource(category: string): IncomeSource {
  const normalizedCategory = category.toLowerCase();
  return CATEGORY_TO_INCOME_SOURCE[normalizedCategory] || 'unallocated';
}