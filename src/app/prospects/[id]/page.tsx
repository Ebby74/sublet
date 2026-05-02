'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProspects, Prospect } from '@/hooks/use-prospects';

const STATUS_TRANSITIONS: Record<string, string[]> = {
  new: ['contacted'],
  contacted: ['interested'],
  interested: ['viewing_scheduled'],
  viewing_scheduled: ['viewed'],
  viewed: ['offer_made'],
  offer_made: ['offer_accepted', 'viewed'],
  offer_accepted: ['tenant'],
};

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

export default function ProspectDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { prospects, updateStatus, addNote, isLoading } = useProspects();
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('note');

  const prospect = prospects.find((p: Prospect) => p.id === id);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!prospect) {
    return <div className="p-6">Prospect not found</div>;
  }

  const nextStatuses = STATUS_TRANSITIONS[prospect.status] || [];

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-blue-600 mb-4">
          ← Back
        </button>
        <h1 className="text-2xl font-bold">{prospect.name}</h1>
        <p className="text-gray-500">
          {prospect.phone && `${prospect.phone} • `}
          {prospect.email}
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-4">Status</h2>
        <div className="flex items-center gap-4">
          <span className="text-lg">{STATUS_LABELS[prospect.status]}</span>
          
          {nextStatuses.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  updateStatus(prospect.id, e.target.value);
                }
              }}
              className="border rounded px-3 py-2"
              defaultValue=""
            >
              <option value="">Move to...</option>
              {nextStatuses.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Source */}
        <div className="mt-4 text-sm text-gray-500">
          Source: {prospect.source || 'Direct'}
          {prospect.room && (
            <span> • Room: {prospect.room.name}</span>
          )}
        </div>
      </div>

      {/* Communication Log */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-4">Communication Log</h2>
        
        {/* Notes List */}
        <div className="space-y-3 mb-4">
          {prospect.notes && JSON.parse(prospect.notes).map((note: any, i: number) => (
            <div key={i} className="border-b pb-2">
              <div className="text-sm text-gray-500">
                {note.type} • {new Date(note.createdAt).toLocaleDateString()}
              </div>
              <div>{note.content}</div>
            </div>
          ))}
        </div>

        {/* Add Note Form */}
        <div className="flex gap-2">
          <select
            value={noteType}
            onChange={(e) => setNoteType(e.target.value)}
            className="border rounded px-2"
          >
            <option value="note">Note</option>
            <option value="call">Call</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={() => {
              addNote(prospect.id, { type: noteType, content: newNote });
              setNewNote('');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}