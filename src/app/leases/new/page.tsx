import { LeaseWizard } from '@/components/lease/lease-wizard';
import { getSession } from '@/lib/auth';

export default async function NewLeasePage() {
  const session = await getSession();

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Lease</h1>
      <LeaseWizard userId={session?.user.id} />
    </div>
  );
}
