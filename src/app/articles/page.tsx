import type { Metadata } from 'next';
import Link from 'next/link';
import { query } from '@/lib/db';
import { Sparkles } from 'lucide-react';
import { InfiniteArticlesGrid } from './InfiniteArticlesGrid';

export const dynamic = 'force-dynamic';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';

export const metadata: Metadata = {
  title: 'MTG Budget Strategy Articles & Guides | CheapMTG',
  description:
    'In-depth Magic: The Gathering deck building guides and vector-analyzed card comparisons for high-cost staples.',
  alternates: {
    canonical: `${baseUrl}/articles`,
  },
  openGraph: {
    title: 'MTG Budget Strategy Articles & Guides | CheapMTG',
    description: 'Discover contextually accurate budget swaps for top Commander and Modern staples.',
    url: `${baseUrl}/articles`,
    type: 'website',
  },
};

function cardNameToSlug(name: string): string {
  return 'budget-options-for-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function getInitialStaplesOver15() {
  try {
    const res = await query(
      `SELECT oracle_id, name, type_line, price_usd, image_uri, color_identity
       FROM cards
       WHERE price_usd IS NOT NULL AND price_usd >= 15.00
         AND COALESCE(is_silver_bordered, FALSE) = FALSE
       ORDER BY price_usd DESC
       LIMIT 12`
    );

    const countRes = await query(
      `SELECT COUNT(*) as total
       FROM cards
       WHERE price_usd IS NOT NULL AND price_usd >= 15.00
         AND COALESCE(is_silver_bordered, FALSE) = FALSE`
    );

    const allCardsRes = await query(
      `SELECT oracle_id, name, price_usd
       FROM cards
       WHERE price_usd IS NOT NULL AND price_usd >= 15.00
         AND COALESCE(is_silver_bordered, FALSE) = FALSE
       ORDER BY name ASC`
    );

    const total = parseInt(countRes.rows[0]?.total || '0', 10);
    const cards = res.rows.map((row: any) => ({
      oracle_id: row.oracle_id,
      name: row.name,
      type_line: row.type_line,
      price_usd: parseFloat(row.price_usd),
      image_uri: row.image_uri,
      color_identity: row.color_identity || [],
      slug: cardNameToSlug(row.name),
    }));

    const allArticleLinks = allCardsRes.rows.map((row: any) => ({
      name: row.name,
      price_usd: parseFloat(row.price_usd),
      slug: cardNameToSlug(row.name),
    }));

    return { cards, hasMore: cards.length < total, allArticleLinks };
  } catch (err) {
    console.error('Error fetching staples over $15:', err);
    return { cards: [], hasMore: false, allArticleLinks: [] };
  }
}

export default async function ArticlesIndexPage() {
  const { cards: initialCards, hasMore: initialHasMore, allArticleLinks } = await getInitialStaplesOver15();

  return (
    <div className="min-h-screen bg-[#05070a] text-[#f0f6fc] relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[140px] animate-pulse-slow"></div>
        <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[150px] animate-pulse-slow"></div>
      </div>

      {/* Header Bar */}
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
            <Link href="/articles" className="text-amber-400 font-bold border-b border-amber-400 pb-0.5">
              Articles
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="font-cinzel text-4xl sm:text-5xl font-black tracking-wide gradient-text-gold">
            Budget Guides
          </h1>
          <p className="text-xs sm:text-sm text-[#8b949e]">
            Comprehensive vector-analyzed MTG budget swap guides for high-demand Commander & Modern staples.
          </p>
        </div>

        {/* Articles Grid with Infinite Scroll */}
        <InfiniteArticlesGrid initialCards={initialCards} initialHasMore={initialHasMore} />

        {/* Complete HTML Crawl Mesh Section for Googlebot Indexing */}
        {allArticleLinks && allArticleLinks.length > 0 && (
          <section className="pt-12 border-t border-white/10 space-y-6">
            <div className="space-y-1">
              <h2 className="font-cinzel text-2xl font-bold text-white">All MTG Card Strategy Guides Index</h2>
              <p className="text-xs text-[#8b949e]">Direct links to vector-analyzed budget guide articles for all high-value cards in our index.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
              {allArticleLinks.map((item: any) => (
                <Link
                  key={item.slug}
                  href={`/articles/${item.slug}`}
                  className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 hover:text-amber-300 text-[#c9d1d9] transition-all truncate flex items-center justify-between"
                  title={`Budget alternatives for ${item.name}`}
                >
                  <span className="truncate">{item.name}</span>
                  <span className="text-[10px] font-mono text-amber-400 ml-1 shrink-0">${item.price_usd.toFixed(0)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
