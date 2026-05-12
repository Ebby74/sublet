'use client';

import { useEffect, useState } from 'react';
import { Megaphone, Copy, Check, ExternalLink, MessageCircle, Facebook, Globe, Loader2, Clock, Share2 } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  type: string;
  beds: number;
  rentSen: number;
  photos: string | null;
  description: string | null;
  status: string;
  vacantSince: string | null;
  floor: { property: { id: string; name: string; address: string } | null } | null;
}

export default function MarketingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sublet-zeta.vercel.app';

  useEffect(() => {
    fetch('/api/v1/rooms?public=true')
      .then(r => r.json())
      .then(d => {
        setRooms((d.data || []).filter((r: Room) => r.status === 'available'));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const genCaption = (room: Room, platform: string) => {
    const name = room.name;
    const price = `RM ${Math.floor(room.rentSen / 100).toLocaleString()}`;
    const loc = room.floor?.property?.name || '';
    const addr = room.floor?.property?.address || '';
    const beds = room.beds;
    const desc = room.description || 'Fully furnished room. Muslim co-living. Move-in ready.';
    const url = `${siteUrl}/rooms/${room.id}`;

    const captions: Record<string, string> = {
      whatsapp: `*${name}* — ${price}/month\n📍 ${loc} — ${addr}\n🛏️ ${beds} bed(s)\n\n${desc}\n\n📲 More info: ${url}`,
      facebook: `🏠 *ROOM FOR RENT*\n\n${name}\n📍 ${loc}\n💰 ${price}/month\n🛏️ ${beds} bed(s)\n\n${desc}\n\n👇 Chat to book viewing\n${url}\n\n#RoomForRent #KLRoom #MuslimCoLiving #SubletKL`,
      instagram: `🏠 ${name}\n📍 ${loc}\n💰 ${price}/month\n\n${desc.length > 100 ? desc.slice(0, 100) + '...' : desc}\n\n👇 Link in bio / DM to view\n${url}`,
      mudah: `${name} FOR RENT! ${price}/month. ${beds}BR. ${loc}. ${desc.slice(0, 80)}. View: ${url}`,
      propertyguru: `${name}\nRent: ${price}/month\nLocation: ${loc}\nBedrooms: ${beds}\n\n${desc}\n\nContact: ${url}`,
      telegram: `🏠 *${name}* — ${price}/mo\n📍 ${loc}\n🛏️ ${beds} bed(s)\n\n${desc}\n\n🔗 ${url}`,
    };
    return captions[platform] || captions.whatsapp;
  };

  const copyCaption = async (roomId: string, platform: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    const text = genCaption(room, platform);
    await navigator.clipboard.writeText(text);
    setCopiedId(`${roomId}-${platform}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareLink = (roomId: string, platform: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    const url = `${siteUrl}/rooms/${roomId}`;
    const text = genCaption(room, platform);

    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(room.name + ' — RM ' + Math.floor(room.rentSen / 100).toLocaleString())}`,
    };
    const link = links[platform];
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  };

  const vacancyDays = (v: string | null) => v ? Math.floor((Date.now() - new Date(v).getTime()) / 86400000) : 0;
  const formatPrice = (s: number) => `RM ${Math.floor(s / 100).toLocaleString()}`;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Marketing
          </h1>
          <p className="text-muted-foreground text-sm">Share rooms to WhatsApp, Facebook, Telegram — works right now, no setup needed</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Available Rooms</p>
          <p className="text-2xl font-bold">{rooms.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Your Public Listing</p>
          <a href="/rooms" target="_blank" className="text-sm text-primary hover:underline flex items-center gap-1">
            <Globe className="h-3.5 w-3.5" /> View /rooms <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Quick Share</p>
          <a href={`https://wa.me/?text=${encodeURIComponent('Rooms for rent KL — Muslim co-living, fully furnished. Check: ' + siteUrl + '/rooms')}`} target="_blank" className="text-sm text-green-600 hover:underline flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" /> Share all rooms on WhatsApp
          </a>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="font-medium">No available rooms</p>
          <p className="text-xs mt-1">Set room status to &quot;available&quot; first</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rooms.map(room => {
            const photos: string[] = room.photos ? JSON.parse(room.photos) : [];
            const vacDays = vacancyDays(room.vacantSince);
            const expanded = expandedRoom === room.id;
            const roomUrl = `${siteUrl}/rooms/${room.id}`;

            return (
              <div key={room.id} className="rounded-lg border bg-card overflow-hidden">
                <div className="p-4 flex items-start gap-4">
                  <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                    {photos[0] ? (
                      <img src={photos[0]} alt={room.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground">🏠</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{room.name}</p>
                        <p className="text-xs text-muted-foreground">{room.floor?.property?.name || ''}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-primary">{formatPrice(room.rentSen)}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                        {vacDays > 0 && (
                          <p className={`text-xs ${vacDays > 30 ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                            <Clock className="h-3 w-3 inline" /> {vacDays} days vacant
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{room.beds} bed</span>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded capitalize">{room.type}</span>
                      <a href={`/rooms/${room.id}`} target="_blank" className="text-xs text-primary hover:underline ml-auto flex items-center gap-0.5">
                        Preview <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      <button onClick={() => shareLink(room.id, 'whatsapp')} className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs px-2.5 py-1.5 rounded transition-colors">
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </button>
                      <button onClick={() => shareLink(room.id, 'facebook')} className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1.5 rounded transition-colors">
                        <Facebook className="h-3.5 w-3.5" /> Facebook
                      </button>
                      <button onClick={() => shareLink(room.id, 'telegram')} className="inline-flex items-center gap-1 bg-sky-500 hover:bg-sky-600 text-white text-xs px-2.5 py-1.5 rounded transition-colors">
                        <Share2 className="h-3.5 w-3.5" /> Telegram
                      </button>
                      <button onClick={async () => { await navigator.clipboard.writeText(roomUrl); setCopiedId(`link-${room.id}`); setTimeout(() => setCopiedId(null), 2000); }}
                        className="inline-flex items-center gap-1 bg-slate-600 hover:bg-slate-700 text-white text-xs px-2.5 py-1.5 rounded transition-colors">
                        {copiedId === `link-${room.id}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedId === `link-${room.id}` ? 'Copied!' : 'Copy Link'}
                      </button>
                      <button onClick={() => setExpandedRoom(expanded ? null : room.id)}
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs px-2.5 py-1.5 rounded transition-colors">
                        <Share2 className="h-3.5 w-3.5" /> Copy Caption
                      </button>
                    </div>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t bg-muted/30 p-4 space-y-3">
                    {(['whatsapp', 'facebook', 'instagram', 'mudah', 'propertyguru', 'telegram'] as const).map(platform => (
                      <div key={platform} className="bg-card border rounded p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-semibold uppercase text-muted-foreground">{platform}</p>
                          <button onClick={() => copyCaption(room.id, platform)}
                            className="text-xs text-primary hover:underline flex items-center gap-1">
                            {copiedId === `${room.id}-${platform}` ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                          </button>
                        </div>
                        <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                          {genCaption(room, platform).slice(0, 300)}{genCaption(room, platform).length > 300 ? '...' : ''}
                        </pre>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      Copy caption → paste to {''}WhatsApp group, Facebook post, Instagram story, Mudah listing, etc.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border bg-card p-4">
        <h2 className="font-semibold mb-3">WhatsApp Broadcast — Tell Everyone at Once</h2>
        <p className="text-xs text-muted-foreground mb-3">Open WhatsApp with a pre-filled message about all your rooms. Send to your contacts, groups, or broadcast lists.</p>
        <a
          href={`https://wa.me/?text=${encodeURIComponent('Hi! AMR Home Solutions has rooms available now in KL:\n\n' + rooms.map(r => `• ${r.name} — ${formatPrice(r.rentSen)}/mo — ${siteUrl}/rooms/${r.id}`).join('\n') + '\n\nMuslim co-living, fully furnished, near LRT. Chat with AIrene to book viewing!')}`}
          target="_blank"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <MessageCircle className="h-4 w-4" /> Open WhatsApp with All Rooms
        </a>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h2 className="font-semibold mb-2">Your Public Links — Share Everywhere</h2>
        <div className="space-y-1.5 text-sm">
          <a href="/rooms" target="_blank" className="flex items-center gap-2 text-primary hover:underline">
            <Globe className="h-4 w-4" /> {siteUrl}/rooms <span className="text-xs text-muted-foreground">— All rooms</span>
          </a>
          {rooms.slice(0, 5).map(r => (
            <a key={r.id} href={`/rooms/${r.id}`} target="_blank" className="flex items-center gap-2 text-primary hover:underline ml-4 text-xs">
              → {r.name} — {formatPrice(r.rentSen)}
            </a>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground bg-muted p-3 rounded">
          <p className="font-medium text-foreground mb-1">Where to share RIGHT NOW:</p>
          <ul className="space-y-1">
            <li>📱 WhatsApp groups (neighbourhood, community, mosque)</li>
            <li>📘 Facebook Marketplace &amp; Groups (KL Room Rental, etc.)</li>
            <li>📢 Telegram channels (Bilik Sewa KL, Room for Rent Malaysia)</li>
            <li>🌐 Mudah.my &amp; PropertyGuru — copy caption above, paste listing</li>
            <li>👥 Tell existing tenants — they know friends looking</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
