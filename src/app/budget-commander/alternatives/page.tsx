import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/app/components/Footer';
import ClusterNavigation from '../components/ClusterNavigation';
import SwapEngine from '@/app/components/SwapEngine';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  TrendingDown,
  Layers,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const revalidate = 86400;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';

export const metadata: Metadata = {
  title: 'Cheap Alternatives to Expensive MTG Cards (Functional Replacements) | MTGCheap',
  description:
    'Find cheap alternatives to expensive Magic: The Gathering cards. Search cards like Cyclonic Rift, The One Ring, and Rhystic Study using 384-dimensional vector embeddings.',
  keywords: [
    'cheap alternatives to expensive mtg cards',
    'mtg budget alternatives',
    'mtg card alternatives',
    'cards like another card mtg',
    'cheap cards that do the same thing',
    'mtg functional replacements',
    'commander card replacements',
  ],
  alternates: {
    canonical: `${baseUrl}/budget-commander/alternatives`,
  },
  openGraph: {
    title: 'Cheap Alternatives to Expensive MTG Cards (Functional Vector Replacements)',
    description: 'Find budget cards that do the exact same thing as expensive staples in Commander & Modern.',
    url: `${baseUrl}/budget-commander/alternatives`,
  },
};

const POPULAR_SWAPS = [
  {
    expensive: 'Rhystic Study',
    price: 42.0,
    cheap: 'Unifying Theory / Soul Barrier',
    cheapPrice: 0.44,
    similarity: '94%',
    slug: 'budget-options-for-rhystic-study',
  },
  {
    expensive: 'The One Ring',
    price: 105.0,
    cheap: 'Loreseeker\'s Stone / Staff of Compleation',
    cheapPrice: 0.28,
    similarity: '91%',
    slug: 'budget-options-for-the-one-ring',
  },
  {
    expensive: 'Cyclonic Rift',
    price: 38.0,
    cheap: 'Evacuation / Aetherize / Wash Out',
    cheapPrice: 0.55,
    similarity: '89%',
    slug: 'budget-options-for-cyclonic-rift',
  },
  {
    expensive: 'Teferi\'s Protection',
    price: 38.0,
    cheap: 'Clever Concealment / Guardian of Faith',
    cheapPrice: 2.00,
    similarity: '92%',
    slug: 'budget-options-for-teferis-protection',
  },
  {
    expensive: 'Demonic Tutor',
    price: 42.0,
    cheap: 'Wishclaw Talisman / Profane Tutor',
    cheapPrice: 2.50,
    similarity: '95%',
    slug: 'budget-options-for-demonic-tutor',
  },
  {
    expensive: 'Force of Will',
    price: 65.0,
    cheap: 'Misdirection / Foil / Delay',
    cheapPrice: 1.20,
    similarity: '88%',
    slug: 'budget-options-for-force-of-will',
  },
];

export default function AlternativesHubPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Cheap Alternatives to Expensive MTG Cards: The Functional Replacement Guide',
      description: 'How to discover budget cards that fill the exact same functional role in MTG.',
      author: { '@type': 'Organization', name: 'MTGCheap Data Lab' },
      publisher: { '@type': 'Organization', name: 'MTGCheap' },
      datePublished: '2026-08-01',
      dateModified: new Date().toISOString().split('T')[0],
      mainEntityOfPage: `${baseUrl}/budget-commander/alternatives`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Budget Commander', item: `${baseUrl}/budget-commander` },
        { '@type': 'ListItem', position: 3, name: 'Alternatives Guide', item: `${baseUrl}/budget-commander/alternatives` },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-[#f0f6fc] relative selection:bg-amber-500/30 selection:text-amber-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#05070a]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <img src="/logo.png" alt="MTGCheap Logo" className="h-10 sm:h-14 w-auto object-contain" />
          </Link>

          <nav className="flex items-center gap-3 sm:gap-6 text-xs font-semibold">
            <Link href="/" className="text-[#8b949e] hover:text-white transition-colors">
              Swap Engine
            </Link>
            <Link href="/deck-budgetizer" className="text-[#8b949e] hover:text-white transition-colors flex items-center gap-1.5">
              Deck Budgetizer
              <span className="px-1.5 py-0.5 text-[10px] font-extrabold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md tracking-wider">
                BETA
              </span>
            </Link>
            <Link href="/budget-commander" className="text-amber-400 font-bold border-b border-amber-400 pb-0.5">
              Budget Hub
            </Link>
            <Link href="/articles" className="text-[#8b949e] hover:text-white transition-colors">
              Card Articles
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 relative z-10">
        <ClusterNavigation currentSlug="alternatives" />

        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Vector Similarity Engine
          </div>

          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white leading-tight gradient-text-gold">
            Cheap Alternatives to Expensive MTG Cards
          </h1>

          <p className="text-sm sm:text-base text-[#8b949e] leading-relaxed">
            Never let a $50 price tag stop you from playing Magic. MTGCheap analyzes rules text, mana curves, and oracle mechanics across 384 dimensions to discover budget cards that perform the exact same job.
          </p>
        </section>

        {/* Embedded Interactive Swap Search */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
              Instant Card Alternative Search
            </h2>
            <p className="text-xs text-[#8b949e]">Type any expensive Magic card to see ranked budget substitutes:</p>
          </div>
          <SwapEngine />
        </section>

        {/* Popular Staple Replacements Table */}
        <section className="space-y-6 pt-6 border-t border-white/10">
          <div className="space-y-1">
            <h2 className="font-cinzel text-2xl font-bold text-white">
              Popular Commander Card Replacements
            </h2>
            <p className="text-xs text-[#8b949e]">
              Examples of vector-matched budget replacements providing 90%+ mechanical similarity for under $3.00:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {POPULAR_SWAPS.map((swap) => (
              <Link
                key={swap.slug}
                href={`/articles/${swap.slug}`}
                className="glass-card rounded-2xl p-5 border border-white/10 hover:border-amber-500/40 hover:-translate-y-1 transition-all space-y-3 group"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-mono text-red-400 uppercase font-bold">Expensive Card</div>
                    <div className="font-cinzel font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                      {swap.expensive}
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    ${swap.price.toFixed(0)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Budget Swap</span>
                    <span className="font-mono text-xs font-black text-emerald-400">${swap.cheapPrice.toFixed(2)}</span>
                  </div>
                  <div className="text-xs font-semibold text-white line-clamp-1">{swap.cheap}</div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-300">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> {swap.similarity} Vector Match
                  </div>
                </div>

                <div className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Full Swap Breakdown <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
