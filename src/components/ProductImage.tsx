import { useState } from 'react';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  focus?: 'left' | 'center' | 'right';
  className?: string;
}

export function ProductImage({
  src,
  alt,
  focus = 'center',
  className = '',
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  const objectPosition =
    focus === 'left'
      ? 'object-[22%_50%]'
      : focus === 'right'
        ? 'object-[78%_50%]'
        : 'object-center';

  if (failed || !src) {
    return (
      <div
        className={`w-full h-full bg-gradient-to-br from-[#EDE5F7] via-[#F7F4FC] to-slate-100 flex flex-col items-center justify-center p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-xl bg-white/80 text-[#663399] flex items-center justify-center mb-3 shadow-xs">
          <Package className="w-6 h-6" />
        </div>
        <span className="text-xs font-medium text-slate-600 line-clamp-2 max-w-[180px]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`w-full h-full object-cover ${objectPosition} ${className}`}
    />
  );
}
