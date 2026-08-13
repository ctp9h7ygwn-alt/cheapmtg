'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Maximize2, X } from 'lucide-react';

interface ExpandableCardImageProps {
  src: string;
  alt: string;
  title: string;
  sizes?: string;
  containerClassName?: string;
  className?: string;
}

export default function ExpandableCardImage({
  src,
  alt,
  title,
  sizes = '100vw',
  containerClassName = 'w-full h-full',
  className = 'object-cover',
}: ExpandableCardImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-[#8b949e]">
        No Image
      </div>
    );
  }

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={`relative cursor-pointer group/img ${containerClassName}`}
        title={`Click to preview ${title}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={`transition-transform duration-300 group-hover/img:scale-105 ${className}`}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold backdrop-blur-[2px]">
          <Maximize2 className="w-4 h-4 text-amber-300" />
        </div>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full glass-panel rounded-3xl p-4 border border-white/20 shadow-2xl space-y-3 flex flex-col items-center"
          >
            <div className="w-full flex justify-between items-center px-2">
              <h4 className="font-cinzel text-lg font-bold text-white leading-tight">{title}</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-[488/680] w-full max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <Image
                src={src}
                alt={title}
                fill
                sizes="(max-width: 448px) 100vw, 448px"
                className="object-contain bg-[#05070a]"
              />
            </div>
            <p className="text-[11px] text-[#8b949e] font-mono text-center">Click anywhere outside or press Esc to close</p>
          </div>
        </div>
      )}
    </>
  );
}
