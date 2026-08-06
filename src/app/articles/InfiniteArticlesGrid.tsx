'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';

export interface CardArticleItem {
  oracle_id: string;
  name: string;
  type_line: string;
  price_usd: number;
  image_uri: string | null;
  color_identity?: string[];
  slug: string;
}

function getColorLabel(colors?: string[]): string {
  if (!colors || colors.length === 0) return 'Colorless';
  if (colors.length === 1) {
    const map: Record<string, string> = { W: 'Mono-White', U: 'Mono-Blue', B: 'Mono-Black', R: 'Mono-Red', G: 'Mono-Green' };
    return map[colors[0]] || 'Mono-Color';
  }
  return 'Multicolor';
}

function getPriceCap(priceUsd: number): number {
  if (priceUsd >= 50) return 5;
  if (priceUsd >= 30) return 4;
  if (priceUsd >= 20) return 3;
  return 2;
}

interface InfiniteArticlesGridProps {
  initialCards: CardArticleItem[];
  initialHasMore: boolean;
}

export function InfiniteArticlesGrid({ initialCards, initialHasMore }: InfiniteArticlesGridProps) {
  const [cards, setCards] = useState<CardArticleItem[]>(initialCards);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchNextBatch = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/articles?page=${nextPage}&limit=12`);
      const data = await res.json();

      if (res.ok && data.cards) {
        setCards((prev) => [...prev, ...data.cards]);
        setPage(nextPage);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load next page of articles:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading]);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading) {
          fetchNextBatch();
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, isLoading, fetchNextBatch]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <article
            key={card.oracle_id}
            className="glass-card rounded-3xl p-6 shadow-2xl border border-white/10 flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="aspect-[488/680] w-full max-h-56 rounded-2xl overflow-hidden border border-white/10 relative bg-[#090d16]">
                {card.image_uri ? (
                  <img
                    src={card.image_uri}
                    alt={card.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#8b949e]">
                    No Scan
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-[#05070a]/90 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[10px] font-mono font-bold text-amber-300">
                  ${card.price_usd.toFixed(2)} Market
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-[#8b949e] font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> 5 min read
                </span>
                <span>•</span>
                <span>{card.type_line}</span>
              </div>

              <h3 className="font-cinzel font-bold text-lg text-white group-hover:text-amber-300 transition-colors leading-snug">
                Best {getColorLabel(card.color_identity)} budget alternatives to {card.name}
              </h3>

              <p className="text-xs text-[#8b949e] leading-relaxed line-clamp-2">
                Definitive vector-matched {getColorLabel(card.color_identity).toLowerCase()} budget guide for {card.name} with color identity rules and functional tag analysis.
              </p>
            </div>

            <div className="pt-5">
              <Link
                href={`/articles/${card.slug}`}
                className="w-full py-2.5 px-4 bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 text-white font-bold text-xs rounded-xl border border-white/10 hover:border-amber-500/40 transition-all flex items-center justify-center gap-2"
              >
                Read Strategy Article <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {hasMore && (
        <div ref={loaderRef} className="py-8 text-center flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
