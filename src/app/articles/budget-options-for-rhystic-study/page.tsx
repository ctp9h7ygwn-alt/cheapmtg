import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, Clock, Tag, ExternalLink, ShieldCheck, CheckCircle2, TrendingDown, BookOpen, ShieldAlert } from 'lucide-react';
import Footer from '../../components/Footer';
import ExpandableCardImage from '../../components/ExpandableCardImage';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';
const canonicalUrl = `${baseUrl}/articles/budget-options-for-rhystic-study`;

export const metadata: Metadata = {
  title: 'Top 5 Budget Alternatives to Rhystic Study in Commander (EDH)',
  description:
    'Looking for cheap budget replacements for Rhystic Study in MTG Commander? Compare vector-analyzed cards like Unifying Theory, Soul Barrier, and Insight to save over $70.',
  keywords: [
    'budget rhystic study',
    'rhystic study alternatives',
    'cheap card draw edh',
    'mtg commander budget swaps',
    'unifying theory mtg',
    'soul barrier mtg',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: 'Top 5 Budget Alternatives to Rhystic Study in Commander',
    description: 'Save over $70 with vector-matched functional replacements for Rhystic Study.',
    type: 'article',
    url: canonicalUrl,
    images: [{ url: 'https://cards.scryfall.io/normal/front/9/f/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b.jpg?1783919146' }],
  },
};

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Top 5 Budget Alternatives to Rhystic Study in Commander (EDH)',
    description: 'Vector-matched functional budget alternatives to Rhystic Study in Magic: The Gathering.',
    author: { '@type': 'Organization', name: 'MTGCheap Data Lab' },
    publisher: { '@type': 'Organization', name: 'MTGCheap' },
    datePublished: '2026-08-03',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntityOfPage: canonicalUrl,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Articles',
        item: `${baseUrl}/articles`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Rhystic Study Budget Alternatives',
        item: canonicalUrl,
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the cheapest budget replacement for Rhystic Study?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Unifying Theory ($0.44) and Soul Barrier ($0.25) are the top budget replacements for Rhystic Study, delivering spell taxation and card draw for under $1.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why is Rhystic Study so expensive in EDH?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Rhystic Study costs over $45 due to high Commander demand and unique tax-based card draw mechanics.',
        },
      },
    ],
  },
];

const SWAPS = [
  {
    name: 'Unifying Theory',
    price: '$0.44',
    type: 'Enchantment (2 CMC)',
    text: 'Whenever a player casts a spell, that player may pay {2}. If the player does, they draw a card.',
    match: '95% Vector Match',
    whySimilar: "Matches Rhystic Study's Blue Enchantment spell-taxation and card-draw mechanic, but costs 1 less mana to cast (2 CMC vs 3 CMC).",
    whyNotPerfect: "Symmetrical effect: allows opponents to draw cards when they pay {2}, whereas Rhystic Study only rewards you.",
    sharedTags: ['#cast-tax', '#repeatable-pure-draw'],
    tcgUrl: 'https://www.tcgplayer.com/search/magic/product?q=Unifying%20Theory&utm_source=cheapmtg',
    manaPoolUrl: 'https://manapool.com/cards?q=Unifying%20Theory&ref=cheapmtg',
  },
  {
    name: 'Soul Barrier',
    price: '$0.25',
    type: 'Enchantment (3 CMC)',
    text: 'Whenever an opponent casts a creature spell, this enchantment deals 2 damage to that player unless they pay {2}.',
    match: '84% Vector Match',
    whySimilar: "Shares Rhystic Study's 3 CMC Blue Enchantment cast-taxation mechanic ({2} tax per opponent cast).",
    whyNotPerfect: "Deals 2 damage to opponents instead of drawing you a card, and triggers only on creature spells.",
    sharedTags: ['#cast-tax', '#cast-trigger-other', '#rhystic'],
    tcgUrl: 'https://www.tcgplayer.com/search/magic/product?q=Soul%20Barrier&utm_source=cheapmtg',
    manaPoolUrl: 'https://manapool.com/cards?q=Soul%20Barrier&ref=cheapmtg',
  },
  {
    name: 'Idle Thoughts',
    price: '$0.12',
    type: 'Enchantment (4 CMC)',
    text: '{2}: Draw a card if you have no cards in hand.',
    match: '87% Vector Match',
    whySimilar: "Blue Enchantment delivering repeatable card draw in budget Commander decks.",
    whyNotPerfect: "Requires 4 CMC to cast plus {2} mana activation investment, and requires an empty hand.",
    sharedTags: ['#repeatable-pure-draw'],
    tcgUrl: 'https://www.tcgplayer.com/search/magic/product?q=Idle%20Thoughts&utm_source=cheapmtg',
    manaPoolUrl: 'https://manapool.com/cards?q=Idle%20Thoughts&ref=cheapmtg',
  },
];

export default function RhysticStudyArticlePage() {
  return (
    <div className="min-h-screen bg-[#05070a] text-[#f0f6fc] relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#05070a]/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="MTGCheap Logo" className="h-14 sm:h-16 w-auto object-contain" />
          </Link>

          <nav className="flex items-center gap-6 text-xs font-semibold">
            <Link href="/" className="text-[#8b949e] hover:text-white transition-colors">
              Swap Engine
            </Link>
            <Link href="/articles" className="text-amber-400 font-bold">
              Articles
            </Link>
          </nav>
        </div>
      </header>

      {/* Article Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 relative z-10">
        {/* Article Breadcrumb & Title */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-[#8b949e] font-mono">
            <Link href="/articles" className="hover:text-amber-300">Articles</Link>
            <span>/</span>
            <span className="text-amber-400">Commander Staples</span>
          </div>

          <h1 className="font-cinzel text-3xl sm:text-4xl font-black text-white leading-tight gradient-text-gold">
            Top Budget Alternatives to Rhystic Study in Commander
          </h1>

          <div className="flex items-center gap-4 text-xs text-[#8b949e] font-mono border-b border-white/10 pb-6">
            <span>By MTGCheap Data Lab</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> 6 min read
            </span>
            <span>•</span>
            <span>Updated August 3, 2026</span>
          </div>
        </div>

        {/* Target Card Highlight */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col md:flex-row gap-6 items-center">
          <ExpandableCardImage
            src="https://cards.scryfall.io/normal/front/9/f/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b.jpg?1783919146"
            alt="Rhystic Study Magic: The Gathering card"
            title="Rhystic Study"
            sizes="160px"
            className="w-40 shrink-0 aspect-[488/680] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#090d16]"
          />

          <div className="space-y-3 flex-1 text-xs">
            <div className="flex justify-between items-baseline">
              <h2 className="font-cinzel text-xl font-bold text-white">Rhystic Study</h2>
              <span className="font-mono text-lg font-black text-amber-400">$70.78 Market</span>
            </div>
            <p className="text-[#8b949e]">
              <strong className="text-white">Why it&apos;s expensive:</strong> Rhystic Study is widely regarded as the single most powerful passive card draw engine in Commander. Opponents must pay {1} for every spell they cast, or feed you cards. However, paying over $70 for a single piece of cardboard is out of reach for budget-conscious deck builders.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                #cast-tax
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                #repeatable-pure-draw
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                #rhystic
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <section className="space-y-6 text-sm text-[#c9d1d9] leading-relaxed">
          <h2 className="font-cinzel text-2xl font-bold text-white border-b border-white/10 pb-3">
            How Vector Embeddings Find Functional Replacements
          </h2>
          <p>
            Using 384-dimensional dense vector embeddings (`Xenova/all-MiniLM-L6-v2`) and Scryfall Oracle tag matching, our database maps the semantic mechanical functionality of MTG cards. Instead of searching purely by name, the vector engine analyzes card text, mana taxation, and triggers.
          </p>

          <h2 className="font-cinzel text-2xl font-bold text-white border-b border-white/10 pb-3 pt-4">
            Top Vector-Ranked Budget Swaps
          </h2>

          <div className="space-y-6">
            {SWAPS.map((swap, idx) => (
              <div key={swap.name} className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <span className="text-xs font-mono text-amber-400 font-bold mr-2">#{idx + 1} Alternative</span>
                    <h3 className="font-cinzel text-xl font-bold text-white inline">{swap.name}</h3>
                    <span className="text-xs text-[#8b949e] ml-2">({swap.type})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-extrabold text-emerald-400">{swap.price}</span>
                  </div>
                </div>

                <p className="bg-[#05070a]/80 p-3.5 rounded-xl border border-white/10 italic text-xs leading-relaxed text-[#f0f6fc]">
                  {swap.text}
                </p>

                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl space-y-1">
                  <div className="text-[11px] font-bold text-emerald-300 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Why It&apos;s Similar
                  </div>
                  <p className="text-xs text-[#c9d1d9] leading-relaxed">
                    {swap.whySimilar}
                  </p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl space-y-1">
                  <div className="text-[11px] font-bold text-amber-300 font-mono flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Why It Isn&apos;t A Perfect Replacement (Trade-offs)
                  </div>
                  <p className="text-xs text-[#c9d1d9] leading-relaxed">
                    {swap.whyNotPerfect}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    {swap.sharedTags.map((t) => (
                      <span key={t} className="px-2.5 py-0.5 rounded-md font-mono text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <a href={swap.tcgUrl} target="_blank" rel="noopener noreferrer nofollow sponsored" className="px-3 py-1.5 bg-amber-500 text-black font-extrabold text-xs rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1">
                      Buy TCGplayer <ExternalLink className="w-3 h-3" />
                    </a>
                    <a href={swap.manaPoolUrl} target="_blank" rel="noopener noreferrer nofollow sponsored" className="px-3 py-1.5 bg-white/5 text-white font-semibold text-xs rounded-lg border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-1">
                      Mana Pool <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Crawlable Backlinks Section: Similar Expensive Cards to Replace */}
        <section className="space-y-6 pt-6 border-t border-white/10">
          <h2 className="font-cinzel text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" /> Similar Expensive Staples to Replace
          </h2>
          <p className="text-xs text-[#8b949e]">
            Looking to budget-proof your Commander deck? Check out our strategy guides for other high-value cards:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <Link
              href="/articles/budget-options-for-the-one-ring"
              className="glass-card rounded-2xl p-4 border border-white/10 hover:border-amber-500/50 hover:-translate-y-1 transition-all group space-y-2"
            >
              <div className="font-cinzel font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                The One Ring
              </div>
              <div className="text-[10px] text-[#8b949e] font-mono">$105.88 Market</div>
              <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                View Budget Swaps <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
            <Link
              href="/articles/budget-options-for-cyclonic-rift"
              className="glass-card rounded-2xl p-4 border border-white/10 hover:border-amber-500/50 hover:-translate-y-1 transition-all group space-y-2"
            >
              <div className="font-cinzel font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                Cyclonic Rift
              </div>
              <div className="text-[10px] text-[#8b949e] font-mono">$38.00 Market</div>
              <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                View Budget Swaps <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
            <Link
              href="/articles/budget-options-for-fierce-guardianship"
              className="glass-card rounded-2xl p-4 border border-white/10 hover:border-amber-500/50 hover:-translate-y-1 transition-all group space-y-2"
            >
              <div className="font-cinzel font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                Fierce Guardianship
              </div>
              <div className="text-[10px] text-[#8b949e] font-mono">$42.00 Market</div>
              <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                View Budget Swaps <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </div>
        </section>

        {/* Live Interactive Call to Action */}
        <section className="glass-panel rounded-3xl p-8 border border-white/10 text-center space-y-4">
          <h3 className="font-cinzel text-2xl font-bold text-white">Test Rhystic Study Swaps Live in the Engine</h3>
          <p className="text-xs text-[#8b949e] max-w-lg mx-auto">
            Use our local PostgreSQL pgvector engine to filter by custom price ceilings, strict card type matching, and color identity.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold text-sm rounded-xl shadow-xl hover:brightness-110 transition-all"
          >
            Check out our Swap Engine <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
