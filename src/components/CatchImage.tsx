'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { Fish } from 'lucide-react';

interface CatchImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src?: string | null;
  alt: string;
  fallbackIconClassName?: string;
}

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80';

export default function CatchImage({
  src,
  alt,
  className = '',
  fallbackIconClassName = 'w-8 h-8 text-teal-600/40 dark:text-[#00D2C4]/40',
  ...rest
}: CatchImageProps) {
  const [hasError, setHasError] = useState(false);

  // If no source or error occurred, render styled placeholder
  if (!src || hasError) {
    if (rest.fill) {
      return (
        <div className="w-full h-full bg-slate-100 dark:bg-slate-800/80 flex flex-col items-center justify-center p-2 text-center select-none">
          <Fish className={fallbackIconClassName} />
          <span className="text-[10px] text-[var(--text-secondary)] font-medium mt-1 truncate max-w-[90%]">
            {alt || 'Fresh Catch'}
          </span>
        </div>
      );
    }
    return (
      <div
        style={{ width: rest.width, height: rest.height }}
        className="bg-slate-100 dark:bg-slate-800/80 rounded-xl flex flex-col items-center justify-center p-2 text-center select-none"
      >
        <Fish className={fallbackIconClassName} />
        <span className="text-[10px] text-[var(--text-secondary)] font-medium mt-1 truncate max-w-[90%]">
          {alt || 'Fresh Catch'}
        </span>
      </div>
    );
  }

  // Safe external URL rendering with unoptimized fallback if needed
  const isExternal = src.startsWith('http://') || src.startsWith('https://');

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      unoptimized={isExternal && !src.includes('unsplash.com') && !src.includes('supabase.co')}
      {...rest}
    />
  );
}
