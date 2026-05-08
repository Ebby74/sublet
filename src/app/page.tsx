'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Room {
  img: string;
  title: string;
  price: string;
  location: string;
}

const sampleRooms: Room[] = [
  { img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80', title: 'Master Bedroom', price: 'RM 800/mo', location: 'keramat' },
  { img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80', title: 'Premium Room', price: 'RM 650/mo', location: 'keramat' },
  { img: 'https://images.unsplash.com/photo-1584132967334-10e958bd3987?w=600&q=80', title: 'Cozy Room', price: 'RM 550/mo', location: 'keramat' },
  { img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80', title: 'Deluxe Suite', price: 'RM 950/mo', location: 'keramat' },
  { img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80', title: 'Standard Room', price: 'RM 450/mo', location: 'keramat' },
];

const locations = [
  { id: 'all', name: 'Select Location' },
  { id: 'keramat', name: 'Keramat, KL, LRT Damai' },
  { id: 'teratai', name: 'Teratai Mewah, Setapak, MRT?' },
  { id: 'sri-nilam', name: 'Sri Nilam, Bdr Baru Ampang, LRT/MRT?' },
  { id: 'pandan-cahaya', name: 'Pandan Cahaya, KL, LRT Cahaya' },
  { id: 'pandan-jaya-33', name: 'Pandan Jaya 33, KL, LRT Pandan Jaya' },
  { id: 'pandan-jaya-45', name: 'Pandan Jaya 45, KL, LRT Pandan Jaya' },
  { id: 'pandan-indah', name: 'Pandan Indah, KL, LRT?' },
  { id: 'lagoon', name: 'Lagoon Perdana, PJ, LRT/MRT?' },
];

const filteredRooms: Room[] = [
  { img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80', title: 'Master Bedroom', price: 'RM 800/mo', location: 'keramat' },
  { img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80', title: 'Premium Room', price: 'RM 650/mo', location: 'teratai' },
  { img: 'https://images.unsplash.com/photo-1584132967334-10e958bd3987?w=600&q=80', title: 'Cozy Room', price: 'RM 550/mo', location: 'sri-nilam' },
  { img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80', title: 'Deluxe Suite', price: 'RM 950/mo', location: 'pandan-cahaya' },
  { img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80', title: 'Standard Room', price: 'RM 450/mo', location: 'pandan-jaya-33' },
  { img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80', title: 'Eco Room', price: 'RM 700/mo', location: 'pandan-jaya-45' },
  { img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&q=80', title: 'Skyline Room', price: 'RM 850/mo', location: 'pandan-indah' },
  { img: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&q=80', title: 'Garden Room', price: 'RM 600/mo', location: 'lagoon' },
];

const LandingPage = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUser(data.data))
      .catch(() => setUser(null));
  }, []);

  const displayedRooms = selectedLocation === 'all'
    ? filteredRooms
    : filteredRooms.filter(room => room.location === selectedLocation);

  const currentRooms = displayedRooms.length > 0 ? displayedRooms : filteredRooms;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % currentRooms.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [currentRooms.length]);

  const handleChatWithAIrene = () => {
    trackEvent({
      event: 'chat_launched',
      params: { source: 'landing_page' },
    });
    router.push('/inquiry');
  };

  const getPositionClass = (index: number, active: number): string => {
    const totalRooms = currentRooms.length;
    const positions = Array.from({ length: totalRooms }, (_, i) => i);
    const rotated = positions.map(p => (p - active + totalRooms) % totalRooms);
    const pos = rotated.indexOf(index);

    if (pos === 0) return 'z-30 scale-110 border-4 border-white ring-4 ring-white/30';
    if (pos === 1) return 'z-20 scale-90 border-4 border-white/60 -translate-x-24 opacity-80';
    if (pos === 2) return 'z-20 scale-90 border-4 border-white/60 translate-x-24 opacity-80';
    if (pos === 3) return 'z-10 scale-65 border-4 border-white/30 -translate-x-48 opacity-40';
    return 'z-10 scale-65 border-4 border-white/30 translate-x-48 opacity-40';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Link href="/?lang=en" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#FF6600] font-medium transition-colors">
                <span className="text-base">🇬🇧</span> EN
              </Link>
              <span className="text-slate-300">|</span>
              <Link href="/?lang=ms" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#FF6600] font-medium transition-colors">
                BM <span className="text-base">🇲🇾</span>
              </Link>
            </div>
            <div className="flex items-center mx-auto">
              <img
                src="/amr-logo.jpg"
                alt="AMR Home Solutions"
                className="w-20 h-20 object-contain"
              />
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-[#FF6600]">AMR Home Solutions</h1>
                <p className="text-lg text-slate-600 font-medium">Your One Stop Real Estate Centre</p>
                <p className="text-xs text-slate-400 font-medium">SSM: 201803387155 (002908967-W)</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-slate-500">{user.name || user.email}</span>
                  <button onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    setUser(null);
                    router.push('/');
                    router.refresh();
                  }} className="flex items-center gap-2 text-slate-600 hover:text-[#FF6600] px-4 py-2 text-base font-medium transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log Out
                  </button>
                </>
              ) : (
                <Link href="/auth/login" className="flex items-center gap-2 text-slate-600 hover:text-[#FF6600] px-4 py-2 text-base font-medium transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Log In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1505693314120-0d443867937c?w=1920&q=80"
            alt="Elegant bedroom"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/70" />
        </div>
        <div className="container mx-auto max-w-6xl relative z-10 flex items-start gap-6 flex-wrap md:flex-nowrap">
          {/* Social Proof - LEFT */}
          <div className="hidden md:flex flex-col items-center justify-center bg-[#FF6600]/90 backdrop-blur-sm px-4 py-6 rounded-2xl shadow-xl max-w-[180px] animate-pulse">
            <div className="text-4xl mb-2">🏠</div>
            <p className="text-white font-bold text-sm text-center leading-tight">
              500+ KL Young Professionals<br/>have stayed with us<br/>since 2016
            </p>
          </div>

          {/* Center: Headline + Carousel */}
          <div className="flex-1 max-w-4xl">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 text-center">
              Find Your <span className="text-[#FF6600]" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.8), 1px -1px 0 rgba(0,0,0,0.8), -1px 1px 0 rgba(0,0,0,0.8)' }}>Room</span> in <span className="text-[#FF6600]" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.8), 1px -1px 0 rgba(0,0,0,0.8), -1px 1px 0 rgba(0,0,0,0.8)' }}>KL</span>
            </h2>
            <p className="text-center text-white/80 mb-6 text-lg">Find your perfect room in Malaysia — fully furnished, move-in ready</p>

            {/* Location Dropdown */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setActiveIndex(0);
                    trackEvent({
                      event: 'cta_click',
                      params: { location: e.target.value, type: 'location_filter' },
                    });
                  }}
                  className="appearance-none bg-white/90 backdrop-blur-sm text-slate-800 font-medium px-6 py-3 pr-12 rounded-full border-2 border-white/30 shadow-lg cursor-pointer hover:border-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6600] text-lg min-w-[250px]"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bedroom Carousel */}
            <div className="relative h-80 flex justify-center items-center overflow-visible">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF6600] transition-all duration-[15000ms] ease-linear"
                  style={{ width: `${((activeIndex + 1) / currentRooms.length) * 100}%` }}
                />
              </div>

              <div className="relative w-full flex justify-center items-center">
                {currentRooms.map((room, i) => (
                  <a
                    key={i}
                    href="/properties"
                    onClick={() => trackEvent({ event: 'carousel_interaction', params: { room: room.title } })}
                    className={`absolute transition-all duration-700 ease-in-out group cursor-pointer ${
                      getPositionClass(i, activeIndex)
                    }`}
                    style={{ width: '200px', height: '240px' }}
                  >
                    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                      <img
                        src={room.img}
                        alt={room.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-0 right-0 text-center" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        <p className="text-white font-bold text-sm">{room.title}</p>
                        <p className="text-[#FF6600] font-bold">{room.price}</p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                        <span className="bg-white text-slate-800 px-4 py-2 rounded-full font-medium text-sm">View Room</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Primary CTA */}
            <div className="text-center mt-8">
              <button
                onClick={handleChatWithAIrene}
                className="inline-flex items-center gap-2 bg-[#FF6600] hover:bg-[#e55a00] text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl text-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat with AIrene
              </button>
              <p className="text-white/60 text-sm mt-2">AIrene replies in {'<2'} minutes • 24/7 available</p>
            </div>
          </div>

          {/* Scarcity Message - RIGHT */}
          <div className="hidden md:flex flex-col items-center justify-center bg-red-600/90 backdrop-blur-sm px-6 py-8 rounded-2xl shadow-xl max-w-xs">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-white font-bold text-lg text-center leading-tight">
              Only 3 rooms left in Keramat near LRT Damai, 3 stations to KLCC this month
            </p>
            <button
              onClick={handleChatWithAIrene}
              className="mt-6 bg-white text-red-600 font-bold px-6 py-3 rounded-full hover:bg-white/90 transition-all duration-300 hover:scale-105"
            >
              Inquire Now
            </button>
          </div>
        </div>
      </section>

      {/* Muslim-Only Co-Living Banner */}
      <section className="py-8 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Muslim-Only Co-Living in KL</h3>
            <p className="text-slate-600 mb-6">Gender-segregated housing for Muslimin &amp; Muslimah. Fully furnished rooms near LRT/MRT stations.</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/></svg>
                Muslimin (Male)
              </span>
              <span className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-4 py-2 rounded-full font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>
                Muslimah (Female)
              </span>
              <span className="inline-flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2 rounded-full font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.357 3.179A1 1 0 0018 15V3z" clipRule="evenodd"/></svg>
                Malaysian Citizens Only
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-3 text-slate-800">Rent a Room in 3 Easy Steps</h3>
          <p className="text-center text-slate-500 mb-12 max-w-lg mx-auto">No agents, no hassle. AIrene handles everything from inquiry to move-in.</p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center relative">
              <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-slate-200" />
              <div className="w-16 h-16 rounded-full bg-[#FF6600]/10 flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">🏠</span>
              </div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#FF6600] text-white text-sm font-bold flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-lg text-slate-800 mb-2">Choose Your Room</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Browse our fully furnished rooms near LRT/MRT. Pick a single or shared room that fits your budget.</p>
            </div>

            <div className="text-center relative">
              <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-slate-200" />
              <div className="w-16 h-16 rounded-full bg-[#FF6600]/10 flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">💬</span>
              </div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#FF6600] text-white text-sm font-bold flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-lg text-slate-800 mb-2">Inquire &amp; View</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Chat with AIrene — she qualifies your inquiry in 2 minutes and schedules your viewing session.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#FF6600]/10 flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">🔑</span>
              </div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#FF6600] text-white text-sm font-bold flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-lg text-slate-800 mb-2">Move In</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Accept the offer, sign digitally, pay deposit (2 months rent). Keys handed over on move-in day.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Notice */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Eligibility Requirements</h3>
            <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-200">
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#FF6600] font-bold text-lg leading-none">✓</span>
                  <span>Malaysian citizens only</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FF6600] font-bold text-lg leading-none">✓</span>
                  <span>Muslim only (gender-segregated housing)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FF6600] font-bold text-lg leading-none">✓</span>
                  <span>Single, married-staying-alone, or divorced with no children</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FF6600] font-bold text-lg leading-none">✓</span>
                  <span>No children living with tenant</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FF6600] font-bold text-lg leading-none">✓</span>
                  <span>Minimum 6-month stay, 1-year contract</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-4 text-slate-800">No Designer Gimmicks. Everything You Actually Need.</h3>
          <p className="text-center text-slate-500 mb-12 max-w-lg mx-auto">We don&apos;t do Instagram-worthy interiors. We provide clean, fully furnished rooms in proper houses with all the essentials — at a fair price.</p>

          {/* Keramat Flagship */}
          <div className="max-w-3xl mx-auto mb-12 bg-gradient-to-br from-slate-50 to-orange-50 rounded-2xl p-8 border-2 border-[#FF6600]/20">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-[#FF6600] text-white text-xs font-bold px-3 py-1 rounded-full">FLAGSHIP</span>
              <h4 className="text-xl font-bold text-slate-800">3-Storey Bungalow, Keramat</h4>
            </div>
            <p className="text-slate-600 mb-6 text-sm">Converted to 3 separate houses, each floor self-contained with shared living areas. 2 LRT stops to KLCC.</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">In Your Room</h5>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6600] mt-0.5">▸</span>
                    <span>40mm steel uni-spec single bed (heavy-duty, built to last)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6600] mt-0.5">▸</span>
                    <span>Rubber mattress (not thin foam)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6600] mt-0.5">▸</span>
                    <span>Ceiling fan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6600] mt-0.5">▸</span>
                    <span>Curtains</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6600] mt-0.5">▸</span>
                    <span>2 lockers (4 for shared rooms)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6600] mt-0.5">▸</span>
                    <span>Prayer space next to bed</span>
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Shared Areas</h5>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6600] mt-0.5">▸</span>
                    <span>Full kitchen with 2-burner stove</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6600] mt-0.5">▸</span>
                    <span>Large 2-door refrigerator</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6600] mt-0.5">▸</span>
                    <span>7.0kg–7.5kg washing machine</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6600] mt-0.5">▸</span>
                    <span>CCTV security (front, back, staircase & sides)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6600] mt-0.5">▸</span>
                    <span>TV &amp; sofa in living area</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6600] mt-0.5">▸</span>
                    <span>Free WiFi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6600] mt-0.5">▸</span>
                    <span>Multiple bathrooms per floor (squat + sitting)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Other locations - basic */}
          <div className="max-w-3xl mx-auto mb-10 bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <h4 className="font-bold text-slate-700 mb-2 text-center">Other Locations</h4>
            <p className="text-slate-500 text-sm text-center">Pandan Jaya, Setapak, and Ampang rooms come with similar essentials — bed, fan, curtains, storage, and shared kitchen. Details vary by house. Full specs shown when you inquire.</p>
          </div>

          {/* Honest comparison */}
          <div className="max-w-2xl mx-auto bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-3 text-center">Why Not Cheaper? Why Not Fancier?</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-red-500 font-semibold mb-1">Cheaper rooms (RM200–250)</p>
                <p className="text-slate-500">Broken fans, thin foam mattress, dirty bathrooms, no maintenance. You save RM100 but live in discomfort.</p>
              </div>
              <div>
                <p className="text-[#FF6600] font-semibold mb-1">Designer rooms (RM700+)</p>
                <p className="text-slate-500">Fancy interiors you pay a premium for. Nice to look at, but you&apos;re paying for aesthetics — not better sleep.</p>
              </div>
            </div>
            <p className="text-center text-slate-700 font-medium mt-4 pt-4 border-t border-slate-200">We provide quality beds, maintained facilities, and honest living at RM300–RM500. Nothing more, nothing less.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#FF6600]">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Move In?</h3>
          <p className="text-white/80 mb-8 text-lg max-w-lg mx-auto">
            Chat with AIrene now — she replies in under 2 minutes, 24/7.
          </p>
          <button
            onClick={handleChatWithAIrene}
            className="inline-flex items-center gap-2 bg-white text-[#FF6600] font-bold px-8 py-4 rounded-full hover:bg-white/90 transition-colors text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat with AIrene
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img
              src="/amr-logo.jpg"
              alt="AMR Home Solutions"
              className="w-12 h-12 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#FF6600]">AMR Home Solutions</span>
              <span className="text-sm text-slate-500 font-medium">Your One Stop Real Estate Centre</span>
              <span className="text-xs text-slate-600 mt-0.5">SSM: 201803387155 (002908967-W)</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs">© 2026 AMR Home Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
