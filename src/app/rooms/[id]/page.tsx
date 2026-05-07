'use client';

import { notFound } from 'next/navigation';
import { InquiryForm } from '@/components/prospect/inquiry-form';
import { PostHistoryPanel } from '@/components/ui/post-history-panel';
import { ShareButton } from '@/components/ui/share-button';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const SSM_NUMBER = 'SSM: 2026XXXXXXX';

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
  const [activePhoto, setActivePhoto] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  if (!resolvedParams) return null;

  return <RoomDetailContent id={resolvedParams.id} activePhoto={activePhoto} setActivePhoto={setActivePhoto} showAllPhotos={showAllPhotos} setShowAllPhotos={setShowAllPhotos} />;
}

function RoomDetailContent({ id, activePhoto, setActivePhoto, showAllPhotos, setShowAllPhotos }: {
  id: string;
  activePhoto: number;
  setActivePhoto: (i: number) => void;
  showAllPhotos: boolean;
  setShowAllPhotos: (v: boolean) => void;
}) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!room) {
    notFound();
  }

  const photos: string[] = room.photos ? JSON.parse(room.photos) : [];
  const gender = detectGender(room);
  const genderLabel = gender === 'Muslimin' ? 'Male Only' : gender === 'Muslimah' ? 'Female Only' : 'Mixed';
  const price = formatPrice(room.rentSen);
  const depositSen = room.depositSen ?? room.rentSen * 2;
  const deposit = formatPrice(depositSen);
  const moveInCost = formatPrice(room.rentSen + depositSen);
  const roomUrl = `https://sublet-zeta.vercel.app/rooms/${id}`;
  const shareTitle = `${room.name} - ${room.floor?.property?.name || 'AMR Home Solutions'} - ${price}/month`;

  const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-700',
    listed: 'bg-yellow-100 text-yellow-700',
    rented: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-orange-100 text-orange-700',
    draft: 'bg-gray-100 text-gray-700',
  };

  const statusLabels: Record<string, string> = {
    available: 'Available',
    listed: 'Listed',
    rented: 'Rented',
    maintenance: 'Maintenance',
    draft: 'Draft',
  };

  const bedLabel = room.type === 'shared' ? 'Shared Room' : room.type === 'master' ? 'Master Room' : 'Single Room';
  const moveIn = room.status === 'available' ? 'Immediate' : 'Contact for date';

  const amenities: string[] = [
    'Air Conditioning',
    'WiFi Included',
    'Fully Furnished',
    'Wardrobe',
    room.baths > 1 ? 'Private Bathroom' : 'Shared Bathroom',
    'Ceiling Fan',
    'Window',
    '24-Hour Security',
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#FF6600] text-white text-center py-2 text-sm font-medium">
        AMR Home Solutions — Muslim-Only Co-Living in KL · {SSM_NUMBER}
      </div>

      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/amr-logo.jpg" alt="AMR" className="w-10 h-10 object-contain rounded" />
            <div>
              <h1 className="text-lg font-bold text-[#FF6600] leading-tight">AMR Home Solutions</h1>
              <p className="text-xs text-slate-500 leading-tight">Your One Stop Real Estate Centre</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="hidden md:block text-sm font-medium text-slate-700 hover:text-[#FF6600] transition-colors">Back to Rooms</Link>
            <Link href="/auth/login" className="hidden md:block text-sm text-slate-600 hover:text-[#FF6600] font-medium transition-colors">Log In</Link>
            <Link href="/inquiry" className="bg-[#FF6600] text-white px-5 py-2 rounded-full hover:bg-[#e55a00] transition-colors text-sm font-medium">
              Chat with AIrene
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-3">
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:text-[#FF6600]">Rooms</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800 font-medium">{room.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 mb-8">
        {photos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden">
            <div className="relative h-80 md:h-96 cursor-pointer" onClick={() => setShowAllPhotos(true)}>
              <img src={photos[activePhoto]} alt={room.name} className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                {activePhoto + 1} / {photos.length} photos
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 h-80 md:h-96">
              {photos.slice(0, 4).map((photo, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden cursor-pointer rounded-lg ${
                    activePhoto === i ? 'ring-3 ring-[#FF6600]' : 'hover:opacity-90'
                  }`}
                  onClick={() => setActivePhoto(i)}
                >
                  <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-80 md:h-96 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
            <img src="/amr-logo.jpg" alt={room.name} className="w-32 h-32 object-contain opacity-30" />
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  gender === 'Muslimin' ? 'bg-blue-100 text-blue-800' : gender === 'Muslimah' ? 'bg-pink-100 text-pink-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {gender}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[room.status] || statusColors.draft}`}>
                  {statusLabels[room.status] || room.status}
                </span>
                <ShareButton url={roomUrl} title={shareTitle} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                {room.floor?.property?.name ? `${room.floor.property.name} — ${room.name}` : room.name}
              </h1>
              <p className="text-slate-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {room.floor?.property?.address || 'Contact for exact location'}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl mb-1">🛏</p>
                <p className="text-sm text-slate-500">Room Type</p>
                <p className="font-semibold text-slate-800">{bedLabel}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl mb-1">{genderLabel === 'Male Only' ? '♂' : genderLabel === 'Female Only' ? '♀' : '⚥'}</p>
                <p className="text-sm text-slate-500">Gender</p>
                <p className="font-semibold text-slate-800">{genderLabel}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl mb-1">📅</p>
                <p className="text-sm text-slate-500">Move In</p>
                <p className="font-semibold text-slate-800">{moveIn}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl mb-1">📐</p>
                <p className="text-sm text-slate-500">Size</p>
                <p className="font-semibold text-slate-800">{room.areaSqft ? `${room.areaSqft} sqft` : 'N/A'}</p>
              </div>
            </div>

            {room.descriptionV2 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">About This Room</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{room.descriptionV2}</p>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">What&apos;s Included</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {amenities.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700">
                    <span className="text-[#FF6600] text-lg">✓</span>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Contract Terms</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Minimum Stay</span>
                  <span className="font-semibold text-slate-800">6 months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contract</span>
                  <span className="font-semibold text-slate-800">1 year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Early Exit</span>
                  <span className="font-semibold text-red-600">Deposit forfeited before 6 months</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Interested? Inquire Now</h2>
              <InquiryForm roomId={id} source="website" />
            </div>

            <PostHistoryPanel roomId={id} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-[#FF6600]">{price}</span>
                <span className="text-slate-500">/month</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">All-inclusive: WiFi, utilities, cleaning</p>

              <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Monthly Rent</span>
                  <span className="font-semibold text-slate-800">{price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Deposit (2 months)</span>
                  <span className="font-semibold text-slate-800">{deposit}</span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-800">Move-in Cost</span>
                    <span className="font-bold text-[#FF6600] text-lg">{moveInCost}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">(First month + deposit)</p>
                </div>
              </div>

              <Link
                href="/inquiry"
                className="w-full block text-center bg-[#FF6600] hover:bg-[#e55a00] text-white font-bold py-3.5 rounded-xl transition-colors text-base mb-3"
              >
                💬 Inquire via AIrene
              </Link>

              <a
                href={`https://wa.me/60123456789?text=${encodeURIComponent(`Hi, I'm interested in ${room.name} at ${room.floor?.property?.name || 'AMR Home Solutions'}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-white border-2 border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600]/5 font-semibold py-3.5 rounded-xl transition-colors text-base"
              >
                📞 WhatsApp Us
              </a>

              <p className="text-xs text-slate-400 text-center mt-4">
                AIrene replies in &lt;2 minutes • 24/7
              </p>
            </div>
          </div>
        </div>
      </div>

      {showAllPhotos && photos.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setShowAllPhotos(false)}>
          <div className="relative max-w-4xl w-full px-4">
            <button
              onClick={() => setShowAllPhotos(false)}
              className="absolute top-0 right-0 text-white text-3xl hover:text-[#FF6600] transition-colors z-10"
            >
              ✕
            </button>
            <img src={photos[activePhoto]} alt={`Photo ${activePhoto + 1}`} className="w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="flex justify-center gap-2 mt-4">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActivePhoto(i); }}
                  className={`w-16 h-12 rounded overflow-hidden ${
                    activePhoto === i ? 'ring-2 ring-[#FF6600]' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="py-8 bg-slate-900 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <img src="/amr-logo.jpg" alt="AMR" className="w-10 h-10 object-contain rounded" />
          <span className="text-lg font-bold text-[#FF6600]">AMR Home Solutions</span>
        </div>
        <p className="text-slate-500 text-xs mb-1">{SSM_NUMBER}</p>
        <p className="text-slate-500 text-xs">© 2026 AMR Home Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
}
