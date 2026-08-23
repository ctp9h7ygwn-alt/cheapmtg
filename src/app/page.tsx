import Link from 'next/link';
import {
  TrendingDown,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import SwapEngine from './components/SwapEngine';
import Footer from './components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';

const FAQ_ITEMS = [
  {
    question: 'What is MTGCheap?',
    answer: 'MTGCheap is a budget card swap engine for Magic: The Gathering. It analyzes expensive tournament and Commander staples and retrieves contextually accurate, lower-cost functional replacements to help players build powerful budget decks.',
  },
  {
    question: 'How does MTGCheap calculate card similarity?',
    answer: 'Instead of basic keyword searching, MTGCheap evaluates cards across 384 vector dimensions and functional Scryfall oracle tags. It analyzes rules text, mana value, color identity, and game roles to find budget cards that fill the exact same strategic purpose.',
  },
  {
    question: 'Are Un-sets or silver-bordered cards excluded by default?',
    answer: 'Yes. By default, MTGCheap excludes silver-bordered cards, playtest cards, stickers, attractions, and un-cards. You can toggle Un-sets ON or OFF in the filter settings if you play casual house-rule formats.',
  },
  {
    question: 'How does the Commander Deck Budgetizer work?',
    answer: 'The Deck Budgetizer lets you paste a Moxfield URL, Archidekt link, or text decklist, set a target budget (e.g. $50, $100, $200), and automatically swaps high-priced generic staples for budget alternatives while preserving irreplaceable core synergy cards.',
  },
  {
    question: 'Is MTGCheap free to use?',
    answer: 'Yes! MTGCheap is 100% free for all Magic: The Gathering players, deckbuilders, and Commander enthusiasts. With 100% transparency, the only revenue we generate to maintain the database server infrastructure comes from affiliate links when you purchase cards through TCGplayer or Mana Pool.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#05070a] text-[#f0f6fc] relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hardware-Accelerated Ambient Glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle 500px at 20% 0%, rgba(245, 158, 11, 0.07), transparent 70%),
            radial-gradient(circle 500px at 80% 25%, rgba(6, 182, 212, 0.05), transparent 70%),
            radial-gradient(circle 600px at 10% 80%, rgba(139, 92, 246, 0.05), transparent 70%)
          `,
          transform: 'translateZ(0)',
        }}
      />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#05070a]/90 backdrop-blur-md">
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
              <Link href="/budget-commander" className="text-[#8b949e] hover:text-white transition-colors">
                Budget Hub
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
        {/* Server-Rendered SEO Hero */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-2">
          <h1 className="font-cinzel text-3xl sm:text-5xl font-black tracking-wide leading-tight gradient-text-gold">
            Find Budget Alternatives for Magic: The Gathering Cards
          </h1>
          <p className="text-[#8b949e] text-base leading-relaxed max-w-2xl mx-auto">
            Search for budget alternatives to any high-cost Magic card or Commander staple.
          </p>
        </section>

        {/* Client-Side Interactive Swap Engine */}
        <SwapEngine />

        {/* Featured Topic Clusters & Functional Category Guides */}
        <section className="pt-12 border-t border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-cinzel text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" /> Budget Commander Topic Clusters
              </h2>
              <p className="text-xs text-[#8b949e] mt-0.5">
                Explore curated budget staples, interactive mana-base generators, and role-based guides.
              </p>
            </div>
            <Link
              href="/budget-commander"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              Explore Hub Directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            {[
              { name: 'Core Staples', href: '/budget-commander/staples', color: 'text-amber-300' },
              { name: 'Mana Base Tool', href: '/budget-commander/mana-base', color: 'text-emerald-300' },
              { name: 'Deckbuilding Guide', href: '/budget-commander/deck-building', color: 'text-cyan-300' },
              { name: 'Card Draw', href: '/budget-commander/card-draw', color: 'text-blue-300' },
              { name: 'Ramp & Rocks', href: '/budget-commander/ramp', color: 'text-orange-300' },
              { name: 'Removal', href: '/budget-commander/removal', color: 'text-red-300' },
              { name: 'Board Wipes', href: '/budget-commander/board-wipes', color: 'text-purple-300' },
              { name: 'Protection', href: '/budget-commander/protection', color: 'text-teal-300' },
              { name: 'Counterspells', href: '/budget-commander/counterspells', color: 'text-sky-300' },
              { name: 'Tutors', href: '/budget-commander/tutors', color: 'text-violet-300' },
              { name: 'Dual Lands', href: '/budget-commander/dual-lands', color: 'text-yellow-300' },
              { name: 'Cards Under $1', href: '/budget-commander/cards-under-1-dollar', color: 'text-emerald-400' },
            ].map((topic) => (
              <Link
                key={topic.href}
                href={topic.href}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 hover:bg-white/[0.06] transition-all text-center space-y-1 group"
              >
                <div className={`font-bold text-xs ${topic.color} group-hover:scale-105 transition-transform`}>
                  {topic.name}
                </div>
                <div className="text-[10px] text-[#8b949e]">Budget Guide</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured SEO Strategy Articles Section */}
        <section className="pt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-cinzel text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" /> Featured Staple Swap Breakdown Guides
              </h2>
              <p className="text-xs text-[#8b949e] mt-0.5">
                In-depth vector analysis and deckbuilding guides for top Commander staples.
              </p>
            </div>
            <Link
              href="/articles"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              View All 1,500+ Guides <ArrowRight className="w-3.5 h-3.5" />
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
              <h3 className="font-cinzel font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                Top 5 Budget Alternatives to Rhystic Study in Commander
              </h3>
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
              <h3 className="font-cinzel font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                Best Budget Alternatives to The One Ring for EDH
              </h3>
              <p className="text-xs text-[#8b949e] line-clamp-2 leading-relaxed">
                Explore budget replacements like Loreseeker&apos;s Stone ($0.28) and Staff of Compleation ($4.26) for under $5.
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
              Vector Similarity &amp; Functional Oracle Tag Matching
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
              <h3 className="font-cinzel text-lg font-bold text-white">384-Dim Semantic Embeddings</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                We compute 384-dimensional dense semantic vector embeddings for every card using feature extraction. This captures deep strategic relationships across mana costs, rules text, and card categories.
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

        {/* Frequently Asked Questions (FAQ) Section — Server-rendered with native <details> */}
        <section className="pt-12 border-t border-white/10 space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="font-cinzel text-3xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-[#8b949e]">Everything you need to know about MTGCheap and budget card swaps.</p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all group"
              >
                <summary className="w-full px-6 py-4 text-left flex items-center justify-between text-white font-bold text-sm sm:text-base hover:text-amber-300 transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span className="text-amber-400 font-mono text-lg shrink-0 ml-4 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-4 text-xs sm:text-sm text-[#8b949e] leading-relaxed border-t border-white/5 pt-3">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
