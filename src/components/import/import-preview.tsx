'use client';

import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { ValidationError } from '@/services/import-service';

interface PreviewRow {
  [key: string]: string;
}

interface ImportPreviewProps {
  headers: string[];
  rows: PreviewRow[];
  errors: ValidationError[];
  onConfirm: () => void;
  onCancel: () => void;
  isImporting?: boolean;
}

export function ImportPreview({
  headers,
  rows,
  errors,
  onConfirm,
  onCancel,
  isImporting = false,
}: ImportPreviewProps) {
  const previewRows = rows.slice(0, 10);
  const hasErrors = errors.length > 0;

  const getRowErrors = (rowNumber: number): ValidationError[] => {
    return errors.filter((e) => e.row === rowNumber);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Import Preview</h3>
          <p className="text-sm text-muted-foreground">
            {previewRows.length} rows shown of {rows.length}
          </p>
        </div>
        {hasErrors && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{errors.length} validation errors</span>
          </div>
        )}
      </div>

      {/* Error List */}
      {hasErrors && (
        <div className="rounded-md border border-destructive bg-destructive/5 p-4">
          <h4 className="font-medium text-destructive mb-2">Validation Errors</h4>
          <ul className="space-y-1">
            {errors.slice(0, 10).map((err, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-destructive">
                <XCircle className="h-4 w-4 flex-shrink-0" />
                <span>Row {err.row}, {err.field}: {err.message}</span>
              </li>
            ))}
            {errors.length > 10 && (
              <li className="text-sm text-muted-foreground">
                ...and {errors.length - 10} more errors
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Data Preview Table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground w-12">#</th>
              {headers.map((header) => (
                <th key={header} className="px-3 py-2 text-left font-medium text-muted-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, i) => {
              const rowErrs = getRowErrors(i + 2);
              return (
                <tr 
                  key={i} 
                  className={rowErrs.length > 0 ? 'bg-destructive/10' : i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                >
                  <td className="px-3 py-2 text-muted-foreground">{i + 2}</td>
                  {headers.map((header) => (
                    <td key={header} className="px-3 py-2">
                      {row[header] || '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent"
          disabled={isImporting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          disabled={isImporting || hasErrors}
        >
          {isImporting ? (
            'Importing...'
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Import {rows.length} Records
            </>
          )}
        </button>
      </div>
    </div>
  );
}