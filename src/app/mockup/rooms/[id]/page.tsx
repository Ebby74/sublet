'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const roomData: Record<string, {
  title: string;
  property: string;
  location: string;
  price: string;
  deposit: string;
  tag: string;
  tagColor: string;
  gender: string;
  moveIn: string;
  beds: string;
  baths: string;
  area: string;
  available: number;
  contract: string;
  photos: string[];
  amenities: string[];
  description: string;
  floorPlan: string;
}> = {
  '1': {
    title: 'One Damansara — Master Bedroom',
    property: 'One Damansara',
    location: 'Damansara Damai, 47830 Petaling Jaya, Selangor',
    price: 'RM 1,200',
    deposit: 'RM 2,400',
    tag: 'Muslimin',
    tagColor: 'bg-blue-100 text-blue-800',
    gender: 'Male Only',
    moveIn: 'Immediate',
    beds: 'Single Bed',
    baths: 'Private Bathroom',
    area: '180 sqft',
    available: 1,
    contract: '6 months minimum, 1 year preferred',
    photos: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e958bd3987?w=900&q=80',
    ],
    amenities: ['Air Conditioning', 'WiFi Included', 'Fully Furnished', 'Wardrobe', 'Study Table', 'Window', 'Ceiling Fan', 'Private Bathroom'],
    description: 'Spacious master bedroom with private bathroom in a modern co-living setup. Located in Damansara Damai with easy access to major highways. Fully furnished with queen bed, wardrobe, study table, and air conditioning. Shared kitchen and living hall with other Muslimin tenants. 24-hour security with covered parking available.',
    floorPlan: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80',
  },
  '2': {
    title: 'Aster Residence — Premium Room',
    property: 'Aster Residence',
    location: 'Jalan Cheras, 56100 Cheras, WP Kuala Lumpur',
    price: 'RM 1,000',
    deposit: 'RM 2,000',
    tag: 'Muslimah',
    tagColor: 'bg-pink-100 text-pink-800',
    gender: 'Female Only',
    moveIn: '1 June',
    beds: 'Single Bed',
    baths: 'Shared Bathroom',
    area: '150 sqft',
    available: 1,
    contract: '6 months minimum, 1 year preferred',
    photos: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80',
    ],
    amenities: ['Air Conditioning', 'WiFi Included', 'Fully Furnished', 'Wardrobe', 'Window', 'Near MRT'],
    description: 'Premium room near MRT in Cheras. Perfect for young professionals starting their careers. Fully furnished with single bed, wardrobe, and study area. Shared bathroom with other Muslimah tenants. Building has gym, swimming pool, and 24-hour security.',
    floorPlan: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80',
  },
  '3': {
    title: 'Residensi M Vertica — Standard Room',
    property: 'Residensi M Vertica',
    location: 'Jalan Cheras, 56000 Kuala Lumpur',
    price: 'RM 700',
    deposit: 'RM 1,400',
    tag: 'Muslimah',
    tagColor: 'bg-pink-100 text-pink-800',
    gender: 'Female Only',
    moveIn: 'Immediate',
    beds: 'Single Bed',
    baths: 'Shared Bathroom',
    area: '130 sqft',
    available: 2,
    contract: '6 months minimum, 1 year preferred',
    photos: [
      'https://images.unsplash.com/photo-1584132967334-10e958bd3987?w=900&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80',
    ],
    amenities: ['Air Conditioning', 'WiFi Included', 'Fully Furnished', 'Wardrobe', 'Swimming Pool'],
    description: 'Budget-friendly standard room in Residensi M Vertica. Ideal for fresh graduates. Shared bathroom, fully furnished. Building features swimming pool, gymnasium, and 24-hour security.',
    floorPlan: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80',
  },
};

export default function MockRoomDetail({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  if (!resolvedParams) return null;

  const room = roomData[resolvedParams.id] || roomData['1'];
  const [activePhoto, setActivePhoto] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-[#FF6600] text-white text-center py-2 text-sm font-medium">
        AMR Home Solutions — Co-Living Room Rentals in KL · SSM Registered
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/mockup" className="flex items-center gap-3">
            <img src="/amr-logo.jpg" alt="AMR" className="w-10 h-10 object-contain rounded" />
            <div>
              <h1 className="text-lg font-bold text-[#FF6600] leading-tight">AMR Home Solutions</h1>
              <p className="text-xs text-slate-500 leading-tight">Your One Stop Real Estate Centre</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link href="/mockup" className="hover:text-[#FF6600] transition-colors">Back to Rooms</Link>
            <Link href="/auth/login" className="hover:text-[#FF6600] transition-colors">Log In</Link>
            <Link
              href="/inquiry"
              className="bg-[#FF6600] text-white px-5 py-2 rounded-full hover:bg-[#e55a00] transition-colors"
            >
              Chat with AIrene
            </Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3">
        <nav className="text-sm text-slate-500">
          <Link href="/mockup" className="hover:text-[#FF6600]">Rooms</Link>
          <span className="mx-2">/</span>
          <Link href="/mockup" className="hover:text-[#FF6600]">{room.property}</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800 font-medium">{room.title}</span>
        </nav>
      </div>

      {/* Photo Gallery */}
      <div className="container mx-auto px-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden">
          {/* Main photo */}
          <div className="relative h-80 md:h-96 cursor-pointer" onClick={() => setShowAllPhotos(true)}>
            <img
              src={room.photos[activePhoto]}
              alt={room.title}
              className="w-full h-full object-cover hover:opacity-95 transition-opacity"
            />
            <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
              {activePhoto + 1} / {room.photos.length} photos
            </div>
          </div>
          {/* Thumbnails */}
          <div className="grid grid-cols-2 gap-2 h-80 md:h-96">
            {room.photos.slice(0, 4).map((photo, i) => (
              <div
                key={i}
                className={`relative overflow-hidden cursor-pointer rounded-lg ${
                  activePhoto === i ? 'ring-3 ring-[#FF6600]' : 'hover:opacity-90'
                }`}
                onClick={() => setActivePhoto(i)}
              >
                <img
                  src={photo}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-2">
            {/* Title & Tags */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${room.tagColor}`}>
                  {room.tag}
                </span>
                {room.available === 1 && (
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700 animate-pulse">
                    Only 1 Room Left!
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">{room.title}</h1>
              <p className="text-slate-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {room.location}
              </p>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl mb-1">🛏</p>
                <p className="text-sm text-slate-500">Bed Type</p>
                <p className="font-semibold text-slate-800">{room.beds}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl mb-1">{room.gender === 'Male Only' ? '♂' : '♀'}</p>
                <p className="text-sm text-slate-500">Gender</p>
                <p className="font-semibold text-slate-800">{room.gender}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl mb-1">📅</p>
                <p className="text-sm text-slate-500">Move In</p>
                <p className="font-semibold text-slate-800">{room.moveIn}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl mb-1">📐</p>
                <p className="text-sm text-slate-500">Size</p>
                <p className="font-semibold text-slate-800">{room.area}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">About This Room</h2>
              <p className="text-slate-600 leading-relaxed">{room.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">What's Included</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {room.amenities.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700">
                    <span className="text-[#FF6600] text-lg">✓</span>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contract Terms */}
            <div className="bg-slate-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Contract Terms</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Minimum Stay</span>
                  <span className="font-semibold text-slate-800">6 months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contract</span>
                  <span className="font-semibold text-slate-800">{room.contract}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Early Exit</span>
                  <span className="font-semibold text-red-600">Deposit forfeited before 6 months</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Pricing & CTA (sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-[#FF6600]">{room.price}</span>
                <span className="text-slate-500">/month</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">All-inclusive: WiFi, utilities, cleaning</p>

              <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Monthly Rent</span>
                  <span className="font-semibold text-slate-800">{room.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Deposit (2 months)</span>
                  <span className="font-semibold text-slate-800">{room.deposit}</span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-800">Move-in Cost</span>
                    <span className="font-bold text-[#FF6600] text-lg">
                      RM {(parseInt(room.price.replace(/\D/g, '')) + parseInt(room.deposit.replace(/\D/g, ''))).toLocaleString()}
                    </span>
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

              <button className="w-full block text-center bg-white border-2 border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600]/5 font-semibold py-3.5 rounded-xl transition-colors text-base">
                📞 WhatsApp Us
              </button>

              <p className="text-xs text-slate-400 text-center mt-4">
                AIrene replies in &lt;2 minutes • 24/7
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen photo modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setShowAllPhotos(false)}>
          <div className="relative max-w-4xl w-full px-4">
            <button
              onClick={() => setShowAllPhotos(false)}
              className="absolute top-0 right-0 text-white text-3xl hover:text-[#FF6600] transition-colors"
            >
              ✕
            </button>
            <img
              src={room.photos[activePhoto]}
              alt={`Photo ${activePhoto + 1}`}
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="flex justify-center gap-2 mt-4">
              {room.photos.map((photo, i) => (
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

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <img src="/amr-logo.jpg" alt="AMR" className="w-10 h-10 object-contain rounded" />
          <span className="text-lg font-bold text-[#FF6600]">AMR Home Solutions</span>
        </div>
        <p className="text-slate-500 text-xs">© 2026 AMR Home Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
}
