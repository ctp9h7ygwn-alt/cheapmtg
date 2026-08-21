import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/app/components/Footer';
import ClusterNavigation from '../components/ClusterNavigation';
import TopicCardExplorer from '../components/TopicCardExplorer';
import { TOPIC_CLUSTERS, getCardsForTopic } from '@/lib/topic-clusters';
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
  ChevronRight,
} from 'lucide-react';

export const revalidate = 86400;

interface Props {
  params: { category: string };
}

export async function generateStaticParams() {
  return Object.keys(TOPIC_CLUSTERS).map((slug) => ({
    category: slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = TOPIC_CLUSTERS[params.category];
  if (!meta) return { title: 'Category Not Found | MTGCheap' };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';

  return {
    title: meta.metaTitle,
    description: meta.metaDescription,
    keywords: [
      `budget ${meta.shortTitle.toLowerCase()} commander`,
      `cheap ${meta.shortTitle.toLowerCase()} commander`,
      `best budget ${meta.shortTitle.toLowerCase()} mtg`,
      `cheap ${meta.shortTitle.toLowerCase()} edh`,
      'budget commander cards',
      'mtg budget alternatives',
    ],
    alternates: {
      canonical: `${baseUrl}/budget-commander/${params.category}`,
    },
    openGraph: {
      title: meta.metaTitle,
      description: meta.metaDescription,
      url: `${baseUrl}/budget-commander/${params.category}`,
    },
  };
}

export default async function TopicClusterPage({ params }: Props) {
  const meta = TOPIC_CLUSTERS[params.category];
  if (!meta) {
    notFound();
  }

  const cards = await getCardsForTopic(params.category, 60, 3.00);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';
  const canonicalUrl = `${baseUrl}/budget-commander/${params.category}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: meta.heroHeadline,
      description: meta.metaDescription,
      author: { '@type': 'Organization', name: 'MTGCheap Data Lab' },
      publisher: { '@type': 'Organization', name: 'MTGCheap' },
      datePublished: '2026-08-01',
      dateModified: new Date().toISOString().split('T')[0],
      mainEntityOfPage: canonicalUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Budget Commander', item: `${baseUrl}/budget-commander` },
        { '@type': 'ListItem', position: 3, name: meta.shortTitle, item: canonicalUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: meta.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Top Budget ${meta.shortTitle} Cards for Commander`,
      itemListElement: cards.slice(0, 10).map((card, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: card.name,
        description: `${card.name} (${card.type_line}) - $${card.price_usd.toFixed(2)} budget alternative in Commander.`,
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
        <ClusterNavigation currentSlug={meta.slug} />

        {/* Hero Section */}
        <section className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Functional Role Guide
          </div>

          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white leading-tight gradient-text-gold">
            {meta.heroHeadline}
          </h1>

          <p className="text-sm sm:text-base text-[#8b949e] leading-relaxed">
            {meta.heroSubheadline}
          </p>

          <div className="flex items-center gap-4 text-xs text-[#8b949e] font-mono border-b border-white/10 pb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> 6 min read
            </span>
            <span>•</span>
            <span>Updated August 2026</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">{cards.length} Budget Options Indexed</span>
          </div>
        </section>

        {/* Editorial Role Overview & Why Replace Expensive Staples */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
              The Role of {meta.shortTitle} in Commander
            </h2>
            <p className="text-xs sm:text-sm text-[#c9d1d9] leading-relaxed">
              {meta.roleDescription}
            </p>

            {meta.subcategories && meta.subcategories.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="text-xs font-mono uppercase font-bold text-amber-400">
                  Key Subcategories in this Role:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {meta.subcategories.map((sub) => (
                    <div key={sub.title} className="bg-white/[0.02] p-3.5 rounded-xl border border-white/5 space-y-1">
                      <div className="font-bold text-xs text-white">{sub.title}</div>
                      <p className="text-[11px] text-[#8b949e] leading-relaxed">{sub.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Expensive Staples to Replace Module */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-base font-bold text-white">
                  Expensive Staples to Replace
                </h3>
                <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  High Cost
                </span>
              </div>
              <p className="text-[11px] text-[#8b949e]">
                Trying to find cheaper alternatives to these high-priced staples? View our card-specific swap guides:
              </p>

              <div className="space-y-2">
                {meta.keyExpensiveStaples.map((staple) => (
                  <Link
                    key={staple.slug}
                    href={`/articles/${staple.slug}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-500/40 hover:bg-white/[0.05] transition-all group"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs text-white group-hover:text-amber-300 transition-colors">
                        {staple.name}
                      </div>
                      <div className="text-[10px] text-[#8b949e] line-clamp-1">{staple.reason}</div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="font-mono text-xs font-bold text-amber-400">${staple.price.toFixed(0)}</div>
                      <div className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                        Swaps <ChevronRight className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/articles"
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 pt-2 border-t border-white/5"
            >
              Browse all 1,500+ Card Guides <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </section>

        {/* Interactive Filterable Card Grid */}
        <section className="space-y-6 pt-6 border-t border-white/10">
          <div className="space-y-1">
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
              Top Ranked Budget {meta.shortTitle} Cards
            </h2>
            <p className="text-xs sm:text-sm text-[#8b949e]">
              Filter by color identity, maximum price cap ($0.50, $1.00, $2.00, $5.00), or keyword search.
            </p>
          </div>

          <TopicCardExplorer initialCards={cards} roleTitle={meta.shortTitle} />
        </section>

        {/* FAQ Section */}
        <section className="space-y-6 pt-6 border-t border-white/10 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
              Frequently Asked Questions About Budget {meta.shortTitle}
            </h2>
            <p className="text-xs text-[#8b949e]">Expert deckbuilding advice and card recommendations.</p>
          </div>

          <div className="space-y-4">
            {meta.faqs.map((faq, i) => (
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
