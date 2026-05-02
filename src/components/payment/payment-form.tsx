'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { INCOME_TYPES, EXPENSE_TYPES, LHDN_CATEGORIES } from '@/lib/payment-constants';
import { INCOME_SOURCES, getSuggestedIncomeSource } from '@/lib/income-sources';
import type { IncomeSource } from '@/lib/income-sources';

interface LeaseOption {
  id: string;
  propertyName: string;
  tenantName: string;
  monthlyRentSen: number;
}

interface TenantOption {
  id: string;
  name: string;
}

interface PaymentFormProps {
  userId?: string;
  payment?: {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    referenceNumber: string;
    paidAt: string | null;
    dueDate: string | null;
    status: string;
    leaseId: string | null;
    tenantId: string | null;
    category: string | null;
  };
}

export function PaymentForm({ userId = undefined, payment }: PaymentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [leases, setLeases] = useState<LeaseOption[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);

  const [formData, setFormData] = useState({
    type: payment?.type ?? ('income' as 'income' | 'expense'),
    amount: payment?.amount ?? '',
    description: payment?.description ?? '',
    referenceNumber: payment?.referenceNumber ?? '',
    paidAt: payment?.paidAt ?? '',
    dueDate: payment?.dueDate ?? '',
    leaseId: payment?.leaseId ?? '',
    tenantId: payment?.tenantId ?? '',
    category: payment?.category ?? '',
    incomeSource: 'unallocated' as IncomeSource,
  });

  const [suggestedSource, setSuggestedSource] = useState<IncomeSource | null>(null);

  // Fetch leases and tenants for dropdowns
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Promise.all([
        fetch('/api/v1/leases').then((r) => r.json()),
        fetch('/api/v1/tenants').then((r) => r.json()),
      ]).then(([leasesData, tenantsData]) => {
        if (leasesData.data) {
          setLeases(
            leasesData.data.map((l: { id: string; property: { name: string }; tenant: { name: string }; monthlyRentSen: number }) => ({
              id: l.id,
              propertyName: l.property?.name || 'Unknown',
              tenantName: l.tenant?.name || 'Unknown',
              monthlyRentSen: l.monthlyRentSen,
            }))
          );
        }
        if (tenantsData.data) {
          setTenants(tenantsData.data.map((t: { id: string; name: string }) => ({
            id: t.id,
            name: t.name,
          })));
        }
      });
    }
  }, []);

  // Smart suggestion: update income source suggestion when category changes
  const updateSuggestedSource = useCallback((category: string) => {
    if (formData.type === 'expense' && category) {
      const suggested = getSuggestedIncomeSource(category);
      setSuggestedSource(suggested);
    } else {
      setSuggestedSource(null);
    }
  }, [formData.type]);

  // Watch for category changes to trigger smart suggestions
  useEffect(() => {
    if (formData.category) {
      updateSuggestedSource(formData.category);
    }
  }, [formData.category, updateSuggestedSource]);

  const handleLeaseChange = (leaseId: string) => {
    const lease = leases.find((l) => l.id === leaseId);
    setFormData({
      ...formData,
      leaseId,
      tenantId: lease ? tenants.find((t) => t.name === lease.tenantName)?.id ?? '' : formData.tenantId,
      amount: lease ? (lease.monthlyRentSen / 100) : formData.amount,
    });
  };

  const paymentTypes = formData.type === 'income' ? INCOME_TYPES : EXPENSE_TYPES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount as string),
      paidAt: formData.paidAt ? new Date(formData.paidAt).toISOString() : undefined,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      leaseId: formData.leaseId || null,
      tenantId: formData.tenantId || null,
      category: formData.category || null,
      userId,
    };

    const method = payment ? 'PUT' : 'POST';
    const url = payment ? `/api/v1/payments/${payment.id}` : '/api/v1/payments';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/payments/${data.data.id}`);
      router.refresh();
    } else {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Toggle */}
      <div>
        <label className="block text-sm font-medium mb-2">Payment Type *</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="income"
              checked={formData.type === 'income'}
              onChange={() => setFormData({ ...formData, type: 'income', category: '' })}
              className="w-4 h-4 text-green-600"
            />
            <span className="font-medium text-green-600">Income</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="expense"
              checked={formData.type === 'expense'}
              onChange={() => setFormData({ ...formData, type: 'expense', category: '' })}
              className="w-4 h-4 text-blue-600"
            />
            <span className="font-medium text-blue-600">Expense</span>
          </label>
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium mb-1">Amount (MYR) *</label>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full border rounded-md px-3 py-2"
          placeholder="0.00"
        />
      </div>

      {/* Payment Type (Category) */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {formData.type === 'income' ? 'Income Category' : 'Expense Category'} *
        </label>
        <select
          required
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full border rounded-md px-3 py-2"
        >
          <option value="">Select...</option>
          {paymentTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date Paid</label>
          <input
            type="date"
            value={formData.paidAt}
            onChange={(e) => setFormData({ ...formData, paidAt: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
      </div>

      {/* Lease Selection (for income) */}
      {formData.type === 'income' && (
        <div>
          <label className="block text-sm font-medium mb-1">Link to Lease (optional)</label>
          <select
            value={formData.leaseId}
            onChange={(e) => handleLeaseChange(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">Standalone payment</option>
            {leases.map((lease) => (
              <option key={lease.id} value={lease.id}>
                {lease.propertyName} - {lease.tenantName}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            Selecting a lease auto-populates tenant and amount
          </p>
        </div>
      )}

      {/* Tenant Selection (for standalone) */}
      {formData.type === 'income' && !formData.leaseId && (
        <div>
          <label className="block text-sm font-medium mb-1">Tenant (optional)</label>
          <select
            value={formData.tenantId}
            onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">Select tenant...</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* LHDN Category (for expenses) */}
      {formData.type === 'expense' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">LHDN Category (optional)</label>
            <select
              value={formData.category as string}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value });
              }}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select category...</option>
              {LHDN_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              For tax deduction purposes
            </p>
          </div>

          {/* Income Source (for expenses) */}
          <div>
            <label className="block text-sm font-medium mb-1">Income Source (optional)</label>
            <select
              value={formData.incomeSource}
              onChange={(e) => setFormData({ ...formData, incomeSource: e.target.value as IncomeSource })}
              className="w-full border rounded-md px-3 py-2"
            >
              {INCOME_SOURCES.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>
            {suggestedSource && suggestedSource !== 'unallocated' && suggestedSource !== formData.incomeSource && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Suggested:</span>{' '}
                  {INCOME_SOURCES.find(s => s.value === suggestedSource)?.label}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Based on: {formData.category}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description (optional)</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border rounded-md px-3 py-2"
          rows={3}
          placeholder="Add any notes..."
        />
      </div>

      {/* Reference Number */}
      <div>
        <label className="block text-sm font-medium mb-1">Reference Number (optional)</label>
        <input
          type="text"
          value={formData.referenceNumber}
          onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
          className="w-full border rounded-md px-3 py-2"
          placeholder="Auto-generated if left blank"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : payment ? 'Update Payment' : 'Record Payment'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}