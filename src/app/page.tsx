'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { FC } from 'react';
import { trackEvent, trackWhatsAppClick } from '@/lib/analytics';
import { ShareButton } from '@/components/ui/share-button';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface DbRoom {
  id: string;
  name: string;
  rentSen: number;
  photos?: string | null;
  status: string;
  floor?: { property?: { id: string; name: string; address: string } | null } | null;
}

interface Room {
  id: string;
  img: string;
  title: string;
  price: string;
  priceLabel: string;
  location: string;
  locationLabel: string;
  propertyName: string;
  nearestLrt?: string;
}

interface LocationOption {
  id: string;
  name: string;
}

const defaultLocations: LocationOption[] = [
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

const sampleRooms: Room[] = [
  { id: '1', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80', title: 'Master Bedroom', price: 'RM 800/mo', priceLabel: 'RM 800/mo', location: 'keramat', locationLabel: 'Keramat', propertyName: 'Keramat' },
  { id: '2', img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80', title: 'Premium Room', price: 'RM 650/mo', priceLabel: 'RM 650/mo', location: 'keramat', locationLabel: 'Keramat', propertyName: 'Keramat' },
  { id: '3', img: 'https://images.unsplash.com/photo-1584132967334-10e958bd3987?w=600&q=80', title: 'Cozy Room', price: 'RM 550/mo', priceLabel: 'RM 550/mo', location: 'keramat', locationLabel: 'Keramat', propertyName: 'Keramat' },
  { id: '4', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80', title: 'Deluxe Suite', price: 'RM 950/mo', priceLabel: 'RM 950/mo', location: 'keramat', locationLabel: 'Keramat', propertyName: 'Keramat' },
  { id: '5', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80', title: 'Standard Room', price: 'RM 450/mo', priceLabel: 'RM 450/mo', location: 'keramat', locationLabel: 'Keramat', propertyName: 'Keramat' },
];

// Social Proof - Placeholder testimonials matching target users (young KL professionals)
const testimonials = [
  { name: 'Sarah Chen', role: 'Graphic Designer', location: 'Pandan Jaya', text: 'Moved in within 48hrs! AIrene handled everything — from viewing to contract. So easy!', emoji: '💼' },
  { name: 'Ahmad Zul', role: 'Software Engineer', location: 'Keramat', text: 'Best decision ever. Room is near LRT, fully furnished. AIrene replied in 2 minutes!', emoji: '💻' },
  { name: 'Priya Sharma', role: 'Accountant', location: 'Setapak', text: 'Transparent fees, no hidden charges. Finally a rental platform I can trust.', emoji: '📊' },
];

// Trust Badges for Malaysian renters
const trustBadges = [
  { text: 'SSM Registered', icon: '🏢' },
  { text: '24/7 AI Support', icon: '🤖' },
  { text: 'Transparent Fees', icon: '💰' },
  { text: 'Same-Day Response', icon: '⚡' },
];

// Scarcity banner
const scarcityMessage = "Only 3 rooms left in Keramat this month — inquire now!";

// Lead Magnet
const leadMagnet = {
  title: '2026 KL Room Rental Guide',
  description: 'Free guide with LRT map, average rents & tenant rights',
  icon: '📖',
};

const LandingPage: FC = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [user, setUser] = useState<User | null>(null);
  const [showLeadMagnet, setShowLeadMagnet] = useState(false);
  const [email, setEmail] = useState('');
  const [mounted, setMounted] = useState(false);
  const [dbRooms, setDbRooms] = useState<Room[]>([]);
  const [dynamicLocations, setDynamicLocations] = useState<LocationOption[]>([]);
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
        if (rooms.length === 0) {
          setDbRooms(sampleRooms);
          setDynamicLocations(defaultLocations);
          setIsLoadingRooms(false);
          return;
        }

        const parsed: Room[] = rooms.map((r) => {
          const photos: string[] = r.photos ? JSON.parse(r.photos) : [];
          const property = r.floor?.property;
          const locationId = property?.id || 'unknown';
          const locationLabel = property?.name || 'Unknown';
          const ringgit = Math.floor(r.rentSen / 100);
          const sen = r.rentSen % 100;
          const priceLabel = `RM ${ringgit}${sen > 0 ? `.${sen.toString().padStart(2, '0')}` : ''}/mo`;

          return {
            id: r.id,
            img: photos.length > 0 ? photos[0] : '/amr-logo.jpg',
            title: r.name,
            price: priceLabel,
            priceLabel,
            location: locationId,
            locationLabel,
            propertyName: property?.name || '',
          };
        });

        const locs: LocationOption[] = [
          { id: 'all', name: 'Select Location' },
          ...Array.from(
            new Map(
              parsed.map((r) => [r.location, { id: r.location, name: r.locationLabel }])
            ).values()
          ),
        ];

        setDbRooms(parsed);
        setDynamicLocations(locs);
        setIsLoadingRooms(false);
      })
      .catch(() => {
        setDbRooms(sampleRooms);
        setDynamicLocations(defaultLocations);
        setIsLoadingRooms(false);
      });
  }, []);

  const displayedRooms = selectedLocation === 'all'
    ? dbRooms
    : dbRooms.filter(room => room.location === selectedLocation);

  const currentRooms = displayedRooms.length > 0 ? displayedRooms : dbRooms;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % currentRooms.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [currentRooms.length]);

  const handleLeadMagnetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    trackEvent({
      event: 'lead_magnet_download',
      params: { email },
    });

    // In production: send email with guide
    alert('Check your email for the 2026 KL Room Rental Guide!');
    setShowLeadMagnet(false);
    setEmail('');
  };

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
             {/* Language - top left with flags */}
             <div className="flex items-center gap-3">
               <Link href="/?lang=en" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#FF6600] font-medium transition-colors">
                 <span className="text-base">🇬🇧</span> EN
               </Link>
               <span className="text-slate-300">|</span>
               <Link href="/?lang=ms" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#FF6600] font-medium transition-colors">
                 BM <span className="text-base">🇲🇾</span>
               </Link>
             </div>
             {/* Centered Logo + Text */}
             <div className="flex items-center mx-auto">
               <img 
                 src="/amr-logo.jpg" 
                 alt="AMR Home Solutions" 
                 className="w-20 h-20 object-contain"
               />
               <div className="flex flex-col">
                 <h1 className="text-3xl font-bold text-[#FF6600]">AMR Home Solutions</h1>
                 <p className="text-lg text-slate-600 font-medium">Your One Stop Real Estate Centre</p>
               </div>
             </div>
             {/* Log In / Log Out - top right */}
             <div className="flex items-center gap-4">
               {mounted && user ? (
                 <>
                   <span className="text-sm text-slate-500">{user.name || user.email}</span>
                  <button onClick={async () => {
                      await signOut({ redirect: false });
                      setUser(null);
                      router.push('/');
                      router.refresh();
                    }} className="flex items-center gap-2 text-slate-600 hover:text-[#FF6600] px-4 py-2 text-base font-medium transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
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
       <section className="pt-28 pb-16 px-4 relative min-h-[600px]">
          <div className="absolute inset-0 z-0">
            <img 
              src="/background.jpg" 
              alt="Hero background" 
              className="w-full h-full object-cover"
            />
          </div>
         <div className="container mx-auto max-w-6xl relative z-10">
               {/* Center: Headline + Carousel (Spotlight) */}
             <div className="max-w-4xl mx-auto text-center">
               <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
                 <span className="text-[#FF6600]" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.8), 1px -1px 0 rgba(0,0,0,0.8), -1px 1px 0 rgba(0,0,0,0.8)' }}>Room</span> For <span className="text-[#FF6600]" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.8), 1px -1px 0 rgba(0,0,0,0.8), -1px 1px 0 rgba(0,0,0,0.8)' }}>Rent</span>
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
                    {dynamicLocations.map((loc) => (
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
               
               {/* Bedroom Carousel - Circular (Spotlight) */}
               <div className="relative h-80 flex justify-center items-center mt-8">
                 {/* Carousel Progress Bar */}
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/30 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-[#FF6600] transition-all duration-[15000ms] ease-linear"
                     style={{ width: `${((activeIndex + 1) / currentRooms.length) * 100}%` }}
                   />
                 </div>
                 
                 <div className="relative w-full flex justify-center items-center">
                   {currentRooms.map((room, i) => (
                      <a 
                        key={room.id}
                        href={`/rooms/${room.id}`}
                       onClick={() => trackEvent({ event: 'carousel_interaction', params: { room: room.title } })}
                       className={`absolute transition-all duration-700 ease-in-out group cursor-pointer ${
                         getPositionClass(i, activeIndex)
                       }`}
                       style={{
                         width: '200px',
                         height: '240px',
                       }}
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
                           {/* Share Button on each room card */}
                           <div className="absolute top-2 right-2" onClick={(e) => e.preventDefault()}>
                             <ShareButton
                               url={`https://sublet-zeta.vercel.app/rooms/${room.id}`}
                               title={`${room.title} - ${room.price}`}
                             />
                           </div>
                       </div>
                     </a>
                   ))}
                 </div>
               </div>
             </div>
         </div>
       </section>
       
        {/* Primary CTA - Below Hero */}
        <div className="text-center mt-16 pb-16">
          <div className="container mx-auto px-4">
            <button
              onClick={handleChatWithAIrene}
              className="inline-flex items-center gap-2 bg-[#FF6600] hover:bg-[#e55a00] text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat with AIrene
            </button>
            <p className="text-slate-600 text-sm mt-2">{'AIrene replies in '}<span>{'<2'}</span>{' minutes • 24/7 available'}</p>
          </div>
        </div>

      {/* Trust Badges */}
      <section className="py-6 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-700">
                <span className="text-2xl">{badge.icon}</span>
                <span className="font-medium text-sm">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Testimonials */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-4">Loved by Young Professionals</h3>
          <p className="text-center text-slate-500 mb-12 max-w-lg mx-auto">See what others say about their experience with AIrene</p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-3xl mb-3">{testimonial.emoji}</div>
                <p className="text-slate-600 mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="border-t pt-3">
                  <p className="font-bold text-slate-800">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.role} • {testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Features */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-4">Everything You Need</h3>
          <p className="text-center text-slate-500 mb-16 max-w-lg mx-auto">From listing your first property to generating tax reports — all in one place.</p>
           
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Property Management */}
            <Link href="/properties" className="group relative p-8 rounded-2xl border-2 border-slate-100 hover:border-[#4A7C3C]/30 bg-white hover:bg-[#4A7C3C]/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl block">
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#4A7C3C]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-[#4A7C3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4A7C3C] to-[#3d6631] flex items-center justify-center mb-5 shadow-lg shadow-[#4A7C3C]/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Property Management</h4>
              <p className="text-slate-500">Track all your properties, units, and occupancy status in one place.</p>
            </Link>

            {/* Tenant Management */}
            <Link href="/tenants" className="group relative p-8 rounded-2xl border-2 border-slate-100 hover:border-[#D4753A]/30 bg-white hover:bg-[#D4753A]/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl block">
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#D4753A]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-[#D4753A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4753A] to-[#c06530] flex items-center justify-center mb-5 shadow-lg shadow-[#D4753A]/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Tenant Management</h4>
              <p className="text-slate-500">Store tenant details, IC numbers, and documents securely.</p>
            </Link>

            {/* Financial Tracking */}
            <Link href="/payments" className="group relative p-8 rounded-2xl border-2 border-slate-100 hover:border-[#4A7C3C]/30 bg-white hover:bg-[#4A7C3C]/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl block">
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#4A7C3C]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-[#4A7C3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4A7C3C] to-[#3d6631] flex items-center justify-center mb-5 shadow-lg shadow-[#4A7C3C]/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Financial Tracking</h4>
              <p className="text-slate-500">Record payments, generate receipts, and track income/expenses.</p>
            </Link>

            {/* Reports & Tax */}
            <Link href="/reports" className="group relative p-8 rounded-2xl border-2 border-slate-100 hover:border-[#D4753A]/30 bg-white hover:bg-[#D4753A]/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl block">
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#D4753A]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-[#D4753A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4753A] to-[#c06530] flex items-center justify-center mb-5 shadow-lg shadow-[#D4753A]/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Reports & Tax</h4>
              <p className="text-slate-500">P&L statements, Zakat calculations, and LHDN-compliant exports.</p>
            </Link>

            {/* Marketing */}
            <Link href="/prospects" className="group relative p-8 rounded-2xl border-2 border-slate-100 hover:border-[#4A7C3C]/30 bg-white hover:bg-[#4A7C3C]/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl block">
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#4A7C3C]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-[#4A7C3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4A7C3C] to-[#3d6631] flex items-center justify-center mb-5 shadow-lg shadow-[#4A7C3C]/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Marketing</h4>
              <p className="text-slate-500">Auto-post vacant units to social media and generate leads.</p>
            </Link>

            {/* Reminders */}
            <Link href="/notifications" className="group relative p-8 rounded-2xl border-2 border-slate-100 hover:border-[#D4753A]/30 bg-white hover:bg-[#D4753A]/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl block">
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#D4753A]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-[#D4753A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4753A] to-[#c06530] flex items-center justify-center mb-5 shadow-lg shadow-[#D4753A]/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Reminders</h4>
              <p className="text-slate-500">Automated notifications for rent due and lease expiry.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Lead Magnet Section */}
      <section className="py-16 bg-gradient-to-r from-[#4A7C3C]/10 to-[#D4753A]/10">
        <div className="container mx-auto px-4 text-center">
          <div className="text-5xl mb-4">{leadMagnet.icon}</div>
          <h3 className="text-3xl font-bold text-slate-800 mb-4">{leadMagnet.title}</h3>
          <p className="text-slate-600 mb-8 max-w-lg mx-auto">{leadMagnet.description}</p>
          
          {!showLeadMagnet ? (
            <button
              onClick={() => {
                setShowLeadMagnet(true);
                trackEvent({ event: 'cta_click', params: { type: 'lead_magnet_open' } });
              }}
              className="inline-flex items-center gap-2 bg-[#FF6600] hover:bg-[#e55a00] text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Get Free Guide
            </button>
          ) : (
            <form onSubmit={handleLeadMagnetSubmit} className="max-w-md mx-auto flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-full border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-[#4A7C3C] hover:bg-[#3d6631] text-white font-semibold px-6 py-3 rounded-full transition-colors"
              >
                Download
              </button>
            </form>
          )}
        </div>
      </section>

      {/* CTA - Middle */}
      <section className="py-20 bg-gradient-to-r from-[#4A7C3C] to-[#3d6631]">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Find Your Perfect Room Today</h3>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">Chat with AIrene — from inquiry to move-in, fully automated.</p>
          <p className="text-white/60 mb-6 text-sm">AIrene responds in &lt;2 minutes, 24/7!</p>
          <button
            onClick={handleChatWithAIrene}
            className="inline-flex items-center gap-2 bg-white text-[#4A7C3C] px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-all duration-300 hover:scale-105 text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat with AIrene
          </button>
        </div>
      </section>

      {/* Social Sharing Section */}
      <section className="py-12 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 text-center">
          <h4 className="text-xl font-bold text-slate-800 mb-2">Know someone looking for a room?</h4>
          <p className="text-slate-500 mb-6">Share this listing with friends and family</p>
          <div className="flex justify-center">
            <ShareButton
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title="AMR Home Solutions - Find Your Perfect Room in KL"
            />
          </div>
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
            </div>
          </div>
          <p className="text-slate-500 text-xs">© 2026 AMR Home Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
