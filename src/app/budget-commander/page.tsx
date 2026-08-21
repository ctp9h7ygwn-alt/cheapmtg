import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '../components/Footer';
import ClusterNavigation from './components/ClusterNavigation';
import ManaBaseCalculator from './components/ManaBaseCalculator';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  Layers,
  TrendingDown,
  ExternalLink,
  Flame,
  Droplet,
  Compass,
} from 'lucide-react';

export const revalidate = 86400;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';

export const metadata: Metadata = {
  title: 'Budget Commander: Complete MTG EDH Guides & Cheap Staples Hub | MTGCheap',
  description:
    'The ultimate budget Commander resource. Explore curated budget staples by role (Card Draw, Ramp, Removal, Board Wipes, Mana Bases) and discover vector-matched cheap card alternatives.',
  keywords: [
    'budget commander cards',
    'best budget commander staples',
    'cheap commander cards',
    'how to build a commander deck on a budget',
    'mtg budget alternatives',
    'cheap commander staples',
    'edh budget deck building',
  ],
  alternates: {
    canonical: `${baseUrl}/budget-commander`,
  },
  openGraph: {
    title: 'Budget Commander Hub: Guides, Cheap Staples & Mana Bases',
    description: 'Explore curated budget staples by role, interactive mana base tools, and vector-matched card alternatives for EDH.',
    url: `${baseUrl}/budget-commander`,
  },
};

const CATEGORIES = [
  {
    title: 'Budget Staples by Color',
    slug: 'staples',
    desc: 'The best cheap staples across White, Blue, Black, Red, Green, and Colorless for under $2.',
    badge: 'Core Staples',
    icon: Sparkles,
    color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30',
  },
  {
    title: 'Budget Deckbuilding Guide',
    slug: 'deck-building',
    desc: 'Step-by-step methodology for building powerful $50 and $100 Commander decks that compete with high-power pods.',
    badge: 'Strategy Guide',
    icon: BookOpen,
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
  },
  {
    title: 'Interactive Mana Base Tool',
    slug: 'mana-base',
    desc: 'Select your Commander’s color identity to generate a fast, optimized budget mana base with untapped duals.',
    badge: 'Interactive Tool',
    icon: Layers,
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
  },
  {
    title: 'Budget Card Draw',
    slug: 'card-draw',
    desc: 'Never run out of gas. Burst draw, repeatable engines, and loot effects under $2.',
    badge: 'Card Advantage',
    icon: Droplet,
    color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30',
  },
  {
    title: 'Budget Ramp & Mana Rocks',
    slug: 'ramp',
    desc: 'Cheap 2-mana rocks, basic land fetchers, and mana dorks under $1.50.',
    badge: 'Mana Acceleration',
    icon: Zap,
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
  },
  {
    title: 'Budget Targeted Removal',
    slug: 'removal',
    desc: 'Instant-speed spot removal, exile effects, and flexible answers to problem permanents.',
    badge: 'Interaction',
    icon: Flame,
    color: 'from-red-500/20 to-rose-500/10 border-red-500/30',
  },
  {
    title: 'Budget Board Wipes',
    slug: 'board-wipes',
    desc: 'Reset runaway boards without $40 sweepers. Inexpensive creature and permanent resets.',
    badge: 'Mass Removal',
    icon: ShieldCheck,
    color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30',
  },
  {
    title: 'Budget Protection Spells',
    slug: 'protection',
    desc: 'Hexproof, indestructible, flicker, and phasing spells to keep your commander alive.',
    badge: 'Board Shielding',
    icon: ShieldCheck,
    color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/30',
  },
  {
    title: 'Budget Counterspells',
    slug: 'counterspells',
    desc: 'Hard counters, tactical 1-mana answers, and surprise off-color counter magic under $1.',
    badge: 'Stack Control',
    icon: Droplet,
    color: 'from-sky-500/20 to-cyan-500/10 border-sky-500/30',
  },
  {
    title: 'Budget Tutors & Search',
    slug: 'tutors',
    desc: 'Transmute cards, type-specific tutors, and consistency helpers under $2.50.',
    badge: 'Consistency',
    icon: Compass,
    color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30',
  },
  {
    title: 'Cheap Dual Lands',
    slug: 'dual-lands',
    desc: 'Rankings of Pain Lands, Check Lands, Tango Lands, and Bounce Lands by speed and cost.',
    badge: 'Mana Fixing',
    icon: Layers,
    color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
  },
  {
    title: 'Cards Under $1.00',
    slug: 'cards-under-1-dollar',
    desc: 'The best budget cards under $1 across every functional role and color in Magic.',
    badge: 'Ultra Budget',
    icon: TrendingDown,
    color: 'from-emerald-500/20 to-green-500/10 border-emerald-500/30',
  },
];

const FAQS = [
  {
    question: 'How do you build a competitive Commander deck on a budget?',
    answer: 'Focus on low mana curves, high-efficiency 1–2 CMC interaction, consistent 2-mana ramp, and synergy engines that multiply the commander’s strategy rather than relying on high-priced standalone staples.',
  },
  {
    question: 'What is MTGCheap’s functional topic cluster system?',
    answer: 'Instead of searching through random card lists, MTGCheap organizes Magic cards by their true functional game role using 384-dimensional vector embeddings and Scryfall oracle tags. This allows you to find exact replacements for expensive cards under $1–$2.',
  },
  {
    question: 'Can budget mana bases keep up with fetch lands and shock lands?',
    answer: 'Yes! By leveraging fast untapped Pain Lands ($0.50), Check Lands ($1.50), Tango Lands ($0.40), and all-color staples like Command Tower and Exotic Orchard, budget 2- and 3-color mana bases enter untapped over 80% of the time for less than $20 total.',
  },
];

export default function BudgetCommanderHubPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Budget Commander Strategy & Category Hub',
      description: 'Comprehensive guide to building powerful MTG Commander decks on a budget.',
      url: `${baseUrl}/budget-commander`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Budget Commander', item: `${baseUrl}/budget-commander` },
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
        <ClusterNavigation />

        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" /> MTG EDH Budget Architecture
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white leading-tight gradient-text-gold">
            Budget Commander Strategy Hub
          </h1>
          <p className="text-sm sm:text-base text-[#8b949e] leading-relaxed">
            Build powerful, optimized Commander decks without overspending. Explore vector-analyzed budget staples by role, generate budget mana bases, and find cheap alternatives to expensive cards.
          </p>
        </section>

        {/* Category Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-cinzel text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" /> Explore Topic Clusters by Role
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/budget-commander/${cat.slug}`}
                  className="glass-card rounded-3xl p-6 border border-white/10 hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 space-y-4 group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${cat.color} border`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-[#8b949e] border border-white/10">
                        {cat.badge}
                      </span>
                    </div>

                    <h3 className="font-cinzel font-bold text-xl text-white group-hover:text-amber-300 transition-colors">
                      {cat.title}
                    </h3>

                    <p className="text-xs text-[#8b949e] leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="pt-2 text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore Hub <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Embedded Interactive Mana Base Tool */}
        <section className="space-y-6 pt-6 border-t border-white/10">
          <ManaBaseCalculator />
        </section>

        {/* Deck Budgetizer Promo Banner */}
        <section className="glass-panel rounded-3xl p-8 border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-black to-cyan-500/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-xs font-mono uppercase font-extrabold text-amber-400">Automated Swaps</span>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
              Have an entire decklist to budgetize?
            </h2>
            <p className="text-xs sm:text-sm text-[#8b949e]">
              Paste your Moxfield, Archidekt, or text decklist into our AI Deck Budgetizer. It swaps high-priced generic staples for vector-matched budget alternatives while preserving your core combo pieces.
            </p>
          </div>

          <Link
            href="/deck-budgetizer"
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-sm rounded-2xl hover:brightness-110 transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-amber-500/20"
          >
            Launch Deck Budgetizer <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* FAQs */}
        <section className="space-y-6 pt-6 border-t border-white/10 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
              Budget Commander Deckbuilding FAQs
            </h2>
            <p className="text-xs text-[#8b949e]">
              Common questions about building powerful EDH decks on a budget.
            </p>
          </div>

          <div className="space-y-4">
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
