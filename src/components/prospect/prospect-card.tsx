'use client';

import Link from 'next/link';
import type { Prospect } from '@/hooks/use-prospects';

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  viewing_scheduled: 'Viewing Scheduled',
  viewed: 'Viewed',
  offer_made: 'Offer Made',
  offer_accepted: 'Offer Accepted',
  tenant: 'Tenant',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  interested: 'bg-orange-100 text-orange-800',
  viewing_scheduled: 'bg-purple-100 text-purple-800',
  viewed: 'bg-indigo-100 text-indigo-800',
  offer_made: 'bg-pink-100 text-pink-800',
  offer_accepted: 'bg-green-100 text-green-800',
  tenant: 'bg-green-100 text-green-800',
};

interface ProspectCardProps {
  prospect: Prospect;
  onDelete?: () => void;
}

export function ProspectCard({ prospect, onDelete }: ProspectCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Link href={`/prospects/${prospect.id}`}>
            <h3 className="font-semibold text-lg hover:text-blue-600">{prospect.name}</h3>
          </Link>
          <p className="text-sm text-gray-500">
            {prospect.phone && <span>{prospect.phone}</span>}
            {prospect.email && <span> • {prospect.email}</span>}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[prospect.status] || 'bg-gray-100'}`}>
          {STATUS_LABELS[prospect.status] || prospect.status}
        </span>
      </div>
      
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="text-gray-500">
          {prospect.source && <span className="capitalize">{prospect.source}</span>}
          {prospect.room && (
            <span> • {prospect.room.name}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Link 
            href={`/prospects/${prospect.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View Details
          </Link>
          {onDelete && (
            <button 
              onClick={onDelete}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}