import Link from 'next/link';
import { ArrowLeft, Sparkles, BookOpen, Layers, ShieldCheck, Zap, Droplet, Flame, Trees, Skull, Sun } from 'lucide-react';

interface Props {
  currentSlug?: string;
}

const CLUSTERS = [
  { slug: '', label: 'Overview' },
  { slug: 'staples', label: 'Staples by Color' },
  { slug: 'deck-building', label: 'Deckbuilding Guide' },
  { slug: 'mana-base', label: 'Mana Base Tool' },
  { slug: 'card-draw', label: 'Card Draw' },
  { slug: 'ramp', label: 'Ramp & Rocks' },
  { slug: 'removal', label: 'Removal' },
  { slug: 'board-wipes', label: 'Board Wipes' },
  { slug: 'protection', label: 'Protection' },
  { slug: 'counterspells', label: 'Counterspells' },
  { slug: 'tutors', label: 'Tutors' },
  { slug: 'lands', label: 'Utility Lands' },
  { slug: 'dual-lands', label: 'Dual Lands' },
  { slug: 'cards-under-1-dollar', label: 'Cards Under $1' },
];

export default function ClusterNavigation({ currentSlug }: Props) {
  return (
    <div className="space-y-4">
      {/* Breadcrumb row */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#8b949e]">
        <Link href="/" className="hover:text-amber-300 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/budget-commander" className="hover:text-amber-300 transition-colors">Budget Commander</Link>
        {currentSlug && (
          <>
            <span>/</span>
            <span className="text-amber-400 capitalize">{currentSlug.replace(/-/g, ' ')}</span>
          </>
        )}
      </div>

      {/* Cluster Pill Bar */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        {CLUSTERS.map((item) => {
          const isActive = (item.slug === '' && !currentSlug) || item.slug === currentSlug;
          const href = item.slug ? `/budget-commander/${item.slug}` : '/budget-commander';
          return (
            <Link
              key={item.slug}
              href={href}
              className={`px-3.5 py-1.5 rounded-full border whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                  : 'bg-white/[0.03] text-[#8b949e] border-white/[0.08] hover:border-white/20 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
