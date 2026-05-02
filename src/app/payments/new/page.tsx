'use client';

import { PaymentForm } from '@/components/payment/payment-form';

export default function NewPaymentPage() {
  return (
    <div className="container py-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Record New Payment</h1>
        <PaymentForm />
      </div>
    </div>
  );
}