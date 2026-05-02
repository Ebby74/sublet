'use client';

import { useProspects } from '@/hooks/use-prospects';
import { ProspectList } from '@/components/prospect/prospect-list';

export default function ProspectsPage() {
  const { prospects, isLoading, error } = useProspects();

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-32 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prospects</h1>
        <a href="/inquiries/new" className="text-sm text-gray-500 hover:text-gray-700">
          View Inquiries
        </a>
      </div>
      <ProspectList prospects={prospects} />
    </div>
  );
}