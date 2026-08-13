'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Maximize2, X, Layers } from 'lucide-react';

interface ExpandableCardImageProps {
  src: string;
  alt: string;
  title: string;
  sizes?: string;
  className?: string;
  imageClassName?: string;
}

export default function ExpandableCardImage({
  src,
  alt,
  title,
  sizes = '100vw',
  className = 'w-full aspect-[488/680] rounded-2xl overflow-hidden border border-white/10 bg-[#05070a]',
  imageClassName = 'object-cover',
}: ExpandableCardImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleCloseOthers() {
      setIsOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('close-all-card-lightboxes', handleCloseOthers);
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('close-all-card-lightboxes', handleCloseOthers);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('close-all-card-lightboxes'));
    setIsOpen(true);
  };

  if (!src) {
    return (
      <div className={`flex flex-col items-center justify-center p-2 text-center text-[#8b949e] ${className}`}>
        <Layers className="w-8 h-8 mb-1 text-white/20" />
        <span className="text-[10px]">No Image</span>
      </div>
    );
  }

  return (
    <>
      <div
        onClick={handleOpen}
        className={`relative group cursor-pointer ${className}`}
        title={`Click to preview ${title}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={`transition-transform duration-500 group-hover:scale-105 ${imageClassName}`}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold backdrop-blur-[2px] gap-1.5">
          <Maximize2 className="w-4 h-4 text-amber-300" />
        </div>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 transition-all duration-300 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm sm:max-w-md w-full bg-[#0d1322] rounded-3xl p-5 border border-amber-500/40 shadow-[0_0_60px_rgba(0,0,0,0.95)] space-y-4 flex flex-col items-center z-[101]"
          >
            {/* Modal Header */}
            <div className="w-full flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white leading-tight truncate pr-2">
                {title}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-amber-500/20 hover:text-amber-300 flex items-center justify-center text-white transition-all shrink-0 border border-white/10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Premium Card Scan Display */}
            <div className="relative aspect-[488/680] w-full max-w-[320px] sm:max-w-[360px] rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-[#05070a]">
              <Image
                src={src}
                alt={title}
                fill
                sizes="(max-width: 400px) 100vw, 360px"
                className="object-contain bg-[#05070a]"
                priority
              />
            </div>

            {/* Footer dismissal note */}
            <p className="text-[11px] text-[#8b949e] font-mono text-center pt-1">
              Click outside or press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white text-[10px]">Esc</kbd> to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}
