'use client';

import { useState, useCallback } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ExportFormat = 
  | 'transactions'
  | 'by-tenant'
  | 'by-property'
  | 'bills'
  | 'lhdn'
  | 'profit-loss'
  | 'balance-sheet'
  | 'cash-book'
  | 'tax-summary'
  | 'consolidated'
  | 'ssm-form9'
  | 'ssm-form44';

export interface ExportButtonProps {
  format: ExportFormat;
  label?: string;
  filters?: {
    startDate?: string;
    endDate?: string;
    tenantId?: string;
    propertyId?: string;
    year?: string;
  };
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'ssm-export';
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  transactions: 'All Transactions',
  'by-tenant': 'By Tenant',
  'by-property': 'By Property',
  bills: 'Bills Summary',
  lhdn: 'LHDN Report',
  'profit-loss': 'Profit & Loss',
  'balance-sheet': 'Balance Sheet',
  'cash-book': 'Cash Book',
  'tax-summary': 'Tax Summary',
  consolidated: 'Consolidated Report',
  'ssm-form9': 'SSM Form 9 - Shares Allotment',
  'ssm-form44': 'SSM Form 44 - Statement of Affairs',
};

export function ExportButton({ 
  format, 
  label,
  filters = {},
  disabled = false,
  className,
  variant = 'default',
}: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleExport = useCallback(async () => {
    setIsLoading(true);
    setIsSuccess(false);

    try {
      // Build query string
      const params = new URLSearchParams();
      params.set('format', format);
      
      if (filters.startDate) params.set('startdate', filters.startDate);
      if (filters.endDate) params.set('enddate', filters.endDate);
      if (filters.tenantId) params.set('tenantId', filters.tenantId);
      if (filters.propertyId) params.set('propertyId', filters.propertyId);
      if (filters.year) params.set('year', filters.year);

      const url = `/api/v1/export?${params.toString()}`;

      // Fetch the file
      const response = await fetch(url);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }

      // Get blob and trigger download
      const blob = await response.blob();
      const filename = response.headers.get('Content-Disposition')?.split('filename="')[1]?.replace('"', '') || `${format}.xlsx`;
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      alert(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsLoading(false);
    }
  }, [format, filters]);

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isLoading}
      variant={isSuccess ? 'secondary' : variant === 'ssm-export' ? 'default' : variant}
      className={`${variant === 'ssm-export' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''} ${className || ''}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : isSuccess ? (
        <>
          <Download className="mr-2 h-4 w-4" />
          Downloaded!
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {label || FORMAT_LABELS[format]}
        </>
      )}
    </Button>
  );
}

export { FORMAT_LABELS };