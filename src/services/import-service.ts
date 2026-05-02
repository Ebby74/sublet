/**
 * Import Service - Client-side CSV parsing and validation
 * 
 * Note: This service runs in the browser and handles:
 * - CSV file parsing (via papaparse)
 * - Field mapping
 * - Data validation
 * 
 * Import execution is handled via API call to /api/v1/import
 */

import Papa from 'papaparse';

export interface CSVRow {
  [key: string]: string;
}

export interface ParseResult {
  headers: string[];
  rows: CSVRow[];
  errors: string[];
}

export interface FieldMapping {
  csvColumn: string;
  systemField: string;
}

export interface ImportRecord {
  type: 'property' | 'tenant' | 'lease';
  data: Record<string, unknown>;
  rowNumber: number;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: ValidationError[];
}

type ImportEntity = 'properties' | 'tenants' | 'leases';

class ImportService {
  // Parse CSV file and return headers + rows
  async parseCSV(file: File): Promise<ParseResult> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          const rows = results.data as CSVRow[];
          const errors = results.errors.map((e) => e.message);
          resolve({ headers, rows, errors });
        },
        error: (error) => {
          resolve({ headers: [], rows: [], errors: [error.message] });
        },
      });
    });
  }

  // Validate mapped data
  validateImport(
    records: ImportRecord[],
    _mapping: FieldMapping[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const record of records) {
      if (record.type === 'property') {
        errors.push(...this.validateProperty(record));
      } else if (record.type === 'tenant') {
        errors.push(...this.validateTenant(record));
      } else if (record.type === 'lease') {
        errors.push(...this.validateLease(record));
      }
    }

    return errors;
  }

  private validateProperty(record: ImportRecord): ValidationError[] {
    const errors: ValidationError[] = [];
    const data = record.data;

    if (!data.name || (data.name as string).trim() === '') {
      errors.push({ row: record.rowNumber, field: 'name', message: 'Property name is required' });
    }
    if (!data.address || (data.address as string).trim() === '') {
      errors.push({ row: record.rowNumber, field: 'address', message: 'Address is required' });
    }
    if (data.rentAmountSen && isNaN(Number(data.rentAmountSen))) {
      errors.push({ row: record.rowNumber, field: 'rentAmountSen', message: 'Rent amount must be a number' });
    }

    return errors;
  }

  private validateTenant(record: ImportRecord): ValidationError[] {
    const errors: ValidationError[] = [];
    const data = record.data;

    if (!data.name || (data.name as string).trim() === '') {
      errors.push({ row: record.rowNumber, field: 'name', message: 'Tenant name is required' });
    }
    if (data.email && !this.isValidEmail(data.email as string)) {
      errors.push({ row: record.rowNumber, field: 'email', message: 'Invalid email format' });
    }

    return errors;
  }

  private validateLease(record: ImportRecord): ValidationError[] {
    const errors: ValidationError[] = [];
    const data = record.data;

    if (!data.startDate) {
      errors.push({ row: record.rowNumber, field: 'startDate', message: 'Start date is required' });
    }
    if (!data.endDate) {
      errors.push({ row: record.rowNumber, field: 'endDate', message: 'End date is required' });
    }
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate as string);
      const end = new Date(data.endDate as string);
      if (end <= start) {
        errors.push({ row: record.rowNumber, field: 'endDate', message: 'End date must be after start date' });
      }
    }
    if (data.monthlyRentSen && isNaN(Number(data.monthlyRentSen))) {
      errors.push({ row: record.rowNumber, field: 'monthlyRentSen', message: 'Monthly rent must be a number' });
    }

    return errors;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Apply field mapping to rows
  applyMapping(
    rows: CSVRow[],
    mapping: FieldMapping[],
    entityType: ImportEntity
  ): ImportRecord[] {
    return rows.map((row, index) => {
      const data: Record<string, unknown> = {};

      for (const map of mapping) {
        if (map.csvColumn && map.systemField) {
          const rawValue = row[map.csvColumn];
          
          // Convert string to appropriate type
          if (map.systemField === 'rentAmountSen' || map.systemField === 'depositSen') {
            // Convert RM amount to sen (multiply by 100)
            data[map.systemField] = this.parseCurrencyToSen(rawValue);
          } else if (map.systemField === 'startDate' || map.systemField === 'endDate') {
            data[map.systemField] = this.parseDate(rawValue) ?? '';
          } else {
            data[map.systemField] = rawValue ?? '';
          }
        }
      }

      return {
        type: entityType.replace('ies', 'y') as 'property' | 'tenant' | 'lease',
        data,
        rowNumber: index + 2,
      };
    });
  }

  private parseCurrencyToSen(value: string | undefined): number {
    if (!value) return 0;
    const cleaned = value.replace(/[RM,\s]/g, '');
    const amount = parseFloat(cleaned);
    return isNaN(amount) ? 0 : Math.round(amount * 100);
  }

  private parseDate(value: string | undefined): string | null {
    if (!value) return null;
    try {
      const date = new Date(value);
      return date.toISOString();
    } catch {
      return null;
    }
  }

  // Execute import via API call
  async executeImport(
    rows: CSVRow[],
    mapping: FieldMapping[],
    entityType: ImportEntity
  ): Promise<ImportResult> {
    const response = await fetch('/api/v1/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, mapping, entityType }),
    });

    return response.json();
  }
}

export const importService = new ImportService();