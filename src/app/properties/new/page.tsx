import { PropertyForm } from '@/components/property/property-form';
import { getSession } from '@/lib/auth';

export default async function NewPropertyPage() {
  const session = await getSession();

  return (
    <div className="container py-4 md:py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Property</h1>
      <PropertyForm userId={session?.user.id} />
    </div>
  );
}
