'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingDown,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Sliders,
  DollarSign,
  Layers,
  ArrowRight,
  BookOpen,
  Filter,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

interface AppliedSwap {
  original_card: {
    oracle_id: string;
    name: string;
    type_line: string;
    price_usd: number;
    image_uri: string;
    count: number;
  };
  swap_card: {
    oracle_id: string;
    name: string;
    type_line: string;
    mana_value: number;
    price_usd: number;
    image_uri: string;
    similarity_score: number;
    shared_tags: string[];
    tcgplayer_url: string;
    manapool_url: string;
  };
  dollar_savings: number;
  percent_savings: number;
}

interface KeptCard {
  oracle_id: string;
  name: string;
  type_line: string;
  price_usd: number;
  image_uri: string;
}

interface BudgetizerResult {
  parsed_count: number;
  original_deck_price: number;
  optimized_deck_price: number;
  total_savings: number;
  target_budget: number;
  swaps_applied: AppliedSwap[];
  kept_core_cards: KeptCard[];
  optimized_decklist_text: string;
}

const PRESET_SAMPLE_DECKS = [
  {
    name: 'Moxfield Sample Deck',
    url: 'https://www.moxfield.com/decks/sample-edh-staples',
  },
  {
    name: 'Archidekt Sample Deck',
    url: 'https://archidekt.com/decks/sample-commander-deck',
  },
];

export default function DeckBudgetizerPage() {
  const [deckInput, setDeckInput] = useState('');
  const [targetBudget, setTargetBudget] = useState(100);
  const [excludeSilver, setExcludeSilver] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<BudgetizerResult | null>(null);

  const [copied, setCopied] = useState(false);

  const handleRunBudgetizer = async () => {
    if (!deckInput.trim()) {
      setErrorMsg('Please paste a Moxfield URL, Archidekt URL, or text decklist.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/deck-budgetizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deck_input: deckInput,
          target_budget: targetBudget,
          exclude_silver: excludeSilver,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to budgetize deck.');
      }

      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message);
      setResult(null);
    } fontFinally: {
      setIsLoading(false);
    }
  };

  const handleCopyDecklist = () => {
    if (!result?.optimized_decklist_text) return;
    navigator.clipboard.writeText(result.optimized_decklist_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-[#f0f6fc] relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[140px] animate-pulse-slow"></div>
        <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[150px] animate-pulse-slow"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#05070a]/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <img src="/logo.png" alt="MTGCheap Logo" className="h-10 sm:h-14 w-auto object-contain" />
          </Link>

          <nav className="flex items-center gap-3 sm:gap-6 text-xs font-semibold">
            <Link href="/" className="text-[#8b949e] hover:text-white transition-colors">
              Swap Engine
            </Link>
            <Link href="/deck-budgetizer" className="text-amber-400 font-bold border-b border-amber-400 pb-0.5 flex items-center gap-1.5">
              Deck Budgetizer
              <span className="px-1.5 py-0.5 text-[10px] font-extrabold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md tracking-wider">
                BETA
              </span>
            </Link>
            <Link href="/budget-commander" className="text-[#8b949e] hover:text-white transition-colors">
              Budget Hub
            </Link>
            <Link href="/articles" className="text-[#8b949e] hover:text-white transition-colors flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Articles
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative z-10">
        {/* Hero Banner */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="font-cinzel text-4xl sm:text-5xl font-black leading-tight gradient-text-gold flex items-center justify-center gap-3">
            Commander Deck Budgetizer
            <span className="px-2.5 py-0.5 text-xs font-extrabold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full tracking-widest shadow-sm">
              BETA
            </span>
          </h1>
          <p className="text-[#8b949e] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Paste your Moxfield URL, Archidekt link, or raw decklist. Set your target budget, and our vector engine automatically swaps expensive cards to fit your budget.
          </p>
        </section>

        {/* Form Controls */}
        <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 max-w-4xl mx-auto space-y-6 shadow-2xl">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Deck URL or Copy-Pasted Text Decklist:
            </label>
            <textarea
              rows={4}
              placeholder="Paste Moxfield URL (https://www.moxfield.com/decks/...), Archidekt URL, or raw list (e.g. 1 Sol Ring)..."
              value={deckInput}
              onChange={(e) => setDeckInput(e.target.value)}
              className="w-full p-4 bg-[#090d16] border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
            />
          </div>

          {/* Budget Slider & Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-t border-white/10 pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
                <span className="text-[#c9d1d9] flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-400" /> Target Deck Budget:
                </span>
                <span className="font-mono text-amber-300 font-bold text-base bg-amber-500/15 px-3 py-1 rounded-xl border border-amber-500/30">
                  ${targetBudget}.00
                </span>
              </div>
              <input
                type="range"
                min="25"
                max="300"
                step="25"
                value={targetBudget}
                onChange={(e) => setTargetBudget(parseInt(e.target.value, 10))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#8b949e] font-mono">
                <span>$25</span>
                <span>$50</span>
                <span>$100</span>
                <span>$200</span>
                <span>$300</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={() => setExcludeSilver(!excludeSilver)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                  excludeSilver
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exclude Un-sets ({excludeSilver ? 'ON' : 'OFF'})</span>
              </button>

              <button
                onClick={handleRunBudgetizer}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Budgetizing Deck...' : 'Optimize Deck Budget'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-rose-300 text-xs sm:text-sm flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </section>

        {/* Results Dashboard */}
        {result && (
          <section className="space-y-8 animate-fadeIn">
            {/* Savings Overview Banner */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <span className="text-xs text-[#8b949e] font-mono uppercase block">Original Deck Cost</span>
                <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                  ${result.original_deck_price.toFixed(2)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#8b949e] font-mono uppercase block">Optimized Cost</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  ${result.optimized_deck_price.toFixed(2)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#8b949e] font-mono uppercase block">Total Savings</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono flex items-center justify-center gap-1">
                  <TrendingDown className="w-6 h-6 text-amber-400" /> ${result.total_savings.toFixed(2)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#8b949e] font-mono uppercase block">Swaps Applied</span>
                <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
                  {result.swaps_applied.length} Swaps
                </span>
              </div>
            </div>

            {/* Export Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel rounded-2xl p-4 border border-white/10">
              <div className="text-xs text-[#8b949e]">
                <strong className="text-white">Deck Optimized!</strong> Ready to export back into Moxfield, Archidekt, or MTGO.
              </div>
              <button
                onClick={handleCopyDecklist}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied Decklist!' : 'Copy Optimized Decklist'}
              </button>
            </div>

            {/* Applied Swaps Breakdown Table */}
            <div className="space-y-4">
              <h3 className="font-cinzel text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Applied Budget Swaps ({result.swaps_applied.length})
              </h3>

              {result.swaps_applied.length === 0 ? (
                <div className="glass-panel rounded-2xl p-8 text-center text-xs text-[#8b949e]">
                  Your deck is already within your target budget! No budget swaps required.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {result.swaps_applied.map((swap, idx) => (
                    <div
                      key={swap.original_card.oracle_id}
                      className="glass-card rounded-3xl p-6 border border-white/10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                    >
                      {/* Original Card */}
                      <div className="md:col-span-5 flex items-center gap-4 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-4">
                        <img
                          src={swap.original_card.image_uri}
                          alt={swap.original_card.name}
                          className="w-16 h-22 object-cover rounded-lg border border-white/10 shrink-0"
                        />
                        <div>
                          <span className="text-[10px] text-rose-400 font-mono font-bold block uppercase">Original Staple</span>
                          <h4 className="font-cinzel font-bold text-white text-base">{swap.original_card.name}</h4>
                          <span className="text-xs font-mono text-rose-300 block font-bold mt-0.5">
                            ${swap.original_card.price_usd.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Swap Arrow & Similarity */}
                      <div className="md:col-span-2 text-center flex flex-col items-center justify-center gap-1">
                        <span className="text-xs font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
                          {swap.swap_card.similarity_score}% Match
                        </span>
                        <ArrowRight className="w-5 h-5 text-amber-400 hidden md:block" />
                      </div>

                      {/* Budget Replacement */}
                      <div className="md:col-span-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={swap.swap_card.image_uri}
                            alt={swap.swap_card.name}
                            className="w-16 h-22 object-cover rounded-lg border border-white/10 shrink-0"
                          />
                          <div>
                            <span className="text-[10px] text-emerald-400 font-mono font-bold block uppercase">Budget Swap</span>
                            <h4 className="font-cinzel font-bold text-white text-base">{swap.swap_card.name}</h4>
                            <span className="text-xs font-mono text-emerald-400 font-bold block mt-0.5">
                              ${swap.swap_card.price_usd.toFixed(2)}{' '}
                              <span className="text-[10px] text-amber-300 font-semibold">(Save ${swap.dollar_savings.toFixed(2)})</span>
                            </span>
                          </div>
                        </div>

                        <a
                          href={swap.swap_card.tcgplayer_url}
                          target="_blank"
                          rel="noopener noreferrer nofollow sponsored"
                          className="px-3 py-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold rounded-xl border border-amber-500/40 shrink-0 flex items-center gap-1"
                        >
                          Buy <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kept Core Cards Panel */}
            {result.kept_core_cards && result.kept_core_cards.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-white/10">
                <h3 className="font-cinzel text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" /> Preserved Core Cards ({result.kept_core_cards.length})
                </h3>
                <p className="text-xs text-[#8b949e]">
                  These essential high-value cards were preserved because they are core synergy components or have no cheap functional vector substitutes.
                </p>

                <div className="flex flex-wrap gap-2">
                  {result.kept_core_cards.map((c) => (
                    <span
                      key={c.oracle_id}
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-medium flex items-center gap-2"
                    >
                      <span>{c.name}</span>
                      <span className="font-mono text-amber-400 font-bold">${c.price_usd.toFixed(2)}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
