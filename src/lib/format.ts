/**
 * MYR Currency Utilities
 * 
 * All monetary values stored as integers (sen) to avoid floating-point precision issues.
 * Example: RM 1,500.00 = 150000 sen
 * 
 * Reference: .planning/research/PITFALLS.md - Pitfall 1: Currency Precision
 */

// Malaysian locale formatter for display
const MYR_FORMATTER = new Intl.NumberFormat('ms-MY', {
  style: 'currency',
  currency: 'MYR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Malaysian date formatter (DD/MM/YYYY)
const MY_DATE_FORMATTER = new Intl.DateTimeFormat('ms-MY', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/**
 * Format sen amount to MYR display string
 * @param sen - Amount in sen (e.g., 150000 = RM 1,500.00)
 */
export function formatCurrency(sen: number): string {
  const ringgit = sen / 100;
  return MYR_FORMATTER.format(ringgit);
}

/**
 * Format sen amount to MYR with sign (+/-)
 */
export function formatCurrencyWithSign(sen: number): string {
  const ringgit = sen / 100;
  const formatted = MYR_FORMATTER.format(Math.abs(ringgit));
  if (ringgit < 0) {
    return `-${formatted}`;
  } else if (ringgit > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

/**
 * Convert ringgit to sen (integer)
 * @param ringgit - Amount in ringgit (e.g., 1500.00 = RM 1,500.00)
 */
export function ringgitToSen(ringgit: number): number {
  return Math.round(ringgit * 100);
}

/**
 * Convert sen to ringgit (decimal)
 * @param sen - Amount in sen
 */
export function senToRinggit(sen: number): number {
  return sen / 100;
}

/**
 * Parse currency input string to sen
 * Handles formats: "1500", "1500.00", "RM 1500", "RM 1,500.00", "1,500.00"
 */
export function parseCurrency(input: string): number {
  // Remove RM, spaces, commas
  const cleaned = input.replace(/[RM,\s]/g, '');
  const value = parseFloat(cleaned);
  if (isNaN(value)) {
    return 0;
  }
  // Convert to sen and round
  return Math.round(value * 100);
}

/**
 * Format date for Malaysian display (DD/MM/YYYY)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return MY_DATE_FORMATTER.format(d);
}

/**
 * Format date for API/storage (ISO 8601)
 */
export function formatDateISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Parse Malaysian date format (DD/MM/YYYY) to ISO string
 */
export function parseMalaysianDate(input: string): string | null {
  const parts = input.split('/');
  if (parts.length !== 3) {
    return null;
  }
  const [day, month, year] = parts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return null;
  }
  // Validate ranges
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  return date.toISOString().split('T')[0];
}
