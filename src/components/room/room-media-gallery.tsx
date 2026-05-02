'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface RoomMediaGalleryProps {
  photos: string[];
  videos?: string[];
  roomId: string;
  editable?: boolean;
}

export function RoomMediaGallery({ photos = [], videos = [], roomId, editable = false }: RoomMediaGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const allMedia = [...photos, ...(videos || [])];
  const handleDelete = async (url: string) => {
    if (!confirm('Delete this media?')) return;
    setIsDeleting(url);
    try {
      const mediaType = (videos || []).includes(url) ? 'videos' : 'photos';
      const res = await fetch(`/api/v1/media?url=${encodeURIComponent(url)}&roomId=${roomId}&mediaType=${mediaType}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (allMedia.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
        No media uploaded yet
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((url, i) => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden border">
            <Image
              src={url}
              alt={`Room photo ${i + 1}`}
              fill
              className="object-cover cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setLightboxIndex(i)}
            />
            {editable && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(url)}
                disabled={!!isDeleting}
              >
                {isDeleting === url ? '...' : '×'}
              </Button>
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button className="absolute top-4 right-4 text-white text-2xl p-4" onClick={() => setLightboxIndex(null)}>
            ×
          </button>
          <Image
            src={photos[lightboxIndex]}
            alt="Full size"
            fill
            className="object-contain max-h-[90vh] max-w-[90vw]"
          />
        </div>
      )}
    </>
  );
}