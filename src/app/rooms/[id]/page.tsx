'use client';

import { notFound } from 'next/navigation';
import { InquiryForm } from '@/components/prospect/inquiry-form';
import { PostHistoryPanel } from '@/components/ui/post-history-panel';
import { ShareButton } from '@/components/ui/share-button';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const SSM_NUMBER = 'SSM: 201803387155 (002908967-W)';

interface Room {
  id: string;
  name: string;
  type: string;
  beds: number;
  baths: number;
  areaSqft: number | null;
  rentSen: number;
  depositSen: number | null;
  photos: string | null;
  caption: string | null;
  descriptionV2: string | null;
  status: string;
  floor: {
    property: { id: string; name: string; address: string } | null;
  } | null;
}

function detectGender(room: { caption?: string | null; descriptionV2?: string | null; name?: string }): 'Muslimin' | 'Muslimah' | 'Mixed' {
  const text = `${room.caption || ''} ${room.descriptionV2 || ''} ${room.name || ''}`.toLowerCase();
  if (text.includes('muslimin') || text.includes('male') || text.includes('lelaki')) return 'Muslimin';
  if (text.includes('muslimah') || text.includes('female') || text.includes('perempuan')) return 'Muslimah';
  return 'Mixed';
}

function formatPrice(sen: number): string {
  const ringgit = Math.floor(sen / 100);
  return `RM ${ringgit.toLocaleString()}`;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoomDetailPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  if (!resolvedParams) return null;

  return <RoomDetailContent id={resolvedParams.id} />;
}

function RoomDetailContent({ id }: { id: string }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/rooms/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) setRoom(data.data as Room);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-neutral-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!room) {
    notFound();
  }

  const photos: string[] = room.photos ? JSON.parse(room.photos) : [];
  const gender = detectGender(room);
  const depositSen = room.depositSen ?? room.rentSen * 2;
  const moveInCostSen = room.rentSen + depositSen;
  const roomUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/rooms/${id}`
    : `https://sublet-zeta.vercel.app/rooms/${id}`;
  const shareTitle = `${room.name} - ${room.floor?.property?.name || 'AMR Home Solutions'} - ${formatPrice(room.rentSen)}/month`;

  const statusLabels: Record<string, string> = {
    available: 'Available Now',
    listed: 'Listed',
    rented: 'Rented',
    maintenance: 'Under Maintenance',
    draft: 'Draft',
  };

  const bedLabel = room.type === 'shared' ? 'Shared Room' : room.type === 'master' ? 'Master Room' : 'Single Room';
  const moveIn = room.status === 'available' ? 'Immediate' : 'Contact for date';
  const propertyName = room.floor?.property?.name || 'AMR Home Solutions';
  const fullTitle = `${propertyName} — ${room.name}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/amr-logo.jpg" alt="AMR" className="w-9 h-9 object-contain" />
            <div>
              <h1 className="text-base font-semibold text-neutral-900 leading-tight">AMR Home Solutions</h1>
              <p className="text-[11px] text-neutral-400 leading-tight">Your One Stop Real Estate Centre</p>
            </div>
          </Link>
          <nav className="flex items-center gap-5">
            <Link href="/" className="hidden md:block text-sm text-neutral-600 hover:text-[#FF6600] transition-colors">All Rooms</Link>
            <Link href="/auth/login" className="hidden md:block text-sm text-neutral-600 hover:text-[#FF6600] transition-colors">Log In</Link>
            <Link href="/inquiry" className="text-sm font-medium text-[#FF6600] hover:text-[#e55a00] transition-colors">
              Chat with AIrene
            </Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-3">
        <nav className="text-xs text-neutral-400">
          <Link href="/" className="hover:text-[#FF6600]">Rooms</Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-600">{room.name}</span>
        </nav>
      </div>

      {/* Photo Gallery */}
      <div className="max-w-6xl mx-auto px-4">
        {photos.length > 0 ? (
          <div>
            <div
              className="relative bg-neutral-100 overflow-hidden cursor-pointer aspect-[16/9] md:aspect-[21/9]"
              onClick={() => setModalOpen(true)}
            >
              <img
                src={photos[activePhoto]}
                alt={room.name}
                className="w-full h-full object-cover"
              />
              {photos.length > 1 && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-4 flex justify-center gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setActivePhoto(i); }}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activePhoto ? 'w-6 bg-[#FF6600]' : 'w-1.5 bg-white/70 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              )}
              {activePhoto > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setActivePhoto(activePhoto - 1); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-neutral-700 hover:bg-white shadow"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {activePhoto < photos.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setActivePhoto(activePhoto + 1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-neutral-700 hover:bg-white shadow"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-1.5 py-3 overflow-x-auto">
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`flex-shrink-0 w-20 h-14 md:w-28 md:h-18 overflow-hidden rounded-sm transition-opacity ${
                      i === activePhoto ? 'ring-2 ring-[#FF6600] opacity-100' : 'opacity-60 hover:opacity-90'
                    }`}
                  >
                    <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-[16/9] md:aspect-[21/9] bg-neutral-100 flex items-center justify-center">
            <img src="/amr-logo.jpg" alt={room.name} className="w-24 h-24 object-contain opacity-20" />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title Row */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-xl md:text-2xl font-semibold text-neutral-900 leading-tight">
              {fullTitle}
            </h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ShareButton url={roomUrl} title={shareTitle} />
            </div>
          </div>
          <p className="text-sm text-neutral-500 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {room.floor?.property?.address || 'Contact for exact location'}
          </p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium border ${
            gender === 'Muslimin'
              ? 'border-blue-200 text-blue-700 bg-blue-50'
              : gender === 'Muslimah'
              ? 'border-pink-200 text-pink-700 bg-pink-50'
              : 'border-neutral-200 text-neutral-600 bg-neutral-50'
          }`}>
            {gender}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium border ${
            room.status === 'available'
              ? 'border-green-200 text-green-700 bg-green-50'
              : room.status === 'rented'
              ? 'border-neutral-300 text-neutral-500 bg-neutral-50'
              : 'border-amber-200 text-amber-700 bg-amber-50'
          }`}>
            {statusLabels[room.status] || room.status}
          </span>
        </div>

        {/* Details Table */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">Room Details</h2>
          <div className="border border-neutral-200 rounded-sm">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-neutral-100">
                  <td className="py-2.5 px-4 text-neutral-500 w-44">Room Type</td>
                  <td className="py-2.5 px-4 font-medium text-neutral-800">{bedLabel}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2.5 px-4 text-neutral-500">Gender</td>
                  <td className="py-2.5 px-4 font-medium text-neutral-800">{gender}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2.5 px-4 text-neutral-500">Beds</td>
                  <td className="py-2.5 px-4 font-medium text-neutral-800">{room.beds}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2.5 px-4 text-neutral-500">Bathrooms</td>
                  <td className="py-2.5 px-4 font-medium text-neutral-800">{room.baths}</td>
                </tr>
                {room.areaSqft && (
                  <tr className="border-b border-neutral-100">
                    <td className="py-2.5 px-4 text-neutral-500">Size</td>
                    <td className="py-2.5 px-4 font-medium text-neutral-800">{room.areaSqft} sqft</td>
                  </tr>
                )}
                <tr className="border-b border-neutral-100">
                  <td className="py-2.5 px-4 text-neutral-500">Move In</td>
                  <td className="py-2.5 px-4 font-medium text-neutral-800">{moveIn}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-neutral-500">Min. Stay</td>
                  <td className="py-2.5 px-4 font-medium text-neutral-800">6 months (1-year contract)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Description */}
        {room.descriptionV2 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">Description</h2>
            <div className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap max-w-prose">
              {room.descriptionV2}
            </div>
          </div>
        )}

        {/* Pricing Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">Pricing</h2>
          <div className="border border-neutral-200 rounded-sm overflow-hidden">
            <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-neutral-900">{formatPrice(room.rentSen)}</span>
                <span className="text-sm text-neutral-500">/month</span>
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Monthly Rent</span>
                  <span className="font-medium text-neutral-800">{formatPrice(room.rentSen)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Deposit (2 months)</span>
                  <span className="font-medium text-neutral-800">{formatPrice(depositSen)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-2 flex justify-between">
                  <span className="font-medium text-neutral-800">Estimated Move-in Cost</span>
                  <span className="font-semibold text-[#FF6600]">{formatPrice(moveInCostSen)}</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 mt-3">All-inclusive: WiFi, utilities, cleaning. First month + deposit due upon signing.</p>
            </div>
          </div>
        </div>

        {/* Inquiry Section */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-4">Inquiry</h2>
          <InquiryForm roomId={id} source="website" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <Link
            href="/inquiry"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FF6600] hover:bg-[#e55a00] text-white font-medium py-2.5 px-5 rounded-sm transition-colors text-sm"
          >
            Chat with AIrene
          </Link>
          <a
            href={`https://wa.me/60132071626?text=${encodeURIComponent(`Hi, I'm interested in ${room.name} at ${propertyName}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-neutral-300 text-neutral-700 hover:border-[#FF6600] hover:text-[#FF6600] font-medium py-2.5 px-5 rounded-sm transition-colors text-sm"
          >
            WhatsApp Us
          </a>
        </div>

        <PostHistoryPanel roomId={id} />
      </div>

      {/* Photo Modal */}
      {modalOpen && photos.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setModalOpen(false)}
        >
          <div className="relative max-w-5xl w-full px-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={photos[activePhoto]}
              alt={`Photo ${activePhoto + 1}`}
              className="w-full max-h-[80vh] object-contain"
            />
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={(e) => { e.stopPropagation(); setActivePhoto(activePhoto > 0 ? activePhoto - 1 : photos.length - 1); }}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-white/60 text-xs">{activePhoto + 1} / {photos.length}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setActivePhoto(activePhoto < photos.length - 1 ? activePhoto + 1 : 0); }}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src="/amr-logo.jpg" alt="AMR" className="w-8 h-8 object-contain" />
            <span className="text-sm font-semibold text-neutral-800">AMR Home Solutions</span>
          </div>
          <p className="text-xs text-neutral-400 mb-1">{SSM_NUMBER}</p>
          <p className="text-xs text-neutral-400">&copy; 2026 AMR Home Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
