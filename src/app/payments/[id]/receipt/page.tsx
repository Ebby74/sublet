/**
 * Receipt Page
 * 
 * Displays a payment receipt with print and PDF download options.
 * Route: /payments/[id]/receipt
 * 
 * Features:
 * - Uses ReceiptView component with built-in print/download buttons
 * - Client-side data fetching for real-time payment data
 * - Print-optimized layout with A4 sizing
 * - 44px touch targets for mobile usability (D-06)
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ReceiptView, type PaymentWithRelations } from '@/components/payment/receipt-view';
import styles from './receipt.module.css';

export default function ReceiptPage() {
  const params = useParams();
  const id = params.id as string;
  const [payment, setPayment] = useState<PaymentWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayment();
  }, [id]);

  async function fetchPayment() {
    try {
      const res = await fetch(`/api/v1/payments/${id}`);
      if (!res.ok) throw new Error('Failed to fetch payment');
      const { data } = await res.json();
      setPayment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const handleDownloadPDF = useCallback(() => {
    // Trigger browser print dialog with PDF option
    window.print();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className={styles.container}>
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-red-500">{error || 'Payment not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Action Bar - hidden in print */}
      <div className={`${styles.actions} no-print`}>
        <Link href={`/payments/${id}`} className={styles.backLink}>
          ← Back to Payment
        </Link>
      </div>

      {/* Receipt with buttons */}
      <div className={styles.receiptWrapper}>
        <ReceiptView
          payment={payment}
          ownerName="Property Owner"
          mode="html"
          showButtons={true}
          onDownloadPDF={handleDownloadPDF}
          className="max-w-2xl mx-auto"
        />
      </div>
    </div>
  );
}