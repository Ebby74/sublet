'use client';

import { useState } from 'react';
import { TenantCard } from './tenant-card';

interface LeaseWithProperty {
  room: {
    floor: {
      property: {
        name: string;
      };
    };
  };
}

interface Tenant {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  icNumber: string | null;
  leases: Array<{ room: { floor: { property: { name: string } } } }>;
}

interface TenantListProps {
  tenants: Tenant[];
}

export function TenantList({ tenants }: TenantListProps) {
  const [view, setView] = useState<'cards' | 'table'>('cards');

  if (tenants.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tenants yet.</p>
        <p className="text-sm text-muted-foreground">Add your first tenant to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setView(view === 'cards' ? 'table' : 'cards')}
          className="text-sm border rounded px-3 py-1"
        >
          {view === 'cards' ? 'Table' : 'Cards'}
        </button>
      </div>

      {view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">IC Number</th>
                <th className="text-left p-3">Property</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="border-b">
                  <td className="p-3 font-medium">{tenant.name}</td>
                  <td className="p-3">{tenant.phone}</td>
                  <td className="p-3">{tenant.icNumber}</td>
                  <td className="p-3">{tenant.leases?.[0]?.room.floor.property.name ?? '-'}</td>
                  <td className="p-3">
                    <a href={`/tenants/${tenant.id}`} className="text-primary hover:underline">
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
