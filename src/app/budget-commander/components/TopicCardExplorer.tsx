'use client';

import { useState, useMemo } from 'react';
import { ClusterCard } from '@/lib/topic-clusters-data';
import ExpandableCardImage from '@/app/components/ExpandableCardImage';
import { Sparkles, ExternalLink, Search, Filter, CheckCircle2, ArrowUpDown } from 'lucide-react';

interface Props {
  initialCards: ClusterCard[];
  roleTitle: string;
}

const COLOR_OPTIONS = [
  { key: 'ALL', label: 'All Colors' },
  { key: 'W', label: 'White', colorClass: 'text-amber-100 border-amber-200/30' },
  { key: 'U', label: 'Blue', colorClass: 'text-blue-400 border-blue-400/30' },
  { key: 'B', label: 'Black', colorClass: 'text-purple-400 border-purple-400/30' },
  { key: 'R', label: 'Red', colorClass: 'text-red-400 border-red-400/30' },
  { key: 'G', label: 'Green', colorClass: 'text-emerald-400 border-emerald-400/30' },
  { key: 'C', label: 'Colorless', colorClass: 'text-zinc-300 border-zinc-400/30' },
  { key: 'M', label: 'Multi', colorClass: 'text-yellow-400 border-yellow-400/30' },
];

export default function TopicCardExplorer({ initialCards, roleTitle }: Props) {
  const [selectedColor, setSelectedColor] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(3.00);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'cmc-asc'>('price-asc');

  const filteredCards = useMemo(() => {
    return initialCards.filter((card) => {
      // Price filter
      if (card.price_usd > maxPrice) return false;

      // Color filter
      if (selectedColor !== 'ALL') {
        if (selectedColor === 'C') {
          if (card.color_identity && card.color_identity.length > 0) return false;
        } else if (selectedColor === 'M') {
          if (!card.color_identity || card.color_identity.length < 2) return false;
        } else {
          if (!card.color_identity || !card.color_identity.includes(selectedColor)) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = card.name.toLowerCase().includes(query);
        const matchesText = card.oracle_text.toLowerCase().includes(query);
        const matchesType = card.type_line.toLowerCase().includes(query);
        if (!matchesName && !matchesText && !matchesType) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price_usd - b.price_usd;
      if (sortBy === 'price-desc') return b.price_usd - a.price_usd;
      if (sortBy === 'cmc-asc') return a.mana_value - b.mana_value;
      return 0;
    });
  }, [initialCards, selectedColor, maxPrice, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Interactive Controls Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Filter ${initialCards.length} ${roleTitle.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#05070a] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          {/* Price Cap Tabs */}
          <div className="flex items-center gap-1.5 bg-[#05070a] p-1 rounded-xl border border-white/10 shrink-0 text-xs">
            <span className="text-[10px] text-[#8b949e] px-2 font-mono uppercase font-bold">Max Price:</span>
            {[0.50, 1.00, 2.00, 5.00].map((price) => (
              <button
                key={price}
                onClick={() => setMaxPrice(price)}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                  maxPrice === price
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-[#8b949e] hover:text-white'
                }`}
              >
                ${price.toFixed(2)}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8b949e]" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-[#05070a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="cmc-asc">Mana Value: Low to High</option>
            </select>
          </div>
        </div>

        {/* Color Identity Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5">
          <span className="text-[10px] font-mono text-[#8b949e] mr-2 uppercase font-bold flex items-center gap-1">
            <Filter className="w-3 h-3 text-amber-400" /> Color:
          </span>
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedColor(c.key)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                selectedColor === c.key
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
                  : 'bg-white/[0.02] text-[#8b949e] border-white/[0.06] hover:text-white hover:border-white/20'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#8b949e] font-mono px-1">
        <span>Showing <strong className="text-white">{filteredCards.length}</strong> budget cards</span>
        <span>Filtered from {initialCards.length} total options</span>
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-sm text-[#8b949e] space-y-2">
          <p className="text-white font-semibold">No cards found matching your selected filters.</p>
          <p className="text-xs">Try increasing the max price cap or clearing your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCards.map((card) => (
            <div
              key={card.oracle_id}
              className="glass-card rounded-2xl p-4 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4 group"
            >
              {/* Card Header & Price */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="font-cinzel font-bold text-base text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {card.name}
                  </h3>
                  <div className="text-[11px] text-[#8b949e] line-clamp-1">
                    {card.type_line} • {card.mana_value} CMC
                  </div>
                </div>
                <div className="font-mono text-sm font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
                  ${card.price_usd.toFixed(2)}
                </div>
              </div>

              {/* Card Image & Oracle Text */}
              <div className="flex gap-3.5 items-start">
                <ExpandableCardImage
                  src={card.image_uri}
                  alt={`Magic: The Gathering card image for ${card.name}`}
                  title={card.name}
                  sizes="84px"
                  className="w-20 shrink-0 aspect-[488/680] rounded-lg overflow-hidden border border-white/10 bg-[#05070a] shadow-lg"
                />

                <div className="space-y-2 flex-1 text-xs">
                  <p className="bg-[#05070a]/70 p-2.5 rounded-lg border border-white/5 text-[11px] leading-relaxed text-[#c9d1d9] max-h-28 overflow-y-auto scrollbar-none italic">
                    {card.oracle_text || 'No oracle text.'}
                  </p>

                  {card.tags && card.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {card.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Buy Links */}
              <div className="pt-2 border-t border-white/5 flex gap-2 justify-end text-xs">
                <a
                  href={card.tcgplayer_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-[11px] rounded-lg hover:brightness-110 transition-all flex items-center gap-1 shadow-sm"
                >
                  Buy TCGplayer <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={card.manapool_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className="px-3 py-1.5 bg-white/5 text-white font-semibold text-[11px] rounded-lg border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1"
                >
                  Mana Pool <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
