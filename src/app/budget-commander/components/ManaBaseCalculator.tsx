'use client';

import { useState, useMemo } from 'react';
import { generateBudgetManaBase, ManaBaseRecommendation } from '@/lib/topic-clusters-data';
import { Layers, Copy, Check, Sparkles, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

const COLOR_BUTTONS = [
  { id: 'W', label: 'White', bg: 'bg-amber-100/10 text-amber-200 border-amber-300/30' },
  { id: 'U', label: 'Blue', bg: 'bg-blue-500/10 text-blue-300 border-blue-400/30' },
  { id: 'B', label: 'Black', bg: 'bg-purple-500/10 text-purple-300 border-purple-400/30' },
  { id: 'R', label: 'Red', bg: 'bg-red-500/10 text-red-300 border-red-400/30' },
  { id: 'G', label: 'Green', bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30' },
];

const PRESETS = [
  { name: 'Mono-Green', colors: ['G'] },
  { name: 'Dimir (UB)', colors: ['U', 'B'] },
  { name: 'Izzet (UR)', colors: ['U', 'R'] },
  { name: 'Golgari (BG)', colors: ['B', 'G'] },
  { name: 'Boros (WR)', colors: ['W', 'R'] },
  { name: 'Esper (WUB)', colors: ['W', 'U', 'B'] },
  { name: 'Grixis (UBR)', colors: ['U', 'B', 'R'] },
  { name: 'Jund (BRG)', colors: ['B', 'R', 'G'] },
  { name: 'Sultai (UBG)', colors: ['U', 'B', 'G'] },
  { name: 'Jeskai (WUR)', colors: ['W', 'U', 'R'] },
  { name: '5-Color (WUBRG)', colors: ['W', 'U', 'B', 'R', 'G'] },
];

export default function ManaBaseCalculator() {
  const [selectedColors, setSelectedColors] = useState<string[]>(['U', 'B', 'R']); // Default Grixis
  const [copied, setCopied] = useState<boolean>(false);

  const toggleColor = (c: string) => {
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const rec: ManaBaseRecommendation = useMemo(() => {
    return generateBudgetManaBase(selectedColors);
  }, [selectedColors]);

  const totalEstimatedPrice = useMemo(() => {
    let sum = 0;
    rec.dualLands.forEach((d) => (sum += d.price));
    rec.triLands.forEach((t) => (sum += t.price));
    rec.utilityLands.forEach((u) => (sum += u.price));
    return sum;
  }, [rec]);

  const copyDecklist = () => {
    const lines: string[] = [];
    lines.push('// Basic Lands');
    rec.basics.forEach((b) => lines.push(`${b.count} ${b.name}`));
    if (rec.dualLands.length > 0) {
      lines.push('\n// Dual Lands');
      rec.dualLands.forEach((d) => lines.push(`1 ${d.name}`));
    }
    if (rec.triLands.length > 0) {
      lines.push('\n// Tri Lands & Color Fixing');
      rec.triLands.forEach((t) => lines.push(`1 ${t.name}`));
    }
    lines.push('\n// Utility Lands');
    rec.utilityLands.forEach((u) => lines.push(`1 ${u.name}`));

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Interactive Mana Base Recommender
        </div>
        <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
          Generate a Budget Commander Mana Base
        </h2>
        <p className="text-xs sm:text-sm text-[#8b949e]">
          Select your Commander’s color identity to receive an optimized, fast budget mana base recommendation with untapped duals, utility lands, and basic land distribution.
        </p>
      </div>

      {/* Color Selector */}
      <div className="space-y-3 pt-2">
        <div className="text-xs font-mono text-[#8b949e] uppercase font-bold">1. Select Color Identity:</div>
        <div className="flex flex-wrap gap-2.5">
          {COLOR_BUTTONS.map((btn) => {
            const isSelected = selectedColors.includes(btn.id);
            return (
              <button
                key={btn.id}
                onClick={() => toggleColor(btn.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center gap-2 ${
                  isSelected
                    ? `${btn.bg} border-amber-400/80 shadow-md shadow-amber-500/10 scale-105`
                    : 'bg-white/[0.03] text-[#8b949e] border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                <span>{btn.label}</span>
                <span className="font-mono text-[10px] opacity-75">({btn.id})</span>
              </button>
            );
          })}
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[10px] font-mono text-[#8b949e] uppercase">Quick Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setSelectedColors(p.colors)}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.03] text-[#8b949e] border border-white/[0.08] hover:text-amber-300 hover:border-amber-500/30 transition-all"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Recommendation Results */}
      <div className="space-y-6 pt-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#05070a] p-4 rounded-2xl border border-white/10">
          <div>
            <div className="text-xs font-mono text-[#8b949e]">Total Land Count</div>
            <div className="text-xl sm:text-2xl font-cinzel font-black text-white">
              {rec.totalLands} Lands <span className="text-xs font-normal text-[#8b949e]">({rec.colorCount} Colors)</span>
            </div>
            <div className="text-xs text-amber-400 font-mono mt-0.5">
              Est. Nonbasic Package: <strong className="text-emerald-400">${totalEstimatedPrice.toFixed(2)}</strong>
            </div>
          </div>

          <button
            onClick={copyDecklist}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-xs rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied Mana Base!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Land List to Clipboard
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-[#c9d1d9] italic bg-white/[0.02] p-3 rounded-xl border border-white/5">
          💡 {rec.summaryNote}
        </p>

        {/* Land Breakdown Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {/* Column 1: Basic Lands */}
          <div className="space-y-3 bg-[#05070a]/60 p-4 rounded-2xl border border-white/10">
            <div className="font-cinzel font-bold text-sm text-white flex items-center justify-between border-b border-white/10 pb-2">
              <span>Basic Lands</span>
              <span className="font-mono text-amber-400">
                {rec.basics.reduce((acc, b) => acc + b.count, 0)} Total
              </span>
            </div>
            <div className="space-y-2">
              {rec.basics.map((b) => (
                <div key={b.name} className="flex justify-between items-center bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/5">
                  <span className="font-semibold text-white">{b.name}</span>
                  <span className="font-mono text-emerald-400 font-bold">{b.count}x</span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Duals & Multi-Fixing */}
          <div className="space-y-3 bg-[#05070a]/60 p-4 rounded-2xl border border-white/10">
            <div className="font-cinzel font-bold text-sm text-white flex items-center justify-between border-b border-white/10 pb-2">
              <span>Duals &amp; Tri-Lands</span>
              <span className="font-mono text-amber-400">
                {rec.dualLands.length + rec.triLands.length} Total
              </span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {rec.dualLands.map((d) => (
                <div key={d.name} className="flex justify-between items-center bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/5">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white line-clamp-1">{d.name}</div>
                    <div className="text-[10px] text-[#8b949e]">{d.type} {d.entersUntapped && '• Untapped'}</div>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold shrink-0 ml-2">${d.price.toFixed(2)}</span>
                </div>
              ))}
              {rec.triLands.map((t) => (
                <div key={t.name} className="flex justify-between items-center bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/5">
                  <span className="font-semibold text-white line-clamp-1">{t.name}</span>
                  <span className="font-mono text-emerald-400 font-bold shrink-0 ml-2">${t.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Utility Lands */}
          <div className="space-y-3 bg-[#05070a]/60 p-4 rounded-2xl border border-white/10">
            <div className="font-cinzel font-bold text-sm text-white flex items-center justify-between border-b border-white/10 pb-2">
              <span>Utility &amp; Fixing Lands</span>
              <span className="font-mono text-amber-400">{rec.utilityLands.length} Total</span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {rec.utilityLands.map((u) => (
                <div key={u.name} className="flex justify-between items-center bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/5">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white line-clamp-1">{u.name}</div>
                    <div className="text-[10px] text-[#8b949e] line-clamp-1">{u.role}</div>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold shrink-0 ml-2">${u.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
