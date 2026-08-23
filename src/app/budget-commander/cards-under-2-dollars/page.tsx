import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/app/components/Footer';
import ClusterNavigation from '../components/ClusterNavigation';
import TopicCardExplorer from '../components/TopicCardExplorer';
import { query } from '@/lib/db';
import { ClusterCard } from '@/lib/topic-clusters';
import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  Clock,
  BookOpen,
} from 'lucide-react';

export const revalidate = 86400;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';

export const metadata: Metadata = {
  title: 'Best Commander Cards Under $2 (Top 100 Budget EDH Staples) | MTGCheap',
  description:
    'Browse the top 100 best Commander cards under $2.00 in Magic: The Gathering. High-value staples, efficient card draw, ramp, removal, board wipes, and lands under two dollars.',
  keywords: [
    'best commander cards under 2 dollars',
    'best mtg cards under $2',
    'best budget cards under $2',
    'cheap commander cards under 2 dollars',
    'best cheap cards for commander',
    'edh cards under 2 dollars',
    'commander staples under 2 dollars',
  ],
  alternates: {
    canonical: `${baseUrl}/budget-commander/cards-under-2-dollars`,
  },
  openGraph: {
    title: 'Best Commander Cards Under $2 (Top 100 Budget EDH Staples)',
    description: 'High-power card draw, ramp, removal, and lands for under $2.00.',
    url: `${baseUrl}/budget-commander/cards-under-2-dollars`,
  },
};

async function getCardsUnderTwoDollars(): Promise<ClusterCard[]> {
  try {
    const res = await query(
      `SELECT oracle_id, name, mana_value, type_line, oracle_text, price_usd, image_uri, color_identity, colors,
              ARRAY(
                SELECT ot.tag FROM oracle_tags ot WHERE ot.card_oracle_id = c.oracle_id
              ) as all_tags
       FROM cards c
       WHERE price_usd IS NOT NULL AND price_usd > 0 AND price_usd <= 2.00
         AND COALESCE(is_silver_bordered, FALSE) = FALSE
         AND type_line NOT ILIKE '%Token%'
         AND type_line NOT ILIKE '%Basic Land%'
         AND type_line NOT ILIKE '%Emblem%'
         AND type_line NOT ILIKE '%Art Series%'
         AND (
           EXISTS (
             SELECT 1 FROM oracle_tags ot 
             WHERE ot.card_oracle_id = c.oracle_id 
             AND ot.tag IN ('otag:card-draw', 'otag:ramp-land', 'otag:mana-rock', 'otag:board-wipe', 'otag:removal', 'otag:counterspell', 'otag:protection', 'otag:tutor', 'otag:utility-land')
           )
         )
       ORDER BY 
         c.price_usd DESC
       LIMIT 100`
    );

    return res.rows.map((row: any) => ({
      oracle_id: row.oracle_id,
      name: row.name,
      mana_value: parseFloat(row.mana_value || '0'),
      type_line: row.type_line || '',
      oracle_text: row.oracle_text || '',
      price_usd: parseFloat(row.price_usd),
      image_uri: row.image_uri || '',
      color_identity: row.color_identity || [],
      colors: row.colors || [],
      tags: (row.all_tags || []).map((t: string) => t.replace('otag:', '')),
      tcgplayer_url: `https://www.tcgplayer.com/search/magic/product?q=${encodeURIComponent(row.name)}&utm_source=cheapmtg`,
      manapool_url: `https://manapool.com/cards?q=${encodeURIComponent(row.name)}&ref=cheapmtg`,
    }));
  } catch (err) {
    console.error('Error fetching cards under $2:', err);
    return [];
  }
}

export default async function CardsUnderTwoDollarsPage() {
  const cards = await getCardsUnderTwoDollars();

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Best Commander Cards Under $2.00 (Ranked by Role & Power)',
      description: 'The definitive list of high-power Commander staples under two dollars.',
      author: { '@type': 'Organization', name: 'MTGCheap Data Lab' },
      publisher: { '@type': 'Organization', name: 'MTGCheap' },
      datePublished: '2026-08-01',
      dateModified: new Date().toISOString().split('T')[0],
      mainEntityOfPage: `${baseUrl}/budget-commander/cards-under-2-dollars`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Budget Commander', item: `${baseUrl}/budget-commander` },
        { '@type': 'ListItem', position: 3, name: 'Cards Under $2', item: `${baseUrl}/budget-commander/cards-under-2-dollars` },
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
        <ClusterNavigation currentSlug="cards-under-2-dollars" />

        {/* Hero Section */}
        <section className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <TrendingDown className="w-3.5 h-3.5" /> Mid-Tier Budget Staples
          </div>

          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white leading-tight gradient-text-gold">
            Best Commander Cards Under $2.00
          </h1>

          <p className="text-sm sm:text-base text-[#8b949e] leading-relaxed">
            The $2 price ceiling is the sweet spot of Commander. It unlocks format staples like Swords to Plowshares, Beast Within, Blasphemous Act, Talisman cycles, and Counterspell without ballooning your deck price.
          </p>

          <div className="flex items-center gap-4 text-xs text-[#8b949e] font-mono border-b border-white/10 pb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> 6 min read
            </span>
            <span>•</span>
            <span>All Cards ≤ $2.00</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">{cards.length} Cards Indexed</span>
          </div>
        </section>

        {/* Interactive Explorer */}
        <section className="space-y-6">
          <TopicCardExplorer initialCards={cards} roleTitle="Cards Under $2" />
        </section>
      </main>

      <Footer />
    </div>
  );
}
