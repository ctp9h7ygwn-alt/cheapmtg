import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/app/components/Footer';
import ClusterNavigation from '../components/ClusterNavigation';
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
  AlertTriangle,
  Flame,
  Droplet,
} from 'lucide-react';

export const revalidate = 86400;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';

export const metadata: Metadata = {
  title: 'Budget Commander Deck Building: How to Build $50 & $100 EDH Decks | MTGCheap',
  description:
    'Complete guide to building powerful, competitive Commander decks on a $50 or $100 budget. Master mana curves, the 10-10-10 template, and budget staple allocation.',
  keywords: [
    'budget commander deck building',
    'how to build a commander deck on a budget',
    '$50 commander deck',
    '$100 commander deck',
    'budget edh guide',
    'cheap commander deckbuilding',
  ],
  alternates: {
    canonical: `${baseUrl}/budget-commander/deck-building`,
  },
  openGraph: {
    title: 'Budget Commander Deck Building Guide ($50 & $100 Decks)',
    description: 'Learn the exact mathematical template to build competitive Commander decks on a budget.',
    url: `${baseUrl}/budget-commander/deck-building`,
  },
};

const TEMPLATE_SLOTS = [
  { role: 'Lands', count: '36 – 38', desc: 'Aim for 75%+ untapped lands using Pain Lands, Check Lands, and Basics.' },
  { role: 'Ramp & Acceleration', count: '10 – 12', desc: 'Focus heavily on 2-CMC mana rocks (Signets, Talismans) and basic land fetchers.' },
  { role: 'Card Advantage & Draw', count: '10 – 12', desc: 'Combine repeatable engine permanents with low-cost burst draw spells.' },
  { role: 'Targeted Removal', count: '8 – 10', desc: 'Instant-speed answers covering creatures, artifacts, and enchantments.' },
  { role: 'Board Wipes', count: '2 – 4', desc: 'Reset buttons including at least one asymmetrical or low-cost sweeper.' },
  { role: 'Commander Synergy & Wincons', count: '25 – 30', desc: 'Core synergistic cards and defined win conditions to close out the game.' },
];

const FAQS = [
  {
    question: 'Can a $50 budget Commander deck beat a $500 deck?',
    answer: 'Yes! Synergy, tight mana curves (average CMC < 3.0), and efficient instant-speed interaction regularly defeat high-dollar good-stuff decks that lack cohesive game plans.',
  },
  {
    question: 'What is the biggest mistake people make in budget Commander?',
    answer: 'Running too many tapped dual lands (Guildgates, gainlands). A deck running 30 basic lands and fast 2-mana ramp will consistently outperform a deck with 15 tapped lands.',
  },
  {
    question: 'How should I allocate budget across a $100 Commander deck?',
    answer: 'Spend ~$15–$20 on the mana base (untapped duals + utility lands), ~$20 on core staples (Sol Ring, Swords to Plowshares, Night’s Whisper, Counterspell), and ~$60 on commander-specific synergy engines.',
  },
];

export default function BudgetDeckBuildingPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to Build a Budget Commander Deck in Magic: The Gathering',
      description: 'A step-by-step guide to building competitive Commander decks under $50 or $100.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Choose a High-Synergy Commander',
          text: 'Select a commander with built-in card advantage, mana reduction, or explosive token generation to carry the deck’s power ceiling.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Construct an Untapped Budget Mana Base',
          text: 'Use Pain Lands, Check Lands, Tango Lands, and Basics to ensure 75%+ of your lands enter untapped.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Integrate the 10-10-10 Package',
          text: 'Add 10-12 ramp spells, 10-12 card draw engines, and 10-12 interaction spells under $1.50 each.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Optimize the Mana Curve',
          text: 'Keep the average converted mana cost below 3.2 to prevent sluggish hands and tempo loss.',
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Budget Commander', item: `${baseUrl}/budget-commander` },
        { '@type': 'ListItem', position: 3, name: 'Deck Building Guide', item: `${baseUrl}/budget-commander/deck-building` },
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 relative z-10">
        <ClusterNavigation currentSlug="deck-building" />

        {/* Hero Section */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <BookOpen className="w-3.5 h-3.5" /> Comprehensive Deckbuilding Guide
          </div>

          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white leading-tight gradient-text-gold">
            Budget Commander Deck Building: How to Build $50 &amp; $100 Decks
          </h1>

          <p className="text-sm sm:text-base text-[#8b949e] leading-relaxed">
            Building on a budget doesn’t mean building weak decks. By focusing on synergy, strict mana curves, and mathematical deck architecture, you can build budget Commander decks that consistently contend with high-power tables.
          </p>

          <div className="flex items-center gap-4 text-xs text-[#8b949e] font-mono border-b border-white/10 pb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> 10 min read
            </span>
            <span>•</span>
            <span>Updated August 2026</span>
          </div>
        </section>

        {/* The 10-10-10-37 Architecture Rule */}
        <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-mono text-amber-400 font-bold uppercase">The Blueprint</div>
            <h2 className="font-cinzel text-2xl font-bold text-white">
              The 10-10-10-37 Budget Deck Template
            </h2>
            <p className="text-xs sm:text-sm text-[#8b949e]">
              A successful Commander deck must function consistently regardless of what order you draw your cards. Here is the mathematical slot distribution:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TEMPLATE_SLOTS.map((slot) => (
              <div key={slot.role} className="bg-[#05070a]/80 p-4 rounded-2xl border border-white/5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-cinzel font-bold text-sm text-white">{slot.role}</span>
                  <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {slot.count} cards
                  </span>
                </div>
                <p className="text-xs text-[#8b949e] leading-relaxed">{slot.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4 Golden Rules of Budget Deckbuilding */}
        <section className="space-y-6">
          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
            4 Golden Rules of Budget EDH
          </h2>

          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
              <h3 className="font-cinzel font-bold text-base text-amber-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1. Keep Your Average Mana Value Under 3.2
              </h3>
              <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed">
                High-dollar decks can afford expensive cards because fast mana (Mana Crypt, Mox Diamond) bails them out. In budget Commander, your mana curve is your speed. Loading up on 1- and 2-mana ramp, draw, and removal guarantees you will cast 2–3 spells per turn cycle in the mid-game.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
              <h3 className="font-cinzel font-bold text-base text-amber-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2. Pick a Commander with Built-in Card Advantage
              </h3>
              <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed">
                Card advantage in the command zone (such as Prosper, Tome-Bound, Tatyova, Benthic Druid, or Feather, the Redeemed) compensates for the lack of $40 staples like Rhystic Study and The One Ring.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
              <h3 className="font-cinzel font-bold text-base text-amber-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 3. Avoid the Tapland Trap
              </h3>
              <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed">
                Playing tapped lands sets your game tempo back by a full turn. Replace Guildgates and Lifelands with Pain Lands (Caves of Koilos, Yavimaya Coast), Check Lands, Tango Lands, and Basic Lands.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
              <h3 className="font-cinzel font-bold text-base text-amber-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 4. Substitute Function, Not Names
              </h3>
              <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed">
                Don’t obsess over owning a specific staple. If you need a board wipe, Blasphemous Act or Day of Judgment will accomplish the exact same game state as a $40 Toxic Deluge for a tiny fraction of the cost.
              </p>
            </div>
          </div>
        </section>

        {/* Deck Budgetizer CTA */}
        <section className="glass-panel rounded-3xl p-8 border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-black to-cyan-500/10 text-center space-y-4">
          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
            Ready to Budgetize Your Deck?
          </h2>
          <p className="text-xs sm:text-sm text-[#8b949e] max-w-xl mx-auto">
            Use MTGCheap’s Deck Budgetizer to import your decklist and instantly swap high-cost cards for vector-ranked budget replacements.
          </p>
          <Link
            href="/deck-budgetizer"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-sm rounded-xl hover:brightness-110 transition-all shadow-lg shadow-amber-500/20"
          >
            Open Deck Budgetizer <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* FAQs */}
        <section className="space-y-4 pt-6 border-t border-white/10">
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
            Deckbuilding Frequently Asked Questions
          </h2>
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
