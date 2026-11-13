import React, { useState } from 'react';
import { Mountain } from 'lucide-react';
import { resolveMediaUrl } from '../lib/media';

interface ImageWithFallbackProps {
  mediaKey: string;
  alt: string;
  className?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  mediaKey,
  alt,
  className = 'w-full h-full object-cover',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="w-full h-full bg-gradient-to-br from-[#173B57] via-[#2A5A74] to-[#779B75] flex flex-col items-center justify-center text-white/90 p-6 text-center"
      >
        <Mountain className="w-8 h-8 mb-2 opacity-80" strokeWidth={1.5} />
        <span className="text-xs font-medium tracking-wide">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={resolveMediaUrl(mediaKey)}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
