'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
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

const shareUrl = 'https://sublet-zeta.vercel.app';
const shareTitle = 'Room for Rent KL — Muslim Co-Living, Fully Furnished, Near LRT';
const whatsappShare = `https://wa.me/?text=${encodeURIComponent(`Eh, nice room for rent! Check it out: ${shareUrl}`)}`;

const testimonials = [
  { name: 'Ahmad Zul', role: 'Software Engineer, Keramat', text: 'Moved in within 48 hours. AIrene handled everything from viewing to contract signing. So easy!', emoji: '💻' },
  { name: 'Sarah Chen', role: 'Graphic Designer, Pandan Jaya', text: 'Finally found a clean, affordable room near LRT. Transparent pricing, no hidden fees.', emoji: '🎨' },
  { name: 'Farid Ismail', role: 'Accountant, Setapak', text: 'Been here 8 months. Maintenance is prompt, WiFi is fast, and the house is always clean.', emoji: '📊' },
];

const LandingPage = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [user, setUser] = useState<User | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleChatWithAIrene = (source = 'landing_page') => {
    trackEvent({ event: 'chat_launched', params: { source } });
    router.push('/inquiry');
  };

  const handleShare = useCallback((platform: string) => {
    trackEvent({ event: 'room_share', params: { platform } });
    if (platform === 'whatsapp') {
      window.open(whatsappShare, '_blank', 'noopener,noreferrer');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank', 'noopener,noreferrer');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, []);

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
      {/* Sticky Mobile Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg p-3">
        <div className="flex gap-2">
          <button
            onClick={() => handleChatWithAIrene('mobile_sticky')}
            className="flex-1 bg-[#FF6600] hover:bg-[#e55a00] text-white font-semibold py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat with AIrene
          </button>
          <button
            onClick={() => handleShare('whatsapp')}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
            </svg>
            Share
          </button>
        </div>
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
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center">

            {/* Social Proof + Scarcity Badges */}
            <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                <span className="text-[#FF6600]">●</span> 500+ tenants since 2016
              </div>
              <div className="inline-flex items-center gap-1.5 bg-red-500/20 backdrop-blur-sm text-red-300 text-xs font-medium px-3 py-1.5 rounded-full border border-red-400/30">
                <span>⚠️</span> Only 3 rooms left in Keramat — near LRT Damai
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                <span className="text-green-400">✓</span> SSM Registered since 2018
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              Find Your <span className="text-[#FF6600]">Room</span> in <span className="text-[#FF6600]">KL</span>
            </h2>
            <p className="text-center text-white/70 mb-8 text-lg max-w-2xl mx-auto">
              Fully furnished rooms near LRT/MRT. Muslim co-living. <strong>From RM300/mo</strong> — move-in ready.
            </p>

            {/* Location Dropdown */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setActiveIndex(0);
                    trackEvent({ event: 'cta_click', params: { location: e.target.value, type: 'location_filter' } });
                  }}
                  className="appearance-none bg-white/90 backdrop-blur-sm text-slate-800 font-medium px-6 py-3 pr-12 rounded-full border-2 border-white/30 shadow-lg cursor-pointer hover:border-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6600] text-lg min-w-[280px]"
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
            <div className="relative h-80 flex justify-center items-center overflow-visible max-w-4xl mx-auto">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF6600] transition-all duration-[15000ms] ease-linear"
                  style={{ width: `${((activeIndex + 1) / currentRooms.length) * 100}%` }}
                />
              </div>
              <div className="relative w-full flex justify-center items-center">
                  {currentRooms.map((room, i) => (
                    <a
                      key={i}
                      href={`/rooms?location=${room.location}`}
                      onClick={() => trackEvent({ event: 'carousel_interaction', params: { room: room.title } })}
                      className={`absolute transition-all duration-700 ease-in-out group cursor-pointer ${getPositionClass(i, activeIndex)}`}
                      style={{ width: '200px', height: '240px' }}
                    >
                      <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                        <img src={room.img} alt={room.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-0 right-0 text-center" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        <p className="text-white font-bold text-sm">{room.title}</p>
                        <p className="text-[#FF6600] font-bold">{room.price}</p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity rounded-2xl">
                        <span className="bg-white text-slate-800 px-4 py-2 rounded-full font-medium text-sm shadow-lg">View Room</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* CTA + Share */}
            <div className="flex flex-col items-center mt-10 gap-5">
              <button
                onClick={() => handleChatWithAIrene('hero_primary')}
                className="inline-flex items-center gap-2 bg-[#FF6600] hover:bg-[#e55a00] text-white font-bold px-12 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl text-lg shadow-lg group"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat with AIrene
                <span className="text-white/70 text-sm font-normal ml-1">— 2 min reply</span>
              </button>
              <p className="text-white/50 text-sm">Free • No commitment • 24/7 available</p>

              {/* Share Buttons */}
              <div className="flex items-center gap-3 mt-1">
                <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Share</span>
                <div className="h-4 w-px bg-white/20" />
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="bg-green-500/90 hover:bg-green-500 text-white p-2.5 rounded-full transition-all hover:scale-110 shadow-lg backdrop-blur-sm"
                  title="Share on WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="bg-blue-600/90 hover:bg-blue-600 text-white p-2.5 rounded-full transition-all hover:scale-110 shadow-lg backdrop-blur-sm"
                  title="Share on Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShare('telegram')}
                  className="bg-blue-400/90 hover:bg-blue-400 text-white p-2.5 rounded-full transition-all hover:scale-110 shadow-lg backdrop-blur-sm"
                  title="Share on Telegram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="bg-slate-600/90 hover:bg-slate-600 text-white p-2.5 rounded-full transition-all hover:scale-110 shadow-lg backdrop-blur-sm relative"
                  title="Copy Link"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-5 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-[#FF6600] font-bold">✓</span>
              <span>SSM Registered (2018)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-[#FF6600] font-bold">✓</span>
              <span>500+ Tenants Since 2016</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-[#FF6600] font-bold">✓</span>
              <span>24/7 AI Assistant</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-[#FF6600] font-bold">✓</span>
              <span>No Hidden Fees</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-[#FF6600] font-bold">✓</span>
              <span>Immediate Move-In</span>
            </div>
          </div>
        </div>
      </section>

      {/* Muslim Co-Living */}
      <section className="py-10 bg-white border-b border-slate-100">
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
              <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                1-Year Contract
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-2 text-slate-800">Rent a Room in 3 Easy Steps</h3>
          <p className="text-center text-slate-500 mb-12 max-w-lg mx-auto">No agents, no paperwork. AIrene handles everything from inquiry to move-in.</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center relative">
              <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-slate-200" />
              <div className="w-16 h-16 rounded-full bg-[#FF6600]/10 flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">🏠</span>
              </div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#FF6600] text-white text-sm font-bold flex items-center justify-center">1</div>
              <h4 className="font-bold text-lg text-slate-800 mb-2">Choose Your Room</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Browse our fully furnished rooms near LRT/MRT. Pick a single or shared room that fits your budget.</p>
            </div>
            <div className="text-center relative">
              <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-slate-200" />
              <div className="w-16 h-16 rounded-full bg-[#FF6600]/10 flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">💬</span>
              </div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#FF6600] text-white text-sm font-bold flex items-center justify-center">2</div>
              <h4 className="font-bold text-lg text-slate-800 mb-2">Inquire &amp; View</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Chat with AIrene — she qualifies your inquiry in 2 minutes and schedules your viewing session.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#FF6600]/10 flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">🔑</span>
              </div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#FF6600] text-white text-sm font-bold flex items-center justify-center">3</div>
              <h4 className="font-bold text-lg text-slate-800 mb-2">Move In</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Accept the offer, sign digitally, pay deposit (2 months rent). Keys handed over on move-in day.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-2 text-slate-800">What Tenants Say</h3>
          <p className="text-center text-slate-500 mb-12 max-w-lg mx-auto">Real feedback from real tenants who found their home through AIrene.</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">{t.emoji}</div>
                <p className="text-slate-600 mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="border-t border-slate-200 pt-3">
                  <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-3 text-slate-800">Everything You Actually Need</h3>
          <p className="text-center text-slate-500 mb-12 max-w-lg mx-auto">Clean, fully furnished rooms with all the essentials — at a fair price.</p>

          <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-50 to-orange-50 rounded-2xl p-8 border-2 border-[#FF6600]/20">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-[#FF6600] text-white text-xs font-bold px-3 py-1 rounded-full">FLAGSHIP</span>
              <h4 className="text-xl font-bold text-slate-800">3-Storey Bungalow, Keramat</h4>
            </div>
            <p className="text-slate-600 mb-6 text-sm">Converted to 3 separate houses, each floor self-contained with shared living areas. 2 LRT stops to KLCC.</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">In Your Room</h5>
                <ul className="space-y-2 text-sm text-slate-600">
                  {['40mm steel uni-spec single bed (heavy-duty, built to last)', 'Rubber mattress (not thin foam)', 'Ceiling fan', 'Curtains', '2 lockers (4 for shared rooms)', 'Prayer space next to bed'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#FF6600] mt-0.5">▸</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Shared Areas</h5>
                <ul className="space-y-2 text-sm text-slate-600">
                  {['Full kitchen with 2-burner stove', 'Large 2-door refrigerator', '7.0kg–7.5kg washing machine', 'CCTV security (exterior: front, back, sides, staircase)', 'TV & sofa in living area', 'Free WiFi', 'Multiple bathrooms per floor (squat + sitting)'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#FF6600] mt-0.5">▸</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center">
              <p className="text-red-500 font-semibold mb-1">Cheaper rooms (RM200–250)</p>
              <p className="text-slate-500 text-sm">Broken fans, thin foam mattress, dirty bathrooms, no maintenance. You save RM100 but live in discomfort.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center">
              <p className="text-[#FF6600] font-semibold mb-1">Designer rooms (RM700+)</p>
              <p className="text-slate-500 text-sm">Fancy interiors you pay a premium for. Nice to look at, but you're paying for aesthetics — not better sleep.</p>
            </div>
          </div>
          <p className="text-center text-slate-700 font-medium mt-6">We provide quality beds, maintained facilities, and honest living at <strong>RM300–RM500</strong>. Nothing more, nothing less.</p>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-slate-800 mb-4">Eligibility Requirements</h3>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <ul className="space-y-3 text-sm text-slate-700">
                {[
                  'Malaysian citizens only',
                  'Muslim only (gender-segregated housing)',
                  'Single, married-staying-alone, or divorced with no children',
                  'No children living with tenant',
                  'Minimum 6-month stay, 1-year contract',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#FF6600] font-bold text-lg leading-none">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-center text-slate-500 text-sm mt-3">Not sure if you qualify? <button onClick={() => handleChatWithAIrene('eligibility_help')} className="text-[#FF6600] font-medium hover:underline">Ask AIrene →</button></p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-[#FF6600]">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-white mb-4">Ready to Move In?</h3>
          <p className="text-white/80 mb-8 text-lg max-w-lg mx-auto">
            Chat with AIrene now. She replies in under <strong>2 minutes</strong>, 24/7.
          </p>
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={() => handleChatWithAIrene('cta_final')}
              className="inline-flex items-center gap-2 bg-white text-[#FF6600] font-bold px-10 py-4 rounded-full hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-2xl text-lg shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat with AIrene Now
            </button>

            <div className="flex items-center gap-3">
              <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Share with friends</span>
              <button onClick={() => handleShare('whatsapp')} className="bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-full transition-all hover:scale-110" title="WhatsApp">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
              </button>
              <button onClick={() => handleShare('facebook')} className="bg-blue-700 hover:bg-blue-800 text-white p-2.5 rounded-full transition-all hover:scale-110" title="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              <button onClick={() => handleShare('telegram')} className="bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-full transition-all hover:scale-110" title="Telegram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </button>
              <button onClick={() => handleShare('copy')} className="bg-slate-600 hover:bg-slate-700 text-white p-2.5 rounded-full transition-all hover:scale-110 relative" title="Copy Link">
                {copied ? (
                  <span className="text-xs font-medium">✓</span>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src="/amr-logo.jpg" alt="AMR Home Solutions" className="w-12 h-12 object-contain" />
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
