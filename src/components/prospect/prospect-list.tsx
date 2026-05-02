'use client';

import { useState } from 'react';
import { ProspectCard } from './prospect-card';
import type { Prospect } from '@/hooks/use-prospects';

interface ProspectListProps {
  prospects: Prospect[];
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interested', label: 'Interested' },
  { value: 'viewing_scheduled', label: 'Viewing Scheduled' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'offer_made', label: 'Offer Made' },
  { value: 'offer_accepted', label: 'Offer Accepted' },
];

export function ProspectList({ prospects }: ProspectListProps) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState<'cards' | 'table'>('cards');

  const filteredProspects = statusFilter === 'all'
    ? prospects
    : prospects.filter(p => p.status === statusFilter);

  if (prospects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No prospects yet.</p>
        <p className="text-sm text-muted-foreground">Inquiries will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-500">
            {filteredProspects.length} of {prospects.length}
          </span>
          <button
            onClick={() => setView(view === 'cards' ? 'table' : 'cards')}
            className="text-sm border rounded px-3 py-1"
          >
            {view === 'cards' ? 'Table' : 'Cards'}
          </button>
        </div>
      </div>

      {view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProspects.map((prospect) => (
            <ProspectCard key={prospect.id} prospect={prospect} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Source</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProspects.map((prospect) => (
                <tr key={prospect.id} className="border-b">
                  <td className="p-3 font-medium">{prospect.name}</td>
                  <td className="p-3">{prospect.phone || '-'}</td>
                  <td className="p-3">{prospect.email || '-'}</td>
                  <td className="p-3">
                    <span className="capitalize">
                      {prospect.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 capitalize">
                    {prospect.source?.replace('_', ' ') || '-'}
                  </td>
                  <td className="p-3">
                    <a
                      href={`/prospects/${prospect.id}`}
                      className="text-primary hover:underline"
                    >
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