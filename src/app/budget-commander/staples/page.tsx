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
  ShieldCheck,
  Zap,
  BookOpen,
  TrendingDown,
  Layers,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const revalidate = 86400;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';

export const metadata: Metadata = {
  title: 'Best Budget Commander Staples (All Colors Under $2.00) | MTGCheap',
  description:
    'Discover the top 100 best budget Commander staples for White, Blue, Black, Red, Green, and Colorless. Essential cheap cards for building high-power EDH decks.',
  keywords: [
    'best budget commander staples',
    'cheap commander staples',
    'budget edh staples',
    'best cheap cards for commander',
    'budget commander cards by color',
    'mtg budget staples',
  ],
  alternates: {
    canonical: `${baseUrl}/budget-commander/staples`,
  },
  openGraph: {
    title: 'Best Budget Commander Staples (All Colors Under $2.00)',
    description: 'Explore the top 100 budget Commander staples for every color under $2.00.',
    url: `${baseUrl}/budget-commander/staples`,
  },
};

async function getBudgetStaples(): Promise<ClusterCard[]> {
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
         c.price_usd ASC
       LIMIT 90`
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
    console.error('Error fetching budget staples:', err);
    return [];
  }
}

export default async function BudgetStaplesPage() {
  const cards = await getBudgetStaples();

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Best Budget Commander Staples (All Colors Under $2.00)',
      description: 'The definitive list of high-power budget staples for Commander across all colors.',
      author: { '@type': 'Organization', name: 'MTGCheap Data Lab' },
      publisher: { '@type': 'Organization', name: 'MTGCheap' },
      datePublished: '2026-08-01',
      dateModified: new Date().toISOString().split('T')[0],
      mainEntityOfPage: `${baseUrl}/budget-commander/staples`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Budget Commander', item: `${baseUrl}/budget-commander` },
        { '@type': 'ListItem', position: 3, name: 'Staples by Color', item: `${baseUrl}/budget-commander/staples` },
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
        <ClusterNavigation currentSlug="staples" />

        {/* Hero Section */}
        <section className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Evergreen EDH Core
          </div>

          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white leading-tight gradient-text-gold">
            Best Budget Commander Staples
          </h1>

          <p className="text-sm sm:text-base text-[#8b949e] leading-relaxed">
            The foundation of every strong Commander deck is built on reliable card draw, efficient ramp, and flexible interaction. Explore the top-rated budget staples across every color identity under $2.00.
          </p>

          <div className="flex items-center gap-4 text-xs text-[#8b949e] font-mono border-b border-white/10 pb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> 8 min read
            </span>
            <span>•</span>
            <span>Live Price Indexing</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">{cards.length} Core Staples</span>
          </div>
        </section>

        {/* Interactive Explorer */}
        <section className="space-y-6">
          <TopicCardExplorer initialCards={cards} roleTitle="Commander Staples" />
        </section>
      </main>

      <Footer />
    </div>
  );
}
