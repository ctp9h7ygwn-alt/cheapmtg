'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Sparkles,
  DollarSign,
  TrendingDown,
  ExternalLink,
  Layers,
  ShieldAlert,
  Zap,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Info,
  Flame,
  ArrowRight,
  Filter,
  ShieldCheck,
  Ban,
  X,
  Maximize2,
  Tag,
  BookOpen
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

  // Close modal on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setEnlargedImage(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    <div className="min-h-screen bg-[#05070a] text-[#f0f6fc] relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* Dynamic Animated Atmospheric Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[140px] animate-pulse-slow"></div>
        <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[150px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[160px] animate-pulse-slow"></div>
      </div>

      {/* Lightbox Image Zoom Modal */}
      {enlargedImage && (
        <div
          onClick={() => setEnlargedImage(null)}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full glass-panel rounded-3xl p-4 border border-white/20 shadow-2xl space-y-3 flex flex-col items-center"
          >
            <div className="w-full flex justify-between items-center px-2">
              <h4 className="font-cinzel text-lg font-bold text-white leading-tight">{enlargedImage.title}</h4>
              <button
                onClick={() => setEnlargedImage(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-[488/680] w-full max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src={enlargedImage.src}
                alt={enlargedImage.title}
                className="w-full h-full object-contain bg-[#05070a]"
              />
            </div>
            <p className="text-[11px] text-[#8b949e] font-mono text-center">Click anywhere outside or press Esc to close</p>
          </div>
        </div>
      )}

      {/* Glassmorphic Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#05070a]/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <img src="/logo.png" alt="MTGCheap Logo" className="h-10 sm:h-14 w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="flex items-center gap-3 sm:gap-6 text-xs font-semibold">
              <Link href="/" className="text-amber-400 border-b border-amber-400 pb-0.5 font-bold">
                Swap Engine
              </Link>
              <Link href="/deck-budgetizer" className="text-[#8b949e] hover:text-white transition-colors flex items-center gap-1.5">
                Deck Budgetizer
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md tracking-wider">
                  BETA
                </span>
              </Link>
              <Link href="/articles" className="text-[#8b949e] hover:text-white transition-colors flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Articles
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative z-10">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-2">
          <h1 className="font-cinzel text-4xl sm:text-5xl font-black tracking-wide leading-tight gradient-text-gold">
            Find Functional Budget Swaps
          </h1>
          <p className="text-[#8b949e] text-base leading-relaxed max-w-2xl mx-auto">
            Analyze any high-cost MTG staple and retrieve lower-cost alternatives.
          </p>

          {/* Autocomplete Search Bar */}
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
                  <h3 className="font-cinzel text-2xl font-bold text-white leading-tight">{targetCard.name}</h3>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-[#8b949e] block uppercase">Market</span>
                  <span className="text-xl font-black text-amber-400 font-mono">${targetCard.price_usd.toFixed(2)}</span>
                </div>
              </div>

              {/* Card Image Display with Click to Zoom */}
              <div
                onClick={() => targetCard.image_uri && setEnlargedImage({ src: targetCard.image_uri, title: targetCard.name })}
                className="relative aspect-[488/680] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#05070a] group cursor-pointer"
              >
                {targetCard.image_uri ? (
                  <>
                    <img
                      src={targetCard.image_uri}
                      alt={targetCard.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                  <h3 className="font-cinzel text-2xl font-bold text-white flex items-center gap-3">
                    Budget Alternatives
                    <span className="text-xs font-sans font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                      {alternatives.length} Swaps Found
                    </span>
                  </h3>
                  <p className="text-xs text-[#8b949e] mt-1 font-sans">
                    Filtered by Color Identity ≤ target ({targetCard.color_identity.join('') || 'C'}) & Price ≤ ${maxPrice.toFixed(2)}
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
                            onClick={() => alt.image_uri && setEnlargedImage({ src: alt.image_uri, title: alt.name })}
                            className="w-24 shrink-0 aspect-[488/680] rounded-xl overflow-hidden border border-white/10 bg-[#05070a] shadow-lg relative cursor-pointer group/img"
                          >
                            {alt.image_uri ? (
                              <>
                                <img
                                  src={alt.image_uri}
                                  alt={alt.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110"
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
                            <h4 className="font-cinzel font-bold text-white text-lg group-hover:text-amber-300 transition-colors leading-tight">
                              {alt.name}
                            </h4>
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
                          rel="noopener noreferrer"
                          className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:brightness-110 text-black font-extrabold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 text-center"
                        >
                          Buy TCGplayer <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={alt.manapool_url}
                          target="_blank"
                          rel="noopener noreferrer"
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

        {/* Featured SEO Strategy Articles Section */}
        <section className="pt-12 border-t border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-cinzel text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" /> Featured Budget Strategy Articles
              </h3>
              <p className="text-xs text-[#8b949e] mt-0.5">
                In-depth vector analysis and deckbuilding guides for top Commander staples.
              </p>
            </div>
            <Link
              href="/articles"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              View All Articles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/articles/budget-options-for-rhystic-study"
              className="glass-card rounded-3xl p-6 border border-white/10 hover:border-amber-500/40 transition-all duration-300 space-y-3 group"
            >
              <div className="flex items-center justify-between text-xs text-[#8b949e] font-mono">
                <span className="text-amber-400 font-bold">Commander Staples</span>
                <span>6 min read</span>
              </div>
              <h4 className="font-cinzel font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                Top 5 Budget Alternatives to Rhystic Study in Commander
              </h4>
              <p className="text-xs text-[#8b949e] line-clamp-2 leading-relaxed">
                Discover vector-matched alternatives like Unifying Theory ($0.44) and Soul Barrier ($0.25) that deliver taxation and card draw for 99% less.
              </p>
              <div className="text-xs font-bold text-emerald-400 font-mono pt-1 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Save over $70 vs Rhystic Study
              </div>
            </Link>

            <Link
              href="/articles/budget-options-for-the-one-ring"
              className="glass-card rounded-3xl p-6 border border-white/10 hover:border-amber-500/40 transition-all duration-300 space-y-3 group"
            >
              <div className="flex items-center justify-between text-xs text-[#8b949e] font-mono">
                <span className="text-cyan-400 font-bold">Artifact Staples</span>
                <span>7 min read</span>
              </div>
              <h4 className="font-cinzel font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                Best Budget Alternatives to The One Ring for EDH
              </h4>
              <p className="text-xs text-[#8b949e] line-clamp-2 leading-relaxed">
                Explore budget replacements like Loreseeker’s Stone ($0.28) and Staff of Compleation ($4.26) for under $5.
              </p>
              <div className="text-xs font-bold text-emerald-400 font-mono pt-1 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Save over $100 vs The One Ring
              </div>
            </Link>
          </div>
        </section>

        {/* How MTGCheap Works Section */}
        <section className="pt-12 border-t border-white/10 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="font-cinzel text-3xl font-bold text-white">How MTGCheap Works</h2>
            <p className="text-xs text-[#8b949e]">
              Machine Learning Vector Similarity & Functional Oracle Tag Matching
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                1
              </div>
              <h3 className="font-cinzel text-lg font-bold text-white">Scryfall Functional Tag Analysis</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Every Magic: The Gathering card is indexed with functional game mechanics (such as <code className="text-amber-300">#tax</code>, <code className="text-amber-300">#card-draw</code>, <code className="text-amber-300">#counterspell</code>, or <code className="text-amber-300">#mana-rock</code>) extracted from official Scryfall oracle tags.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
                2
              </div>
              <h3 className="font-cinzel text-lg font-bold text-white">384-Dim Machine Learning Embeddings</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                We compute 384-dimensional dense semantic vector embeddings for every card using Machine Learning feature extraction. This captures deep strategic relationships across mana costs, rules text, and card categories.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                3
              </div>
              <h3 className="font-cinzel text-lg font-bold text-white">HNSW Cosine Distance Querying</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Our PostgreSQL database leverages <code className="text-emerald-300">pgvector</code> HNSW vector indexes to execute real-time cosine distance similarity queries. It enforces tournament legality, filters color identity rules, and returns top budget substitutes in milliseconds.
              </p>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions (FAQ) Section */}
        <section className="pt-12 border-t border-white/10 space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="font-cinzel text-3xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-[#8b949e]">Everything you need to know about CheapMTG and Machine Learning budget card swaps.</p>
          </div>

          <div className="space-y-4">
            <FaqItem
              question="What is CheapMTG?"
              answer="CheapMTG (MTGCheap) is a Machine Learning vector-powered budget card swap engine for Magic: The Gathering. It analyzes expensive tournament and Commander staples and retrieves contextually accurate, lower-cost functional replacements to help players build powerful budget decks."
            />
            <FaqItem
              question="How does CheapMTG calculate card similarity?"
              answer="Instead of basic keyword searching, CheapMTG evaluates cards across 384 Machine Learning vector dimensions and functional Scryfall oracle tags. It analyzes rules text, mana value, color identity, and game roles to find budget cards that fill the exact same strategic purpose."
            />
            <FaqItem
              question="Are Un-sets or silver-bordered cards excluded by default?"
              answer="Yes. By default, CheapMTG excludes silver-bordered cards, playtest cards, stickers, attractions, and un-cards. You can toggle Un-sets ON or OFF in the filter settings if you play casual house-rule formats."
            />
            <FaqItem
              question="How does the Commander Deck Budgetizer work?"
              answer="The Deck Budgetizer lets you paste a Moxfield URL, Archidekt link, or text decklist, set a target budget (e.g. $50, $100, $200), and automatically swaps high-priced generic staples for vector-matched budget alternatives while preserving irreplaceable core synergy cards."
            />
            <FaqItem
              question="Is CheapMTG free to use?"
              answer="Yes! CheapMTG is 100% free for all Magic: The Gathering players, deckbuilders, and Commander enthusiasts. With 100% transparency, the only revenue we generate to maintain the database server infrastructure comes from affiliate links when you purchase cards through TCGplayer or Mana Pool."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#030508] mt-20 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <img src="/logo.png" alt="MTGCheap Logo" className="h-10 w-auto object-contain" />
              </Link>
              <p className="text-xs text-[#8b949e] leading-relaxed max-w-sm">
                Machine Learning Vector-Powered MTG Budget Swap Engine & Commander Deck Optimization.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white font-mono uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-1.5 text-[#8b949e]">
                <li><Link href="/" className="hover:text-amber-400 transition-colors">Swap Engine</Link></li>
                <li><Link href="/deck-budgetizer" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">Deck Budgetizer <span className="px-1.5 py-0.5 text-[9px] font-extrabold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md">BETA</span></Link></li>
                <li><Link href="/articles" className="hover:text-amber-400 transition-colors">Articles & Strategy</Link></li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white font-mono uppercase tracking-wider">Popular Guides</h4>
              <ul className="space-y-1.5 text-[#8b949e]">
                <li><Link href="/articles/budget-options-for-rhystic-study" className="hover:text-amber-400 transition-colors">Rhystic Study Budget Alternatives</Link></li>
                <li><Link href="/articles/budget-options-for-the-one-ring" className="hover:text-amber-400 transition-colors">The One Ring Budget Alternatives</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 text-[11px] text-[#8b949e] space-y-2 leading-relaxed">
            <p>
              CheapMTG is unofficial Fan Content permitted under the Wizards of the Coast Fan Content Policy. Portions of the materials used are property of Wizards of the Coast. © Wizards of the Coast LLC. Magic: The Gathering is a registered trademark of Wizards of the Coast. Card imagery provided by Scryfall.
            </p>
            <p className="text-[#6e7681]">
              © 2026 CheapMTG. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between text-white font-bold text-sm sm:text-base hover:text-amber-300 transition-colors"
      >
        <span>{question}</span>
        <span className="text-amber-400 font-mono text-lg shrink-0 ml-4">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-xs sm:text-sm text-[#8b949e] leading-relaxed border-t border-white/5 pt-3 animate-fadeIn">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05070a] flex items-center justify-center text-amber-400">Loading CheapMTG...</div>}>
      <SwapEngineContent />
    </Suspense>
  );
}
