'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Prospect {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: string;
  roomId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  room?: {
    id: string;
    name: string;
    property?: { name: string };
  };
}

export function useProspects(statusFilter?: string) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProspects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await fetch(`/api/v1/prospects${params}`);
      if (!res.ok) throw new Error('Failed to fetch prospects');
      const data = await res.json();
      setProspects(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const updateStatus = useCallback(async (id: string, status: string) => {
    const res = await fetch(`/api/v1/prospects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    await fetchProspects();
  }, [fetchProspects]);

  const addNote = useCallback(async (id: string, note: { type: string; content: string }) => {
    const res = await fetch(`/api/v1/prospects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    });
    if (!res.ok) throw new Error('Failed to add note');
    await fetchProspects();
  }, [fetchProspects]);

  const deleteProspect = useCallback(async (id: string) => {
    const res = await fetch(`/api/v1/prospects/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete prospect');
    await fetchProspects();
  }, [fetchProspects]);

  return {
    prospects,
    isLoading,
    error,
    updateStatus,
    addNote,
    deleteProspect,
    refetch: fetchProspects,
  };
}
