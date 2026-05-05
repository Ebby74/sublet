'use client';

import { useState, useCallback } from 'react';
import type { FC } from 'react';
import { checkEligibility, getEligibilityDisplayText } from '@/lib/tenant-eligibility';

interface InquiryFormProps {
  roomId?: string;
  roomGender?: 'male' | 'female';
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
  roomGender,
  source = 'website',
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    nationality: 'malaysian',
    maritalStatus: 'single',
    hasChildren: false,
  });
  const [showEligibility, setShowEligibility] = useState(false);
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

    const eligibility = checkEligibility({
      nationality: formData.nationality,
      gender: roomGender ?? 'male',
      maritalStatus: formData.maritalStatus as any,
      hasChildren: formData.hasChildren,
    });

    if (!eligibility.eligible) {
      setError(eligibility.reason || 'You are not eligible for this room.');
      setIsLoading(false);
      return;
    }

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
          eligibility: {
            nationality: formData.nationality,
            maritalStatus: formData.maritalStatus,
            hasChildren: formData.hasChildren,
          },
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
          AIrene will contact you soon via WhatsApp.
        </p>
      </div>
    );
  }

  const eligibilityRequirements = getEligibilityDisplayText();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="bg-amber-50 border-b border-amber-200 rounded-t-lg p-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowEligibility(!showEligibility)}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold text-amber-800">Tenant Eligibility Required</span>
          </div>
          <svg className={`w-4 h-4 text-amber-600 transition-transform ${showEligibility ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {showEligibility && (
          <ul className="mt-3 space-y-1.5 text-xs text-amber-700">
            {eligibilityRequirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-500">•</span>
                {req}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6">
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
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Your full name"
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
            <label className="block text-sm font-medium mb-1">Nationality *</label>
            <select
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="malaysian">Malaysian</option>
              <option value="other">Other (not eligible)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Marital Status *</label>
            <select
              value={formData.maritalStatus}
              onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="single">Single (never married)</option>
              <option value="married-separated">Married but staying away from spouse</option>
              <option value="divorced-no-kids">Divorced (no children living with me)</option>
              <option value="divorced-with-kids">Divorced (with children living with me)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasChildren"
              checked={formData.hasChildren}
              onChange={(e) => setFormData({ ...formData, hasChildren: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="hasChildren" className="text-sm">I have children living with me</label>
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

          {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FF6600] text-white py-3 rounded-lg font-medium disabled:opacity-50 hover:bg-[#e55a00] transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send Inquiry'}
          </button>
        </div>
      </form>
    </div>
  );
};
