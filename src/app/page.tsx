'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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

interface RoomCard {
  id: string;
  img: string;
  title: string;
  price: string;
  deposit: string;
  moveInCost: string;
  location: string;
  tag: 'Muslimin' | 'Muslimah' | 'Mixed';
  tagColor: string;
  beds: string;
  gender: string;
  moveIn: string;
  available: number;
}

function formatPrice(sen: number): string {
  const ringgit = Math.floor(sen / 100);
  return `RM ${ringgit.toLocaleString()}`;
}

function detectGender(room: DbRoom): 'Muslimin' | 'Muslimah' | 'Mixed' {
  const text = `${room.caption || ''} ${room.descriptionV2 || ''} ${room.name || ''}`.toLowerCase();
  if (text.includes('muslimin') || text.includes('male') || text.includes('lelaki')) return 'Muslimin';
  if (text.includes('muslimah') || text.includes('female') || text.includes('perempuan')) return 'Muslimah';
  return 'Mixed';
}

function getMoveInDate(room: DbRoom): string {
  if (room.status === 'available') return 'Immediate';
  if (room.vacantSince) {
    const d = new Date(room.vacantSince);
    return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
  }
  return 'Contact for date';
}

const steps = [
  {
    num: '1',
    title: 'Choose Your Room',
    desc: 'Browse our fully furnished rooms near LRT/MRT. Pick a single or shared room that fits your budget and location preference.',
    icon: '🏠',
  },
  {
    num: '2',
    title: 'Inquire & View',
    desc: 'Chat with AIrene — our AI assistant qualifies your inquiry in 2 minutes. If eligible, she schedules your viewing session.',
    icon: '💬',
  },
  {
    num: '3',
    title: 'Move In',
    desc: 'Accept the offer, sign digitally, pay deposit (2 months rent + utilities). Keys handed over on move-in day. Simple.',
    icon: '🔑',
  },
];

const LandingPage: FC = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'muslimin' | 'muslimah'>('all');
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dbRooms, setDbRooms] = useState<RoomCard[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

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

        const parsed: RoomCard[] = availableRooms.map((r) => {
          const photos: string[] = r.photos ? JSON.parse(r.photos) : [];
          const property = r.floor?.property;
          const gender = detectGender(r);
          const ringgit = Math.floor(r.rentSen / 100);
          const sen = r.rentSen % 100;
          const price = `RM ${ringgit}${sen > 0 ? `.${sen.toString().padStart(2, '0')}` : ''}`;
          const depositSen = r.depositSen ?? r.rentSen * 2;
          const depositRinggit = Math.floor(depositSen / 100);
          const depositSenRemain = depositSen % 100;
          const deposit = `RM ${depositRinggit}${depositSenRemain > 0 ? `.${depositSenRemain.toString().padStart(2, '0')}` : ''}`;
          const totalMoveIn = ringgit + depositRinggit;
          const moveInCost = `RM ${totalMoveIn.toLocaleString()}`;
          const bedLabel = r.type === 'shared' ? 'Shared Room' : r.type === 'master' ? 'Master Room' : 'Single Room';

          return {
            id: r.id,
            img: photos.length > 0 ? photos[0] : '/amr-logo.jpg',
            title: `${property?.name || 'AMR Home'} — ${r.name}`,
            price,
            deposit,
            moveInCost,
            location: property?.address || property?.name || 'KL',
            tag: gender,
            tagColor: gender === 'Muslimin' ? 'bg-blue-100 text-blue-800' : gender === 'Muslimah' ? 'bg-pink-100 text-pink-800' : 'bg-slate-100 text-slate-700',
            beds: bedLabel,
            gender: gender === 'Muslimin' ? 'Male Only' : gender === 'Muslimah' ? 'Female Only' : 'Mixed',
            moveIn: getMoveInDate(r),
            available: r.type === 'shared' ? 2 : 1,
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
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-[#FF6600] text-white text-center py-2 text-sm font-medium">
        AMR Home Solutions — Muslim-Only Co-Living in KL · {SSM_NUMBER}
      </div>

      {/* Sticky Mobile CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg p-3">
        <button
          onClick={handleChatWithAIrene}
          className="w-full bg-[#FF6600] hover:bg-[#e55a00] text-white font-semibold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat with AIrene
        </button>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Language */}
            <div className="flex items-center gap-3">
              <Link href="/?lang=en" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#FF6600] font-medium transition-colors">
                <span className="text-base">🇬🇧</span> EN
              </Link>
              <span className="text-slate-300">|</span>
              <Link href="/?lang=ms" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#FF6600] font-medium transition-colors">
                BM <span className="text-base">🇲🇾</span>
              </Link>
            </div>

            {/* Center: Logo */}
            <Link href="/" className="flex items-center gap-3">
              <img src="/amr-logo.jpg" alt="AMR" className="w-10 h-10 object-contain rounded" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-[#FF6600] leading-tight">AMR Home Solutions</h1>
                <p className="text-xs text-slate-500 leading-tight">Your One Stop Real Estate Centre</p>
              </div>
            </Link>

            {/* Right: Nav */}
            <nav className="flex items-center gap-4">
              <Link href="/#how" className="hidden md:block text-sm font-medium text-slate-700 hover:text-[#FF6600] transition-colors">How It Works</Link>
              {mounted && user ? (
                <>
                  <span className="hidden sm:block text-sm text-slate-500">{user.name || user.email}</span>
                  <button onClick={async () => {
                    await signOut({ redirect: false });
                    setUser(null);
                    router.push('/');
                    router.refresh();
                  }} className="text-sm text-slate-600 hover:text-[#FF6600] font-medium transition-colors">
                    Log Out
                  </button>
                </>
              ) : (
                <Link href="/auth/login" className="text-sm text-slate-600 hover:text-[#FF6600] font-medium transition-colors">
                  Log In
                </Link>
              )}
              <button
                onClick={handleChatWithAIrene}
                className="bg-[#FF6600] text-white px-5 py-2 rounded-full hover:bg-[#e55a00] transition-colors text-sm font-medium"
              >
                Chat with AIrene
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-16 px-4">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your <span className="text-[#FF6600]">Room</span> in KL
          </h2>
          <p className="text-white/70 text-lg mb-4">
            Muslim-only co-living · Fully furnished · Near LRT/MRT
          </p>
          <p className="text-white/50 text-sm mb-8">
            Gender-segregated housing for Muslimin & Muslimah · Starting from RM 500/month
          </p>

          {/* Filter pills */}
          <div className="flex justify-center gap-3 flex-wrap mb-8">
            <button
              onClick={() => {
                setFilter('all');
                trackEvent({ event: 'filter_click', params: { filter: 'all' } });
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-[#FF6600] text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              All Rooms ({dbRooms.length})
            </button>
            <button
              onClick={() => {
                setFilter('muslimin');
                trackEvent({ event: 'filter_click', params: { filter: 'muslimin' } });
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'muslimin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              Muslimin ({dbRooms.filter(r => r.tag === 'Muslimin').length})
            </button>
            <button
              onClick={() => {
                setFilter('muslimah');
                trackEvent({ event: 'filter_click', params: { filter: 'muslimah' } });
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'muslimah'
                  ? 'bg-pink-600 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              Muslimah ({dbRooms.filter(r => r.tag === 'Muslimah').length})
            </button>
          </div>
        </div>
      </section>

      {/* Room Listings Grid */}
      <section id="listings" className="py-12 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          {isLoadingRooms ? (
            <div className="text-center py-16 text-slate-500">
              <p>Loading rooms...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-3xl mb-4">🏠</p>
              <p className="text-slate-600 text-lg mb-2">No rooms available right now</p>
              <p className="text-slate-400 text-sm mb-6">Check back soon or chat with AIrene for updates</p>
              <button
                onClick={handleChatWithAIrene}
                className="inline-flex items-center gap-2 bg-[#FF6600] hover:bg-[#e55a00] text-white font-semibold px-6 py-3 rounded-full transition-colors"
              >
                Chat with AIrene
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100"
                >
                  {/* Image */}
                  <div
                    className="relative h-52 overflow-hidden cursor-pointer"
                    onClick={() => router.push(`/rooms/${room.id}`)}
                  >
                    <img
                      src={room.img}
                      alt={room.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${room.tagColor}`}>
                        {room.tag}
                      </span>
                      {room.available === 1 && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
                          1 Left!
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-2xl font-bold text-white">{room.price}<span className="text-sm font-normal text-white/70">/mo</span></p>
                    </div>
                    <div className="absolute top-3 right-3" onClick={(e) => e.preventDefault()}>
                      <ShareButton
                        url={`https://sublet-zeta.vercel.app/rooms/${room.id}`}
                        title={`${room.title} - ${room.price}`}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-slate-800 text-base mb-2 line-clamp-1">{room.title}</h3>
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {room.location}
                    </div>

                    {/* Details row */}
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
                      <span className="flex items-center gap-1">
                        🛏 {room.beds}
                      </span>
                      <span className="flex items-center gap-1">
                        {room.gender === 'Male Only' ? '♂' : room.gender === 'Female Only' ? '♀' : '⚥'} {room.gender}
                      </span>
                      <span className="flex items-center gap-1">
                        📅 {room.moveIn}
                      </span>
                    </div>

                    {/* Price breakdown */}
                    <div className="bg-slate-50 rounded-xl p-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Monthly Rent</span>
                        <span className="font-semibold text-slate-800">{room.price}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-slate-500">Deposit (2 months)</span>
                        <span className="font-semibold text-slate-800">{room.deposit}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1 pt-1 border-t border-slate-200">
                        <span className="font-semibold text-slate-700">Move-in Cost</span>
                        <span className="font-bold text-[#FF6600]">{room.moveInCost}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/rooms/${room.id}`}
                      className="w-full block text-center bg-[#FF6600] hover:bg-[#e55a00] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                    >
                      View Details & Inquire
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-3xl font-bold text-slate-800 mb-3">Rent a Room in 3 Easy Steps</h3>
          <p className="text-slate-500 mb-12 max-w-lg mx-auto">
            No agents, no hassle. AIrene handles everything from inquiry to move-in.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="relative">
                {step.num !== '3' && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-slate-200" />
                )}
                <div className="w-20 h-20 rounded-full bg-[#FF6600]/10 flex items-center justify-center mx-auto mb-5">
                  <span className="text-4xl">{step.icon}</span>
                </div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#FF6600] text-white text-sm font-bold flex items-center justify-center">
                  {step.num}
                </div>
                <h4 className="font-bold text-lg text-slate-800 mb-2">{step.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility Notice */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="container mx-auto max-w-2xl text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Eligibility Requirements</h3>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-left">
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <span className="text-[#FF6600] font-bold text-lg leading-none">✓</span>
                Malaysian citizens only
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF6600] font-bold text-lg leading-none">✓</span>
                Muslim only (gender-segregated housing)
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF6600] font-bold text-lg leading-none">✓</span>
                Single, married-staying-alone, or divorced with no children
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF6600] font-bold text-lg leading-none">✓</span>
                No children living with tenant
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF6600] font-bold text-lg leading-none">✓</span>
                Minimum 6-month stay, 1-year contract
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-[#FF6600]">
        <div className="container mx-auto max-w-3xl text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Move In?</h3>
          <p className="text-white/80 mb-8 text-lg">
            Chat with AIrene now — she replies in under 2 minutes, 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleChatWithAIrene}
              className="inline-flex items-center justify-center gap-2 bg-white text-[#FF6600] font-bold px-8 py-4 rounded-full hover:bg-white/90 transition-colors text-lg"
            >
              💬 Chat with AIrene
            </button>
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center justify-center gap-2 bg-white/20 text-white font-bold px-8 py-4 rounded-full hover:bg-white/30 transition-colors text-lg border-2 border-white/40"
            >
              📞 WhatsApp Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-center">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src="/amr-logo.jpg" alt="AMR" className="w-10 h-10 object-contain rounded" />
            <span className="text-lg font-bold text-[#FF6600]">AMR Home Solutions</span>
          </div>
          <p className="text-slate-500 text-xs mb-1">{SSM_NUMBER}</p>
          <p className="text-slate-500 text-xs">© 2026 AMR Home Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
