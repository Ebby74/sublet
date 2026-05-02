import { getPayments } from '@/services/payment-service';
import { PaymentList } from '@/components/payment/payment-list';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth';

export default async function PaymentsPage() {
  const session = await getSession();
  const userId = session?.user?.id ?? '';
  const payments = await getPayments(userId);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payments</h1>
        <div className="flex gap-2">
          <a href="/payments/new">
            <Button>Record Payment</Button>
          </a>
        </div>
      </div>
      <PaymentList initialPayments={payments} />
    </div>
  );
}