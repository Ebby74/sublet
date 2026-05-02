'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { FC } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
}

export const SafeImage: FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  fill,
  priority,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`bg-slate-100 flex items-center justify-center ${className}`}
        style={{ width: width || '100%', height: height || '100%' }}
      >
        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 600}
      height={height || 400}
      className={className}
      priority={priority}
      onError={() => setHasError(true)}
    />
  );
};
