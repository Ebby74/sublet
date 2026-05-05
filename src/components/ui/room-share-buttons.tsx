'use client';

import { useState, useRef, useCallback } from 'react';

interface SharePlatform {
  name: string;
  icon: string;
  color: string;
  getUrl: (url: string, title: string) => string;
  isCopy?: boolean;
}

const sharePlatforms: SharePlatform[] = [
  {
    name: 'WhatsApp',
    icon: '💬',
    color: 'bg-green-500 hover:bg-green-600',
    getUrl: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
  },
  {
    name: 'Facebook',
    icon: '📘',
    color: 'bg-blue-600 hover:bg-blue-700',
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'Telegram',
    icon: '✈️',
    color: 'bg-blue-400 hover:bg-blue-500',
    getUrl: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: 'Twitter',
    icon: '🐦',
    color: 'bg-slate-800 hover:bg-slate-900',
    getUrl: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: 'Copy Link',
    icon: '🔗',
    color: 'bg-slate-500 hover:bg-slate-600',
    getUrl: (url: string) => url,
    isCopy: true,
  },
];

interface RoomShareButtonsProps {
  url: string;
  title: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RoomShareButtons({ url, title, size = 'sm' }: RoomShareButtonsProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleShare = useCallback((platform: SharePlatform) => {
    if (platform.isCopy) {
      navigator.clipboard.writeText(url).then(() => {
        setShowTooltip(platform.name);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setShowTooltip(null), 2000);
      });
    } else {
      window.open(platform.getUrl(url, title), '_blank', 'noopener,noreferrer');
    }
  }, [url, title]);

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base',
  };

  return (
    <div className="flex gap-1.5 flex-wrap relative">
      {sharePlatforms.map((platform) => (
        <button
          key={platform.name}
          onClick={() => handleShare(platform)}
          className={`flex items-center gap-1.5 rounded-full text-white font-medium transition-colors ${platform.color} ${sizeClasses[size]} relative`}
          title={`Share on ${platform.name}`}
        >
          <span>{platform.icon}</span>
          {size !== 'sm' && platform.name}
          {showTooltip === platform.name && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
              Copied!
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
