export const INCOME_TYPES = [
  'Rent',
  'Deposit',
  'Late Fee',
  'Other',
] as const;

export const EXPENSE_TYPES = [
  'Water (SYABAS)',
  'Electricity (TNB)',
  'Internet',
  'IWK',
  'Maintenance',
  'Legal Fees',
  'Agent Commission',
  'Renovation',
  'Insurance',
  'Quit Rent',
  'Assessment',
  'Other',
] as const;

export const PAYMENT_TYPES = [...INCOME_TYPES, ...EXPENSE_TYPES];

export const LHDN_CATEGORIES = [
  'Repair and Maintenance',
  'Utilities',
  'Insurance',
  'Property Tax (Quit Rent/Assessment)',
  'Management Fees',
  'Legal Fees',
  'Agent Commission',
  'Depreciation',
  'Interest on Loan',
  'Other Expenses',
] as const;

export const INCOME_SOURCES = [
  { value: 'sublet', label: 'Sublet', color: 'bg-blue-100 text-blue-800' },
  { value: 'autoren_sell', label: 'Autoren Sell', color: 'bg-green-100 text-green-800' },
  { value: 'autoren_rent', label: 'Autoren Rent', color: 'bg-purple-100 text-purple-800' },
  { value: 'unallocated', label: 'Unallocated', color: 'bg-gray-100 text-gray-800' },
] as const;
