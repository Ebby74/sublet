'use client';

import { useState, useCallback } from 'react';
import type { FC } from 'react';

interface InquiryFormProps {
  roomId?: string;
  source?: string;
  onSuccess?: (prospect: any) => void;
}

const SOURCE_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  website: 'Website',
  referral: 'Friend/Referral',
  walk_in: 'Walk-in',
};

export const InquiryForm: FC<InquiryFormProps> = ({
  roomId,
  source = 'website',
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getUtmData = useCallback(() => {
    if (typeof window === 'undefined') return undefined;
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get('utm_source');
    const utm_medium = params.get('utm_medium');
    const utm_campaign = params.get('utm_campaign');
    if (utm_source || utm_medium || utm_campaign) {
      return { utm_source, utm_medium, utm_campaign };
    }
    return undefined;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const phoneClean = formData.phone.replace(/\s/g, '');
    const phoneRegex = /^(\+60|60|0)?[1-9]\d{8,9}$/;
    if (!phoneRegex.test(phoneClean)) {
      setError('Please enter a valid Malaysian phone number');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: phoneClean,
          roomId,
          source,
          utmData: getUtmData(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSuccess(true);
      onSuccess?.(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 text-xl mb-2">Thank you!</div>
        <p className="text-green-700">
          We&apos;ve received your inquiry. We&apos;ll contact you soon via WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        Inquire About This Room
      </h3>
      
      {source !== 'website' && (
        <p className="text-sm text-gray-500 mb-4">
          Source: {SOURCE_LABELS[source] || source}
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone (WhatsApp) *</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="+60 123 456 789"
          />
          <p className="text-xs text-gray-500 mt-1">We&apos;ll contact you via WhatsApp</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email (optional)</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message (optional)</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="I&apos;m interested in this room..."
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send Inquiry'}
        </button>
      </div>
    </form>
  );
};