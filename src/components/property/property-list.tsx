'use client';

import { useState } from 'react';
import { PropertyCard } from './property-card';
import { formatCurrency } from '@/lib/format';

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  rentAmountSen: number;
  status: string;
}

interface PropertyListProps {
  properties: Property[];
}

export function PropertyList({ properties }: PropertyListProps) {
  const [view, setView] = useState<'cards' | 'table'>('cards');

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No properties yet.</p>
        <p className="text-sm text-muted-foreground">Add your first property to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4 lg:hidden">
        <button
          onClick={() => setView(view === 'cards' ? 'table' : 'cards')}
          className="text-sm border rounded px-3 py-1"
        >
          {view === 'cards' ? 'Table' : 'Cards'}
        </button>
      </div>

      {view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Address</th>
                <th className="text-left p-3">Type</th>
                <th className="text-right p-3">Rent</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id} className="border-b">
                  <td className="p-3 font-medium">{property.name}</td>
                  <td className="p-3">{property.address}</td>
                  <td className="p-3">{property.type}</td>
                  <td className="p-3 text-right">{formatCurrency(property.rentAmountSen)}</td>
                  <td className="p-3 capitalize">{property.status.replace('-', ' ')}</td>
                  <td className="p-3">
                    <a href={`/properties/${property.id}`} className="text-primary hover:underline">
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