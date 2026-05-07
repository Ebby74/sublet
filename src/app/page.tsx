'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { trackEvent } from '@/lib/analytics';
import { ShareButton } from '@/components/ui/share-button';

const SSM_NUMBER = 'SSM: 2026XXXXXXX';
const WHATSAPP_NUMBER = '60123456789';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface DbRoom {
  id: string;
  name: string;
  type: string;
  beds: number;
  rentSen: number;
  depositSen?: number | null;
  photos?: string | null;
  caption?: string | null;
  descriptionV2?: string | null;
  status: string;
  floor?: { property?: { id: string; name: string; address: string } | null } | null;
}

interface RoomListing {
  id: string;
  img: string;
  title: string;
  price: string;
  deposit: string;
  moveInCost: string;
  location: string;
  property: string;
  tag: 'Muslimin' | 'Muslimah' | 'Mixed';
  beds: string;
  gender: string;
  moveIn: string;
  area: string;
}

function formatPrice(sen: number): string {
  const ringgit = Math.floor(sen / 100);
  const senRemain = sen % 100;
  return `RM ${ringgit.toLocaleString()}${senRemain > 0 ? `.${senRemain.toString().padStart(2, '0')}` : ''}`;
}

function detectGender(room: DbRoom): 'Muslimin' | 'Muslimah' | 'Mixed' {
  const text = `${room.caption || ''} ${room.descriptionV2 || ''} ${room.name || ''}`.toLowerCase();
  if (text.includes('muslimin') || text.includes('male') || text.includes('lelaki')) return 'Muslimin';
  if (text.includes('muslimah') || text.includes('female') || text.includes('perempuan')) return 'Muslimah';
  return 'Mixed';
}

function getMoveInDate(room: DbRoom): string {
  if (room.status === 'available') return 'Immediate';
  return 'Contact for date';
}

function extractArea(address: string): string {
  const parts = address.split(',');
  if (parts.length >= 2) {
    return parts[parts.length - 2].trim();
  }
  return parts[0].trim();
}

const LandingPage: FC = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'muslimin' | 'muslimah'>('all');
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dbRooms, setDbRooms] = useState<RoomListing[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data?.user) setUser(data.user as User);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    fetch('/api/v1/rooms?public=true')
      .then(res => res.json())
      .then((result) => {
        const rooms: DbRoom[] = result.data || [];
        const availableRooms = rooms.filter(r => r.status === 'available' || r.status === 'listed');

        const parsed: RoomListing[] = availableRooms.map((r) => {
          const photos: string[] = r.photos ? JSON.parse(r.photos) : [];
          const property = r.floor?.property;
          const gender = detectGender(r);
          const price = formatPrice(r.rentSen);
          const depositSen = r.depositSen ?? r.rentSen * 2;
          const deposit = formatPrice(depositSen);
          const totalMoveIn = Math.floor((r.rentSen + depositSen) / 100);
          const moveInCost = `RM ${totalMoveIn.toLocaleString()}`;
          const bedLabel = r.type === 'shared' ? 'Shared Room' : r.type === 'master' ? 'Master Room' : 'Single Room';

          return {
            id: r.id,
            img: photos.length > 0 ? photos[0] : '/amr-logo.jpg',
            title: `${r.name}`,
            price,
            deposit,
            moveInCost,
            location: property?.address || property?.name || 'Kuala Lumpur',
            property: property?.name || 'AMR Home',
            tag: gender,
            beds: bedLabel,
            gender: gender === 'Muslimin' ? 'Male Only' : gender === 'Muslimah' ? 'Female Only' : 'Mixed',
            moveIn: getMoveInDate(r),
            area: property?.address ? extractArea(property.address) : 'KL',
          };
        });

        setDbRooms(parsed);
        setIsLoadingRooms(false);
      })
      .catch(() => {
        setIsLoadingRooms(false);
      });
  }, []);

  const filteredRooms = filter === 'all'
    ? dbRooms
    : dbRooms.filter(r => r.tag.toLowerCase() === filter);

  const handleChatWithAIrene = () => {
    trackEvent({ event: 'chat_launched', params: { source: 'landing_page' } });
    router.push('/inquiry');
  };

  const handleWhatsApp = () => {
    trackEvent({ event: 'whatsapp_click', params: { source: 'landing_page' } });
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I\'m interested in a room at AMR Home Solutions')}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3">
                <img src="/amr-logo.jpg" alt="AMR" className="w-9 h-9 object-contain" />
                <div className="hidden sm:block">
                  <h1 className="text-base font-bold text-gray-900 leading-tight">AMR Home Solutions</h1>
                  <p className="text-xs text-gray-500 leading-tight">Your One Stop Real Estate Centre</p>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-6">
                <Link href="/#listings" className="text-sm font-medium text-gray-600 hover:text-[#FF6600] transition-colors">Rooms for Rent</Link>
                <Link href="/#how" className="text-sm font-medium text-gray-600 hover:text-[#FF6600] transition-colors">How It Works</Link>
                <Link href="/#about" className="text-sm font-medium text-gray-600 hover:text-[#FF6600] transition-colors">About Us</Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {mounted && user ? (
                <div className="flex items-center gap-3">
                  <span className="hidden sm:block text-sm text-gray-500">{user.name || user.email}</span>
                  <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-[#FF6600] transition-colors">
                    Dashboard
                  </Link>
                  <button onClick={async () => {
                    await signOut({ redirect: false });
                    setUser(null);
                    router.push('/');
                    router.refresh();
                  }} className="text-sm text-gray-600 hover:text-[#FF6600] font-medium transition-colors">
                    Log Out
                  </button>
                </div>
              ) : (
                <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-[#FF6600] transition-colors">
                  Log In
                </Link>
              )}

              <button
                onClick={handleChatWithAIrene}
                className="bg-[#FF6600] text-white px-4 py-2 rounded hover:bg-[#e55a00] transition-colors text-sm font-medium"
              >
                Chat with AIrene
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 py-3">
              <nav className="flex flex-col gap-3">
                <Link href="/#listings" className="text-sm font-medium text-gray-600 hover:text-[#FF6600] transition-colors py-1">Rooms for Rent</Link>
                <Link href="/#how" className="text-sm font-medium text-gray-600 hover:text-[#FF6600] transition-colors py-1">How It Works</Link>
                <Link href="/#about" className="text-sm font-medium text-gray-600 hover:text-[#FF6600] transition-colors py-1">About Us</Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Find Your Ideal Room in Kuala Lumpur
            </h2>
            <p className="text-gray-600 text-base mb-8">
              Affordable co-living rooms for Muslim tenants. Fully furnished, near LRT/MRT stations, with flexible move-in options.
            </p>

            {/* Search Bar */}
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <select
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    defaultValue="all"
                    onChange={(e) => {
                      const val = e.target.value as 'all' | 'muslimin' | 'muslimah';
                      setFilter(val);
                      trackEvent({ event: 'filter_click', params: { filter: val } });
                    }}
                  >
                    <option value="all">All Areas</option>
                    {[...new Set(dbRooms.map(r => r.area))].map(area => (
                      <option key={area} value="all">{area}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                  <select
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    value={filter}
                    onChange={(e) => {
                      const val = e.target.value as 'all' | 'muslimin' | 'muslimah';
                      setFilter(val);
                      trackEvent({ event: 'filter_click', params: { filter: val } });
                    }}
                  >
                    <option value="all">All Rooms</option>
                    <option value="muslimin">Muslimin (Male)</option>
                    <option value="muslimah">Muslimah (Female)</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#FF6600] text-white px-6 py-2.5 rounded hover:bg-[#e55a00] transition-colors text-sm font-semibold"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <span>{dbRooms.length} rooms available</span>
              <span className="text-gray-300">|</span>
              <span>From RM 500/month</span>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Section with Sidebar Filter */}
      <section id="listings" className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Filters</h3>

                <div className="mb-5">
                  <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Room Type</label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-[#FF6600] focus:ring-[#FF6600]" defaultChecked />
                      Single Room
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-[#FF6600] focus:ring-[#FF6600]" defaultChecked />
                      Shared Room
                    </label>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Gender</label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="gender-filter"
                        checked={filter === 'all'}
                        onChange={() => {
                          setFilter('all');
                          trackEvent({ event: 'filter_click', params: { filter: 'all' } });
                        }}
                        className="text-[#FF6600] focus:ring-[#FF6600] border-gray-300"
                      />
                      All Rooms
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="gender-filter"
                        checked={filter === 'muslimin'}
                        onChange={() => {
                          setFilter('muslimin');
                          trackEvent({ event: 'filter_click', params: { filter: 'muslimin' } });
                        }}
                        className="text-[#FF6600] focus:ring-[#FF6600] border-gray-300"
                      />
                      Muslimin (Male)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="gender-filter"
                        checked={filter === 'muslimah'}
                        onChange={() => {
                          setFilter('muslimah');
                          trackEvent({ event: 'filter_click', params: { filter: 'muslimah' } });
                        }}
                        className="text-[#FF6600] focus:ring-[#FF6600] border-gray-300"
                      />
                      Muslimah (Female)
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500 mb-1">Need help?</p>
                    <button
                      onClick={handleChatWithAIrene}
                      className="text-sm font-medium text-[#FF6600] hover:underline"
                    >
                      Chat with AIrene
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Room Listings */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isLoadingRooms ? 'Loading rooms...' : `${filteredRooms.length} Room${filteredRooms.length !== 1 ? 's' : ''} Available`}
                </h3>
                <select className="text-sm border border-gray-300 rounded px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6600]">
                  <option>Sort: Latest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>

              {isLoadingRooms ? (
                <div className="text-center py-16 text-gray-500">
                  <p>Loading rooms...</p>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                  <p className="text-gray-500 text-base mb-3">No rooms match your criteria</p>
                  <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or chat with AIrene for updates</p>
                  <button
                    onClick={handleChatWithAIrene}
                    className="inline-flex items-center gap-2 bg-[#FF6600] hover:bg-[#e55a00] text-white font-medium px-5 py-2.5 rounded transition-colors text-sm"
                  >
                    Chat with AIrene
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row">
                        {/* Image */}
                        <div
                          className="sm:w-72 md:w-80 flex-shrink-0 h-52 sm:h-auto cursor-pointer relative overflow-hidden"
                          onClick={() => router.push(`/rooms/${room.id}`)}
                        >
                          <img
                            src={room.img}
                            alt={room.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-white/95 text-gray-800 px-2.5 py-1 text-xs font-semibold rounded border border-gray-200">
                              {room.tag}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3" onClick={(e) => e.preventDefault()}>
                            <ShareButton
                              url={`https://sublet-zeta.vercel.app/rooms/${room.id}`}
                              title={`${room.title} - ${room.price}`}
                            />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Link href={`/rooms/${room.id}`} className="block">
                                <h4 className="font-semibold text-gray-900 text-base hover:text-[#FF6600] transition-colors mb-1">
                                  {room.property} — {room.title}
                                </h4>
                              </Link>
                              <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">{room.location}</span>
                              </div>
                            </div>

                            <div className="text-right ml-4 flex-shrink-0">
                              <p className="text-xl font-bold text-gray-900">{room.price}</p>
                              <p className="text-xs text-gray-500">per month</p>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-sm">
                            <span className="flex items-center gap-1.5 text-gray-600">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                              {room.beds}
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-600">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {room.gender}
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-600">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Available: {room.moveIn}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                              Deposit: {room.deposit} · Move-in: {room.moveInCost}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleWhatsApp}
                                className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                              >
                                WhatsApp
                              </button>
                              <Link
                                href={`/rooms/${room.id}`}
                                className="bg-[#FF6600] hover:bg-[#e55a00] text-white text-sm font-medium px-4 py-2 rounded transition-colors"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">How It Works</h3>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Our streamlined process gets you from inquiry to move-in in days, not weeks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#FF6600] text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Browse & Inquire</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Browse available rooms and chat with AIrene — our AI assistant qualifies your inquiry instantly and schedules viewings.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#FF6600] text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">View & Apply</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Visit the property in person. If satisfied, submit your application digitally. No paperwork hassle.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#FF6600] text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Sign & Move In</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Sign your tenancy agreement digitally, pay deposit and first month rent, then collect your keys on move-in day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About AMR */}
      <section id="about" className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">About AMR Home Solutions</h3>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  AMR Home Solutions is a co-living property management company based in Kuala Lumpur. We provide affordable, fully furnished rooms in strategic locations near public transit.
                </p>
                <p>
                  Our mission is to make quality housing accessible for Muslim professionals and students. Every property is gender-segregated, ensuring a comfortable living environment for both Muslimin and Muslimah tenants.
                </p>
                <p>
                  With AIrene — our AI-powered assistant — we have streamlined the entire rental process from inquiry to move-in, making it faster and more convenient than traditional methods.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-6">
                <div>
                  <p className="text-2xl font-bold text-[#FF6600]">{SSM_NUMBER.split(':')[1] || 'Registered'}</p>
                  <p className="text-xs text-gray-500">SSM Registered</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#FF6600]">100%</p>
                  <p className="text-xs text-gray-500">Online Process</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#FF6600]">24/7</p>
                  <p className="text-xs text-gray-500">AI Assistant</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Eligibility Requirements</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-[#FF6600] font-bold mt-0.5">✓</span>
                  <span>Malaysian citizen only</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FF6600] font-bold mt-0.5">✓</span>
                  <span>Muslim only — gender-segregated housing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FF6600] font-bold mt-0.5">✓</span>
                  <span>Single, married (staying alone), or divorced with no children</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FF6600] font-bold mt-0.5">✓</span>
                  <span>No children living with tenant</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FF6600] font-bold mt-0.5">✓</span>
                  <span>Minimum 6-month stay, 1-year tenancy agreement</span>
                </li>
              </ul>
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-3">Not sure if you qualify? Ask AIrene.</p>
                <button
                  onClick={handleChatWithAIrene}
                  className="text-sm font-medium text-[#FF6600] hover:underline"
                >
                  Start a conversation →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gray-900 rounded-lg p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to Find Your Room?
            </h3>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Chat with AIrene to check your eligibility, schedule a viewing, or ask any questions about our properties.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleChatWithAIrene}
                className="inline-flex items-center justify-center gap-2 bg-[#FF6600] text-white font-semibold px-6 py-3 rounded hover:bg-[#e55a00] transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat with AIrene
              </button>
              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center justify-center gap-2 bg-green-600 text-white font-semibold px-6 py-3 rounded hover:bg-green-700 transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/amr-logo.jpg" alt="AMR" className="w-9 h-9 object-contain" />
                <span className="text-white font-bold text-lg">AMR Home Solutions</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                Your One Stop Real Estate Centre. Affordable co-living rooms for Muslim tenants in Kuala Lumpur. Fully furnished, near LRT/MRT stations.
              </p>
              <p className="text-xs mt-4">{SSM_NUMBER}</p>
            </div>

            <div>
              <h5 className="text-white font-semibold text-sm mb-3">Quick Links</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#listings" className="hover:text-white transition-colors">Rooms for Rent</Link></li>
                <li><Link href="/#how" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/#about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><button onClick={handleChatWithAIrene} className="hover:text-white transition-colors">Contact AIrene</button></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-semibold text-sm mb-3">Contact</h5>
              <ul className="space-y-2 text-sm">
                <li><button onClick={handleWhatsApp} className="hover:text-white transition-colors">WhatsApp</button></li>
                <li><button onClick={handleChatWithAIrene} className="hover:text-white transition-colors">AI Chat Assistant</button></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs">© 2026 AMR Home Solutions. All rights reserved.</p>
            <p className="text-xs">Muslim-only co-living · Gender-segregated · Fully furnished</p>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-3">
        <div className="flex gap-2">
          <button
            onClick={handleWhatsApp}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded transition-colors text-sm flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </button>
          <button
            onClick={handleChatWithAIrene}
            className="flex-1 bg-[#FF6600] hover:bg-[#e55a00] text-white font-medium py-2.5 px-4 rounded transition-colors text-sm flex items-center justify-center gap-1.5"
          >
            Chat with AIrene
          </button>
        </div>
      </div>

      {/* Spacer for mobile sticky bar */}
      <div className="lg:hidden h-16" />
    </div>
  );
};

export default LandingPage;
