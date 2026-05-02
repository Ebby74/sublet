/**
 * Receipt View Component
 * 
 * Displays a styled receipt for a payment, optimized for A4 printing.
 * Supports both HTML view and PDF generation modes.
 * 
 * Receipt contains: Tenant name, property, amount (MYR), date, description, reference number
 * Reference format: RCP-YYYYMMDD-XXXX (per D-13)
 */

import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { Download, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';
import styles from './receipt-view.module.css';

export interface PaymentWithRelations {
  id: string;
  type: string;
  amountSen: number;
  description: string | null;
  referenceNumber: string | null;
  paidAt: Date | null;
  dueDate: Date | null;
  status: string;
  tenant: {
    id: string;
    name: string;
    icNumber: string | null;
    email: string | null;
  } | null;
  lease: {
    id: string;
    property: {
      id: string;
      name: string;
      address: string;
    };
  } | null;
}

export interface ReceiptViewProps {
  payment: PaymentWithRelations;
  ownerName?: string;
  mode?: 'html' | 'pdf';
  className?: string;
  showButtons?: boolean;
  onDownloadPDF?: () => void;
}

export const ReceiptView: FC<ReceiptViewProps> = ({
  payment,
  ownerName = 'Property Owner',
  mode = 'html',
  className,
  showButtons = false,
  onDownloadPDF,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(() => {
    if (onDownloadPDF) {
      onDownloadPDF();
    } else {
      // Default: trigger print dialog with PDF option
      window.print();
    }
  }, [onDownloadPDF]);

  // Generate receipt data
  const receiptNumber = payment.referenceNumber || generateReferenceNumber(payment.paidAt);
  const receiptDate = payment.paidAt ? new Date(payment.paidAt) : new Date();
  
  const tenantName = payment.tenant?.name || 'N/A';
  const tenantIc = payment.tenant?.icNumber || 'N/A';
  const propertyName = payment.lease?.property.name || 'N/A';
  const propertyAddress = payment.lease?.property.address || 'N/A';
  const amount = payment.amountSen;
  const description = payment.description || getPaymentTypeLabel(payment.type);
  const status = payment.status;

  return (
    <div className={`${styles.receipt} ${styles[mode]} ${className || ''}`}>
      {/* Receipt Header */}
      <header className={styles.header}>
        <div className={styles.companyInfo}>
          <h1 className={styles.companyName}>{ownerName}</h1>
          <p className={styles.companyTagline}>Property Management</p>
        </div>
        <div className={styles.receiptTitle}>
          <h2>RECEIPT</h2>
        </div>
      </header>

      {/* Receipt Meta */}
      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Receipt No:</span>
          <span className={styles.metaValue}>{receiptNumber}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Date:</span>
          <span className={styles.metaValue}>{formatDate(receiptDate)}</span>
        </div>
      </div>

      {/* Bill To */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Bill To:</h3>
        <div className={styles.billTo}>
          <p className={styles.tenantName}>{tenantName}</p>
          <p className={styles.tenantIc}>IC: {tenantIc}</p>
        </div>
      </section>

      {/* Property Details */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Property:</h3>
        <p className={styles.propertyInfo}>{propertyName}</p>
        <p className={styles.propertyAddress}>{propertyAddress}</p>
      </section>

      {/* Payment Details Table */}
      <section className={styles.section}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Description</th>
              <th className={styles.amountColumn}>Amount (MYR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{description}</td>
              <td className={styles.amountColumn}>{formatCurrency(amount)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className={styles.totalLabel}>Total</td>
              <td className={`${styles.amountColumn} ${styles.totalAmount}`}>
                {formatCurrency(amount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      {/* Status Badge */}
      <div className={styles.statusSection}>
        <span className={`${styles.statusBadge} ${styles[status]}`}>
          {getStatusLabel(status)}
        </span>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.thankYou}>Thank you for your payment.</p>
        <p className={styles.footerNote}>This is a computer-generated receipt.</p>
      </footer>

      {/* Print/Download Buttons - hidden in print */}
      {showButtons && (
        <div className={`${styles.buttonContainer} no-print`}>
          <button
            onClick={handleDownload}
            className={styles.downloadButton}
            type="button"
          >
            <Download className="h-5 w-5" />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className={styles.printButton}
            type="button"
          >
            <Printer className="h-5 w-5" />
            Print
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Generate reference number in format RCP-YYYYMMDD-XXXX
 */
function generateReferenceNumber(date: Date | null): string {
  const d = date ? new Date(date) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RCP-${year}${month}${day}-${random}`;
}

/**
 * Get display label for payment type
 */
function getPaymentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    income: 'Payment Received',
    expense: 'Payment Made',
    rent: 'Monthly Rent',
    deposit: 'Security Deposit',
    late_fee: 'Late Fee',
    water: 'Water Bill (SYABAS)',
    electricity: 'Electricity Bill (TNB)',
    internet: 'Internet',
    iwk: 'IWK Sewerage',
    maintenance: 'Maintenance',
    legal_fees: 'Legal Fees',
    agent_commission: 'Agent Commission',
    renovation: 'Renovation',
    insurance: 'Insurance',
    quit_rent: 'Quit Rent',
    assessment: 'Assessment',
    other: 'Other',
  };
  return labels[type] || type;
}

/**
 * Get display label for payment status
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}

export default ReceiptView;