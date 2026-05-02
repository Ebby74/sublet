/**
 * Import Execution Service - Server-side import execution
 * 
 * Handles actual database operations for import.
 * Used by API route /api/v1/import
 */

import { prisma } from '@/lib/prisma';
import type { CSVRow, FieldMapping, ImportRecord, ValidationError, ImportResult } from './import-service';

type ImportEntity = 'properties' | 'tenants' | 'leases';

// Re-use types from import-service for execution
interface ImportExecutionService {
  applyMapping(rows: CSVRow[], mapping: FieldMapping[], entityType: ImportEntity): ImportRecord[];
  validateImport(records: ImportRecord[], mapping: FieldMapping[]): ValidationError[];
  executeImport(records: ImportRecord[], userId: string): Promise<ImportResult>;
}

class ImportExecutionService {
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
            data[map.systemField] = this.parseCurrencyToSen(rawValue);
          } else if (map.systemField === 'startDate' || map.systemField === 'endDate') {
            data[map.systemField] = this.parseDate(rawValue);
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

  // Validate mapped data
  validateImport(records: ImportRecord[]): ValidationError[] {
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

  // Execute import
  async executeImport(records: ImportRecord[], userId: string): Promise<ImportResult> {
    const errors: ValidationError[] = [];
    let imported = 0;

    for (const record of records) {
      try {
        if (record.type === 'property') {
          await prisma.property.create({
            data: {
              name: record.data.name as string,
              address: record.data.address as string,
              type: (record.data.type as string) || 'apartment',
              status: (record.data.status as string) || 'vacant',
              userId,
            },
          });
          imported++;
        } else if (record.type === 'tenant') {
          await prisma.tenant.create({
            data: {
              name: record.data.name as string,
              email: record.data.email as string | undefined,
              phone: record.data.phone as string | undefined,
              icNumber: record.data.icNumber as string | undefined,
              userId,
            },
          });
          imported++;
        } else if (record.type === 'lease') {
          const property = await prisma.property.findFirst({
            where: {
              name: record.data.propertyName as string,
              userId,
            },
          });
          const tenant = await prisma.tenant.findFirst({
            where: {
              name: record.data.tenantName as string,
              userId,
            },
          });

          if (property && tenant) {
            const roomId = record.data.roomId as string | undefined;
            let leaseRoomId: string | null = roomId ?? null;
            
            if (!leaseRoomId) {
              const floor = await prisma.floor.findFirst({
                where: { propertyId: property.id },
                include: { rooms: true },
              });
              leaseRoomId = floor?.rooms[0]?.id ?? null;
            }
            
            if (leaseRoomId) {
              await prisma.lease.create({
                data: {
                  startDate: new Date(record.data.startDate as string),
                  endDate: new Date(record.data.endDate as string),
                  monthlyRentSen: (record.data.monthlyRentSen as number) || 0,
                  depositSen: (record.data.depositSen as number) || 0,
                  status: (record.data.status as string) || 'active',
                  roomId: leaseRoomId,
                  tenantId: tenant.id,
                  userId,
                },
              });
              imported++;
            } else {
              errors.push({
                row: record.rowNumber,
                field: 'propertyName/tenantName',
                message: `Property "${record.data.propertyName}" or tenant "${record.data.tenantName}" not found`,
              });
            }
          }
        }
      } catch (err) {
        errors.push({
          row: record.rowNumber,
          field: 'general',
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return { success: errors.length === 0, imported, errors };
  }
}

export const importExecutionService = new ImportExecutionService();