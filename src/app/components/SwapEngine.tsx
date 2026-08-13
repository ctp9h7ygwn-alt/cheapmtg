'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Sparkles,
  TrendingDown,
  ExternalLink,
  Layers,
  ShieldAlert,
  Zap,
  CheckCircle2,
  RefreshCw,
  Filter,
  ShieldCheck,
  Ban,
  X,
  Maximize2,
  Tag,
} from 'lucide-react';

interface CardSearchItem {
  oracle_id: string;
  name: string;
  type_line: string;
  mana_value: number;
  color_identity: string[];
  price_usd: number | null;
  image_uri: string;
}

interface TargetCard {
  oracle_id: string;
  name: string;
  mana_value: number;
  mana_cost?: string;
  colors: string[];
  color_identity: string[];
  type_line: string;
  oracle_text: string;
  price_usd: number;
  scryfall_uri: string;
  image_uri: string;
  oracle_tags: string[];
  primary_types?: string[];
}

interface AlternativeCard {
  oracle_id: string;
  name: string;
  mana_value: number;
  mana_cost?: string;
  colors: string[];
  color_identity: string[];
  type_line: string;
  oracle_text: string;
  price_usd: number;
  scryfall_uri: string;
  image_uri: string;
  similarity_score: number;
  shared_tag_count: number;
  shared_tags: string[];
  dollar_savings: number;
  percent_savings: number;
  tcgplayer_url: string;
  manapool_url: string;
}

const PRESET_STAPLES = [
  'The One Ring',
  'Static Orb',
  'Rhystic Study',
  'Urza, Lord High Artificer',
  'Ravnica at War',
  'Cyclonic Rift'
];

function SwapEngineContent() {
  const searchParams = useSearchParams();
  const paramCardName = searchParams.get('target_card_name');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CardSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedCardName, setSelectedCardName] = useState('Static Orb');
  const [maxPrice, setMaxPrice] = useState(3.00);
  const [limit, setLimit] = useState(6);
  const [excludeSilver, setExcludeSilver] = useState(true);
  const [matchCardType, setMatchCardType] = useState(false);

  const [targetCard, setTargetCard] = useState<TargetCard | null>(null);
  const [alternatives, setAlternatives] = useState<AlternativeCard[]>([]);
  const [isLoadingSwap, setIsLoadingSwap] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Card Image Lightbox Modal State
  const [enlargedImage, setEnlargedImage] = useState<{ src: string; title: string } | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Handle URL search parameter target_card_name on page load / navigation
  useEffect(() => {
    if (paramCardName) {
      setSelectedCardName(paramCardName);
      setSearchQuery(paramCardName);
    }
  }, [paramCardName]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close modal on Escape key or close-all event
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setEnlargedImage(null);
      }
    }
    function handleCloseOthers() {
      setEnlargedImage(null);
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('close-all-card-lightboxes', handleCloseOthers);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('close-all-card-lightboxes', handleCloseOthers);
    };
  }, []);

  const openLightbox = (src: string, title: string) => {
    window.dispatchEvent(new CustomEvent('close-all-card-lightboxes'));
    setEnlargedImage({ src, title });
  };

  // Autocomplete search handler
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/cards/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.cards || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Budget Swaps
  const fetchBudgetSwaps = async (
    cardName: string,
    priceCap: number,
    resultLimit: number,
    excludeSilverBordered: boolean,
    matchSameCardType: boolean
  ) => {
    setIsLoadingSwap(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/budget-swap?target_card_name=${encodeURIComponent(cardName)}&max_price=${priceCap}&limit=${resultLimit}&exclude_silver_bordered=${excludeSilverBordered}&match_card_type=${matchSameCardType}`
      );
      
      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error('Server returned an invalid response. Please try again.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to calculate budget swaps.');
      }

      setTargetCard(data.target_card);
      setAlternatives(data.alternatives || []);
    } catch (err: any) {
      setErrorMsg(err.message);
      setTargetCard(null);
      setAlternatives([]);
    } finally {
      setIsLoadingSwap(false);
    }
  };

  // Trigger search on select or submit
  useEffect(() => {
    if (selectedCardName) {
      fetchBudgetSwaps(selectedCardName, maxPrice, limit, excludeSilver, matchCardType);
    }
  }, [selectedCardName, maxPrice, limit, excludeSilver, matchCardType]);

  const handleSelectCard = (name: string) => {
    setSelectedCardName(name);
    setSearchQuery(name);
    setShowDropdown(false);
  };

  function getSinglePipStyle(pip: string): string {
    const p = pip.toUpperCase();
    if (p === 'W') return 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-950 border-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.3)]';
    if (p === 'U') return 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-blue-300 shadow-[0_0_6px_rgba(59,130,246,0.4)]';
    if (p === 'B') return 'bg-gradient-to-br from-slate-900 to-zinc-950 text-slate-200 border-slate-700 shadow-[0_0_6px_rgba(0,0,0,0.5)]';
    if (p === 'R') return 'bg-gradient-to-br from-red-500 to-rose-600 text-white border-red-300 shadow-[0_0_6px_rgba(239,68,68,0.4)]';
    if (p === 'G') return 'bg-gradient-to-br from-emerald-500 to-green-600 text-white border-emerald-300 shadow-[0_0_6px_rgba(16,185,129,0.4)]';
    if (p === 'C') return 'bg-zinc-400 text-zinc-900 border-zinc-300';
    if (p === 'X' || p === 'Y' || p === 'Z') return 'bg-slate-700 text-amber-300 border-slate-500';
    return 'bg-slate-800 text-white border-slate-600';
  }

  function ManaPips({ manaCost, manaValue, colors }: { manaCost?: string; manaValue?: number; colors?: string[] }) {
    if (manaCost && manaCost.includes('{')) {
      const pips = manaCost.match(/\{([^}]+)\}/g)?.map((s) => s.replace(/[\{\}]/g, '')) || [];
      if (pips.length > 0) {
        return (
          <div className="inline-flex items-center gap-1 shrink-0">
            {pips.map((pip, idx) => {
              const style = getSinglePipStyle(pip);
              return (
                <span
                  key={idx}
                  className={`w-5 h-5 rounded-full font-extrabold text-[11px] font-mono flex items-center justify-center border shadow-sm ${style}`}
                >
                  {pip}
                </span>
              );
            })}
          </div>
        );
      }
    }

    const mv = manaValue || 0;
    const cols = colors || [];
    const genericCost = Math.max(0, Math.round(mv - cols.length));

    if (mv === 0 && cols.length === 0) return null;

    return (
      <div className="inline-flex items-center gap-1 shrink-0">
        {genericCost > 0 && (
          <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-extrabold text-[11px] font-mono border border-slate-600 flex items-center justify-center shadow-sm">
            {genericCost}
          </span>
        )}
        {cols.map((c) => {
          const badgeStyle = getSinglePipStyle(c);
          return (
            <span
              key={c}
              className={`w-5 h-5 rounded-full font-extrabold text-[11px] font-mono flex items-center justify-center border shadow-sm ${badgeStyle}`}
            >
              {c}
            </span>
          );
        })}
      </div>
    );
  }

  const getColorBadge = (color: string) => {
    const map: Record<string, { bg: string; text: string; label: string; border: string }> = {
      W: { bg: 'bg-amber-400/15', text: 'text-amber-200', border: 'border-amber-300/40', label: 'Sun' },
      U: { bg: 'bg-cyan-400/15', text: 'text-cyan-300', border: 'border-cyan-400/40', label: 'Island' },
      B: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-400/40', label: 'Swamp' },
      R: { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-400/40', label: 'Mountain' },
      G: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-400/40', label: 'Forest' },
    };
    return map[color] || { bg: 'bg-gray-500/15', text: 'text-gray-300', border: 'border-gray-400/40', label: color };
  };

  return (
    <>
      {/* Lightbox Image Zoom Modal */}
      {enlargedImage && (
        <div
          onClick={() => setEnlargedImage(null)}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 transition-all duration-300 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm sm:max-w-md w-full bg-[#0d1322] rounded-3xl p-5 border border-amber-500/40 shadow-[0_0_60px_rgba(0,0,0,0.95)] space-y-4 flex flex-col items-center z-[101]"
          >
            {/* Modal Header */}
            <div className="w-full flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white leading-tight truncate pr-2">
                {enlargedImage.title}
              </h3>
              <button
                onClick={() => setEnlargedImage(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-amber-500/20 hover:text-amber-300 flex items-center justify-center text-white transition-all shrink-0 border border-white/10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Premium Card Scan Display */}
            <div className="relative aspect-[488/680] w-full max-w-[320px] sm:max-w-[360px] rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-[#05070a]">
              <Image
                src={enlargedImage.src}
                alt={enlargedImage.title}
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

      {/* Autocomplete Search Bar */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-2">
        <div ref={searchContainerRef} className="relative max-w-2xl mx-auto pt-2">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/40 via-cyan-500/30 to-purple-500/40 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-[#0d121f] border border-white/10 rounded-2xl shadow-2xl focus-within:border-amber-500/80 transition-all">
              <Search className="ml-4 w-5 h-5 text-[#8b949e] shrink-0" />
              <input
                type="text"
                placeholder="Search MTG card (e.g. The One Ring, Static Orb, Rhystic Study)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                className="w-full px-4 py-4 bg-transparent text-white placeholder-[#8b949e] text-sm focus:outline-none font-sans"
              />
              {isSearching && (
                <RefreshCw className="mr-4 w-4 h-4 text-amber-400 animate-spin shrink-0" />
              )}
            </div>
          </div>

          {/* Dropdown Suggestions */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-3 bg-[#0c101c]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto divide-y divide-white/5 backdrop-blur-2xl">
              {searchResults.map((card) => (
                <button
                  key={card.oracle_id}
                  onClick={() => handleSelectCard(card.name)}
                  className="w-full px-5 py-3.5 text-left hover:bg-white/[0.06] flex items-center justify-between transition-colors group"
                >
                  <div>
                    <div className="font-semibold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                      {card.name}
                      <span className="text-xs font-normal text-[#8b949e]">({card.type_line})</span>
                    </div>
                    <div className="text-xs text-[#8b949e] font-mono mt-0.5">
                      Color Identity: {card.color_identity.length > 0 ? card.color_identity.join(', ') : 'Colorless'}
                    </div>
                  </div>
                  {card.price_usd && (
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      ${parseFloat(card.price_usd.toString()).toFixed(2)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Preset Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-xs text-[#8b949e] font-medium mr-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Staples:
          </span>
          {PRESET_STAPLES.map((staple) => (
            <button
              key={staple}
              onClick={() => handleSelectCard(staple)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                selectedCardName.toLowerCase() === staple.toLowerCase()
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10 scale-105'
                  : 'glass-panel text-[#c9d1d9] hover:border-amber-500/40 hover:text-white'
              }`}
            >
              {staple}
            </button>
          ))}
        </div>
      </section>

      {/* Interactive Budget Threshold & Filter Panel */}
      <section className="glass-panel rounded-3xl p-6 shadow-2xl border border-white/10 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Slider Control */}
          <div className="w-full md:w-1/2 space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-[#c9d1d9] flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-400" /> Max Price Ceiling:
              </span>
              <span className="font-mono text-amber-300 font-bold text-base bg-amber-500/15 px-3 py-1 rounded-xl border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                ${maxPrice.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.25"
              max="10.00"
              step="0.25"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#8b949e] font-mono">
              <span>$0.25</span>
              <span>$2.50</span>
              <span>$5.00</span>
              <span>$7.50</span>
              <span>$10.00</span>
            </div>
          </div>

          {/* Rule Filters & Toggles */}
          <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-1/2">
            {/* Match Card Type Toggle */}
            <button
              onClick={() => setMatchCardType(!matchCardType)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all shadow-md ${
                matchCardType
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-cyan-500/10'
                  : 'bg-white/5 text-[#8b949e] border-white/10 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Same Card Type {matchCardType ? '(ON)' : '(OFF)'}</span>
            </button>

            {/* Exclude Silver Bordered Toggle */}
            <button
              onClick={() => setExcludeSilver(!excludeSilver)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all shadow-md ${
                excludeSilver
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}
            >
              {excludeSilver ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exclude Un-sets (ON)</span>
                </>
              ) : (
                <>
                  <Ban className="w-3.5 h-3.5 text-rose-400" />
                  <span>Include Un-sets</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                className="bg-[#05070a] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value={3}>Top 3</option>
                <option value={5}>Top 5</option>
                <option value={8}>Top 8</option>
                <option value={12}>Top 12</option>
              </select>
            </div>

            <button
              onClick={() => fetchBudgetSwaps(selectedCardName, maxPrice, limit, excludeSilver, matchCardType)}
              disabled={isLoadingSwap}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSwap ? 'animate-spin' : ''}`} />
              Recalculate
            </button>
          </div>
        </div>
      </section>

      {/* Error State */}
      {errorMsg && (
        <div className="max-w-4xl mx-auto bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 text-rose-300 text-sm flex items-center gap-4 shadow-xl">
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <p className="font-bold text-white">Target card not available</p>
            <p className="text-xs text-rose-300/80 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      {isLoadingSwap ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm font-mono text-amber-300 animate-pulse">Running cosine distance query in pgvector...</p>
        </div>
      ) : targetCard ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Target Card Spotlight Pane (4 cols) */}
          <aside className="lg:col-span-4 glass-panel rounded-3xl p-6 shadow-2xl border border-white/10 space-y-6 lg:sticky lg:top-28">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  TARGET CARD
                </span>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  <h2 className="font-cinzel text-2xl font-bold text-white leading-tight">{targetCard.name}</h2>
                  <ManaPips manaCost={targetCard.mana_cost} manaValue={targetCard.mana_value} colors={targetCard.colors} />
                </div>
              </div>
              <div className="text-right font-mono shrink-0 pl-2">
                <span className="text-[10px] text-[#8b949e] block uppercase">Market</span>
                <span className="text-xl font-black text-amber-400 font-mono">${targetCard.price_usd.toFixed(2)}</span>
              </div>
            </div>

            {/* Card Image Display with Click to Zoom */}
            <div
              onClick={() => targetCard.image_uri && openLightbox(targetCard.image_uri, targetCard.name)}
              className="relative aspect-[488/680] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#05070a] group cursor-pointer"
            >
              {targetCard.image_uri ? (
                <>
                  <Image
                    src={targetCard.image_uri}
                    alt={`${targetCard.name} - ${targetCard.type_line} Magic: The Gathering card`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-semibold text-xs backdrop-blur-[2px]">
                    <Maximize2 className="w-4 h-4 text-amber-300" /> Click to Enlarge
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#8b949e]">
                  <Layers className="w-12 h-12 mb-2 text-white/20" />
                  <span>No image scan</span>
                </div>
              )}
            </div>

            {/* Target Metadata details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[#8b949e]">Type Line:</span>
                <span className="text-white font-medium">{targetCard.type_line}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[#8b949e]">Mana Value:</span>
                <span className="text-white font-mono font-bold">{targetCard.mana_value} CMC</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[#8b949e]">Color Identity:</span>
                <div className="flex gap-1.5">
                  {targetCard.color_identity.length > 0 ? (
                    targetCard.color_identity.map((c) => {
                      const badge = getColorBadge(c);
                      return (
                        <span
                          key={c}
                          className={`px-2 py-0.5 rounded-md font-mono font-extrabold text-[11px] border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {c}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-gray-400 font-mono text-[11px]">Colorless</span>
                  )}
                </div>
              </div>

              {targetCard.oracle_text && (
                <div className="pt-1">
                  <span className="text-[#8b949e] block mb-1.5 font-medium">Oracle Text:</span>
                  <p className="bg-[#05070a]/80 p-3.5 rounded-xl border border-white/10 text-[#c9d1d9] italic text-xs leading-relaxed">
                    {targetCard.oracle_text}
                  </p>
                </div>
              )}

              {/* Target Functional Tags */}
              {targetCard.oracle_tags && targetCard.oracle_tags.length > 0 && (
                <div className="pt-1">
                  <span className="text-[#8b949e] block mb-1.5 font-medium">Functional Oracle Tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {targetCard.oracle_tags.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Recommended Alternatives Grid (8 cols) */}
          <section className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-cinzel text-2xl font-bold text-white flex items-center gap-3">
                  Budget Alternatives
                  <span className="text-xs font-sans font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    {alternatives.length} Swaps Found
                  </span>
                </h2>
                <p className="text-xs text-[#8b949e] mt-1 font-sans">
                  Filtered by Color Identity ≤ target ({targetCard.color_identity.join('') || 'C'}) &amp; Price ≤ ${maxPrice.toFixed(2)}
                  {matchCardType && targetCard.primary_types && ` (Matching Type: ${targetCard.primary_types.join(', ')})`}
                  {excludeSilver && ' (Un-sets Excluded)'}
                </p>
              </div>
            </div>

            {alternatives.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-white/10">
                <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
                <h4 className="font-cinzel text-xl font-bold text-white">No budget alternatives under ${maxPrice.toFixed(2)}</h4>
                <p className="text-xs text-[#8b949e] max-w-md mx-auto">
                  Try increasing the max price ceiling slider above or turning off strict type matching.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {alternatives.map((alt, idx) => (
                  <article
                    key={alt.oracle_id}
                    className="glass-card rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1.5"
                  >
                    <div className="space-y-4">
                      {/* Header Badges */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-amber-300 font-bold bg-amber-500/15 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                          #{idx + 1} Best Swap
                        </span>
                        <span className="font-mono font-bold px-2.5 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> {alt.similarity_score}% Match
                        </span>
                      </div>

                      {/* Card Image + Info */}
                      <div className="flex gap-4">
                        <div
                          onClick={() => alt.image_uri && openLightbox(alt.image_uri, alt.name)}
                          className="w-24 shrink-0 aspect-[488/680] rounded-xl overflow-hidden border border-white/10 bg-[#05070a] shadow-lg relative cursor-pointer group/img"
                        >
                          {alt.image_uri ? (
                            <>
                              <Image
                                src={alt.image_uri}
                                alt={`${alt.name} - budget alternative Magic: The Gathering card`}
                                fill
                                sizes="96px"
                                className="object-cover transition-transform duration-300 group-hover/img:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Maximize2 className="w-4 h-4 text-amber-300" />
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#8b949e]">
                              No Art
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-cinzel font-bold text-white text-lg group-hover:text-amber-300 transition-colors leading-tight">
                              {alt.name}
                            </h3>
                            <ManaPips manaCost={alt.mana_cost} manaValue={alt.mana_value} colors={alt.colors} />
                          </div>
                          <p className="text-xs text-[#8b949e] line-clamp-1">{alt.type_line}</p>

                          {/* Similarity Bar */}
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden my-2">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${alt.similarity_score}%` }}
                            ></div>
                          </div>

                          {/* Price Comparison Badge */}
                          <div className="pt-1">
                            <div className="text-lg font-black font-mono text-emerald-400 flex items-baseline gap-2">
                              ${alt.price_usd.toFixed(2)}
                              <span className="text-xs text-[#8b949e] line-through font-normal">
                                ${targetCard.price_usd.toFixed(2)}
                              </span>
                            </div>
                            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 mt-1 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                              <TrendingDown className="w-3.5 h-3.5" /> Save ${alt.dollar_savings.toFixed(2)} ({alt.percent_savings}%)
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shared Functional Tags */}
                      {alt.shared_tags && alt.shared_tags.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-[#8b949e] block font-semibold uppercase tracking-wider">
                            Shared Functional Tags:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {alt.shared_tags.map((t) => (
                              <span
                                key={t}
                                className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3 text-cyan-400" /> #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Oracle Text */}
                      <p className="bg-[#05070a]/70 p-3 rounded-xl border border-white/5 text-[#c9d1d9] text-[11px] italic leading-relaxed line-clamp-3">
                        {alt.oracle_text}
                      </p>
                    </div>

                    {/* CTA Affiliate Links */}
                    <div className="pt-4 border-t border-white/10 mt-4 flex items-center gap-2">
                      <a
                        href={alt.tcgplayer_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:brightness-110 text-black font-extrabold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 text-center"
                      >
                        Buy TCGplayer <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={alt.manapool_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        className="py-2.5 px-3 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-xl border border-white/10 transition-all flex items-center justify-center gap-1 text-center"
                      >
                        Mana Pool <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}

export default function SwapEngine() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-amber-400 animate-pulse">Loading swap engine...</div>}>
      <SwapEngineContent />
    </Suspense>
  );
}
