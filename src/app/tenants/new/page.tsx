import { TenantForm } from '@/components/tenant/tenant-form';
import { getSession } from '@/lib/auth';

export default async function NewTenantPage() {
  const session = await getSession();

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add New Tenant</h1>
      <TenantForm userId={session?.user.id} />
    </div>
  );
}
