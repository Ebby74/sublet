'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface TenantFormProps {
  userId?: string;
  tenant?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    icNumber: string;
  };
}

export function TenantForm({ userId, tenant }: TenantFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [icFrontFile, setIcFrontFile] = useState<File | null>(null);
  const [icBackFile, setIcBackFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: tenant?.name ?? '',
    phone: tenant?.phone ?? '',
    email: tenant?.email ?? '',
    icNumber: tenant?.icNumber ?? '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Upload IC documents first if provided
    let icFrontUrl: string | null = null;
    let icBackUrl: string | null = null;

    if (icFrontFile) {
      const frontFormData = new FormData();
      frontFormData.append('file', icFrontFile);
      const frontRes = await fetch(`/api/v1/tenants/upload`, {
        method: 'POST',
        body: frontFormData,
      });
      if (frontRes.ok) {
        const frontData = await frontRes.json();
        icFrontUrl = frontData.url;
      }
    }

    if (icBackFile) {
      const backFormData = new FormData();
      backFormData.append('file', icBackFile);
      const backRes = await fetch(`/api/v1/tenants/upload`, {
        method: 'POST',
        body: backFormData,
      });
      if (backRes.ok) {
        const backData = await backRes.json();
        icBackUrl = backData.url;
      }
    }

    const method = tenant ? 'PUT' : 'POST';
    const url = tenant ? `/api/v1/tenants/${tenant.id}` : '/api/v1/tenants';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        userId,
        icFrontUrl,
        icBackUrl,
      }),
    });

    if (res.ok) {
      router.push('/tenants');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Full Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border rounded-md px-3 py-2"
          placeholder="Full legal name as in IC"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone Number *</label>
        <input
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full border rounded-md px-3 py-2"
          placeholder="+60xxxxxxxxx"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          IC Number <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.icNumber}
          onChange={(e) => setFormData({ ...formData, icNumber: e.target.value })}
          className="w-full border rounded-md px-3 py-2"
          placeholder="xxxxxxxxxx (12 digits)"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Required for LHDN compliance
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">IC Document - Front *</label>
        <input
          type="file"
          accept="image/*,.pdf"
          required={!tenant}
          onChange={(e) => setIcFrontFile(e.target.files?.[0] ?? null)}
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">IC Document - Back *</label>
        <input
          type="file"
          accept="image/*,.pdf"
          required={!tenant}
          onChange={(e) => setIcBackFile(e.target.files?.[0] ?? null)}
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      <button
        type="button"
        onClick={() => setShowMore(!showMore)}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {showMore ? '▲ Less details' : '▼ More details'}
      </button>

      {showMore && (
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Email (optional)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="email@example.com"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : tenant ? 'Update Tenant' : 'Add Tenant'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
