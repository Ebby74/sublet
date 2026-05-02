import { getTenants } from '@/services/tenant-service';
import { TenantList } from '@/components/tenant/tenant-list';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth';

export default async function TenantsPage() {
  const session = await getSession();
  const userId = session?.user?.id ?? '';
  const tenants = await getTenants(userId);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tenants</h1>
        <a href="/tenants/new">
          <Button>Add Tenant</Button>
        </a>
      </div>
      <TenantList tenants={tenants} />
    </div>
  );
}
