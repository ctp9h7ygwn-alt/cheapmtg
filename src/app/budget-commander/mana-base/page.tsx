import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/app/components/Footer';
import ClusterNavigation from '../components/ClusterNavigation';
import ManaBaseCalculator from '../components/ManaBaseCalculator';
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
  title: 'Budget Commander Mana Base Guide (Interactive Land Generator) | MTGCheap',
  description:
    'Build fast, consistent budget Commander mana bases for 1, 2, 3, 4, and 5-color decks. Interactive land calculator, untapped dual land rankings, and budget fixing under $20.',
  keywords: [
    'budget commander mana base',
    'cheap commander mana base',
    'budget mana fixing commander',
    'budget 3 color mana base commander',
    'budget 4 color mana base commander',
    'budget 5 color mana base commander',
    'cheap lands that enter untapped commander',
  ],
  alternates: {
    canonical: `${baseUrl}/budget-commander/mana-base`,
  },
  openGraph: {
    title: 'Budget Commander Mana Base Guide & Interactive Calculator',
    description: 'Generate fast, untapped budget mana bases for 1, 2, 3, 4, and 5-color EDH decks under $20.',
    url: `${baseUrl}/budget-commander/mana-base`,
  },
};

const LAND_CYCLES = [
  {
    name: 'Pain Lands',
    price: '$0.40 – $1.00',
    speed: '100% Untapped',
    desc: 'Enter untapped unconditionally on turn 1. Tap for colorless mana with no pain, or colored mana for 1 damage.',
    examples: 'Caves of Koilos, Yavimaya Coast, Shivan Reef, Llanowar Wastes, Sulfurous Springs',
  },
  {
    name: 'Tango / Battle Lands',
    price: '$0.30 – $0.60',
    speed: 'Untapped Turn 3+',
    desc: 'Enter untapped if you control two or more basic lands. Have basic land types for searchability.',
    examples: 'Prairie Stream, Sunken Hollow, Smoldering Marsh, Cinder Glade, Canopy Vista',
  },
  {
    name: 'Check Lands',
    price: '$1.00 – $2.00',
    speed: 'Untapped Turn 2+',
    desc: 'Enter untapped if you control a matching basic land type. Incredible reliability in 2- and 3-color decks.',
    examples: 'Glacial Fortress, Drowned Catacomb, Dragonskull Summit, Rootbound Crag, Sunpetal Grove',
  },
  {
    name: 'Bounce Lands',
    price: '$0.25 – $0.40',
    speed: 'Enters Tapped (Card Advantage)',
    desc: 'Taps for 2 mana and returns a land to hand, effectively ensuring you never miss a land drop.',
    examples: 'Azorius Chancery, Dimir Aqueduct, Rakdos Carnarium, Simic Growth Chamber, Boros Garrison',
  },
];

const FAQS = [
  {
    question: 'How do you build a budget 3-color Commander mana base?',
    answer: 'Run 12–14 basic lands, 3 Pain Lands, 3 Check Lands, 3 Tango/Snarl lands, 3 Bounce Lands, Command Tower, Exotic Orchard, Path of Ancestry, and 2–3 utility lands. This guarantees 75%+ untapped land drops for under $15 total.',
  },
  {
    question: 'Are Guildgates and Lifelands worth running?',
    answer: 'Generally no (unless playing a Gate-tribal strategy like Maze’s End). Unconditional taplands cost you an entire turn of tempo. Basic lands with 2-mana rock ramp are vastly superior.',
  },
  {
    question: 'How many lands should a budget Commander deck have?',
    answer: 'Between 36 and 38 lands, paired with 10 to 12 ramp spells. This ensures an 85%+ probability of hitting your first 4 land drops on curve.',
  },
];

export default function ManaBaseGuidePage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Budget Commander Mana Base Guide: How to Fix Colors Under $20',
      description: 'Comprehensive guide and interactive calculator to build fast, untapped budget Commander mana bases.',
      author: { '@type': 'Organization', name: 'MTGCheap Data Lab' },
      publisher: { '@type': 'Organization', name: 'MTGCheap' },
      datePublished: '2026-08-01',
      dateModified: new Date().toISOString().split('T')[0],
      mainEntityOfPage: `${baseUrl}/budget-commander/mana-base`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Budget Commander', item: `${baseUrl}/budget-commander` },
        { '@type': 'ListItem', position: 3, name: 'Mana Base Tool', item: `${baseUrl}/budget-commander/mana-base` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-[#f0f6fc] relative selection:bg-amber-500/30 selection:text-amber-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
        <ClusterNavigation currentSlug="mana-base" />

        {/* Hero Section */}
        <section className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <Layers className="w-3.5 h-3.5" /> Mana Base Architecture
          </div>

          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white leading-tight gradient-text-gold">
            Budget Commander Mana Base Guide
          </h1>

          <p className="text-sm sm:text-base text-[#8b949e] leading-relaxed">
            You don’t need $400 Original Dual Lands or $25 Fetchlands to build a fast, consistent Commander mana base. Learn how to fix colors across 2, 3, 4, and 5-color decks for under $20 total.
          </p>

          <div className="flex items-center gap-4 text-xs text-[#8b949e] font-mono border-b border-white/10 pb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> 7 min read
            </span>
            <span>•</span>
            <span>Interactive Generator Included</span>
          </div>
        </section>

        {/* Interactive Mana Base Generator */}
        <section className="space-y-6">
          <ManaBaseCalculator />
        </section>

        {/* Land Cycle Breakdown */}
        <section className="space-y-6 pt-6 border-t border-white/10">
          <div className="space-y-1">
            <h2 className="font-cinzel text-2xl font-bold text-white">
              The 4 Best Budget Dual Land Cycles
            </h2>
            <p className="text-xs text-[#8b949e]">
              Prioritize these land cycles to maximize untapped speed on a budget:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {LAND_CYCLES.map((cycle) => (
              <div key={cycle.name} className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-cinzel font-bold text-lg text-white">{cycle.name}</h3>
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {cycle.price}
                  </span>
                </div>
                <div className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Speed: {cycle.speed}
                </div>
                <p className="text-xs text-[#8b949e] leading-relaxed">{cycle.desc}</p>
                <div className="pt-2 border-t border-white/5 text-[11px] text-[#c9d1d9]">
                  <strong className="text-white">Examples:</strong> {cycle.examples}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-4 pt-6 border-t border-white/10 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="font-cinzel text-2xl font-bold text-white">
              Mana Base Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#8b949e]">Common questions regarding budget mana fixing in EDH.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all group"
              >
                <summary className="w-full px-6 py-4 text-left flex items-center justify-between text-white font-bold text-sm sm:text-base hover:text-amber-300 transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <span className="text-amber-400 font-mono text-lg shrink-0 ml-4 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-4 text-xs sm:text-sm text-[#8b949e] leading-relaxed border-t border-white/5 pt-3">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
