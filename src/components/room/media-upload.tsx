'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface MediaUploadProps {
  roomId: string;
  onUploadComplete?: (url: string) => void;
}

export function MediaUpload({ roomId, onUploadComplete }: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);

    try {
      const res = await fetch('/api/v1/media', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      onUploadComplete?.(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [roomId, onUploadComplete]);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragOver ? 'border-primary bg-primary/5' : 'border-border'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleUpload(e.dataTransfer.files);
      }}
    >
      <input
        type="file"
        id="media-upload"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
        onChange={(e) => handleUpload(e.target.files)}
      />

      {isUploading ? (
        <p className="text-muted-foreground">Uploading...</p>
      ) : (
        <>
          <label htmlFor="media-upload" className="cursor-pointer">
            <p className="font-medium">Click to upload</p>
            <p className="text-sm text-muted-foreground mt-1">
              JPEG, PNG, WebP, GIF, MP4, WebM (max 10MB)
            </p>
          </label>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </>
      )}
    </div>
  );
}