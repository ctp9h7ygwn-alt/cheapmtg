import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';
import Footer from '../../components/Footer';
import ExpandableCardImage from '../../components/ExpandableCardImage';
import {
  Sparkles,
  ArrowRight,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  BookOpen,
  Filter,
  Maximize2,
  Zap
} from 'lucide-react';

export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

function slugToCardSearchName(slug: string): string {
  return slug
    .replace(/^budget-options-for-/, '')
    .replace(/-/g, ' ');
}

// Fetch card and compute budget swaps on server
async function getArticleData(slug: string) {
  const cardSearch = slugToCardSearchName(slug);

  // 1. Fetch Target Card from DB or Scryfall API
  let targetRes = await query(
    `SELECT c.*, ce.embedding::text AS embedding_str
     FROM cards c
     LEFT JOIN card_embeddings ce ON c.oracle_id = ce.oracle_id
     WHERE LOWER(c.name) = LOWER($1) OR LOWER(c.name) LIKE LOWER($1) || '%' OR REPLACE(LOWER(c.name), ' ', '-') LIKE '%' || LOWER($1) || '%'
     ORDER BY 
       CASE WHEN LOWER(c.name) = LOWER($1) THEN 0
            WHEN LOWER(c.name) LIKE LOWER($1) || '%' THEN 1
            ELSE 2 END,
       c.price_usd DESC NULLS LAST
     LIMIT 1`,
    [cardSearch]
  );

  let targetCard: any = null;

  if (targetRes.rows.length > 0) {
    targetCard = targetRes.rows[0];
  } else {
    // Scryfall API Fallback
    const scryfallRes = await fetch(
      `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardSearch)}`,
      { headers: { 'User-Agent': 'CheapMTG-BudgetSwapEngine/1.0' }, next: { revalidate: 3600 } }
    );

    if (scryfallRes.ok) {
      const card = await scryfallRes.json();
      const oracleId = card.oracle_id;
      const name = card.name;
      const manaValue = card.cmc ?? 0;
      const colors = card.colors || [];
      const colorIdentity = card.color_identity || [];
      const typeLine = card.type_line || '';
      const oracleText = card.oracle_text || (card.card_faces ? card.card_faces.map((f: any) => f.oracle_text).join(' // ') : '');
      const priceUsd = card.prices?.usd ? parseFloat(card.prices.usd) : (card.prices?.usd_foil ? parseFloat(card.prices.usd_foil) : null);
      const imageUri = card.image_uris?.normal || card.image_uris?.large || (card.card_faces && card.card_faces[0]?.image_uris?.normal ? card.card_faces[0].image_uris.normal : '');
      const scryfallUri = card.scryfall_uri || `https://scryfall.com/card/${card.id}`;
      const isSilverBordered = card.set_type === 'funny' || card.border_color === 'silver';

      await query(
        `INSERT INTO cards (oracle_id, name, mana_value, colors, color_identity, type_line, oracle_text, price_usd, scryfall_uri, image_uri, is_silver_bordered)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (oracle_id) DO UPDATE SET price_usd = EXCLUDED.price_usd`,
        [oracleId, name, manaValue, colors, colorIdentity, typeLine, oracleText, priceUsd, scryfallUri, imageUri, isSilverBordered]
      );

      targetCard = {
        oracle_id: oracleId,
        name,
        mana_value: manaValue,
        colors,
        color_identity: colorIdentity,
        type_line: typeLine,
        oracle_text: oracleText,
        price_usd: priceUsd,
        scryfall_uri: scryfallUri,
        image_uri: imageUri,
        embedding_str: null,
      };
    }
  }

  if (!targetCard) return null;

  const targetPrice = targetCard.price_usd ? parseFloat(targetCard.price_usd) : 0;

  // Fetch Tags
  const tagsRes = await query(`SELECT tag FROM oracle_tags WHERE card_oracle_id = $1`, [targetCard.oracle_id]);
  const targetTags = tagsRes.rows.map((r: any) => r.tag);

  // Embedding
  let embeddingSql = targetCard.embedding_str;
  if (!embeddingSql) {
    const textToEmbed = `Type: ${targetCard.type_line} | Cost: ${targetCard.mana_value} | Text: ${targetCard.oracle_text} | Tags: ${targetTags.join(', ')}`;
    const vector = await generateEmbedding(textToEmbed);
    embeddingSql = `[${vector.join(',')}]`;
    await query(
      `INSERT INTO card_embeddings (oracle_id, embedding) VALUES ($1, $2::vector)
       ON CONFLICT (oracle_id) DO UPDATE SET embedding = EXCLUDED.embedding`,
      [targetCard.oracle_id, embeddingSql]
    );
  }

  // Query Candidates (Max price ceiling $5.00 for budget article)
  const maxPrice = 5.00;
  const candidatesRes = await query(
    `WITH target_tags AS (
      SELECT tag FROM oracle_tags WHERE card_oracle_id = $1
    ),
    candidate_base AS (
      SELECT 
        c.oracle_id, c.name, c.mana_value, c.colors, c.color_identity, c.type_line, c.oracle_text, c.price_usd, c.scryfall_uri, c.image_uri,
        1 - (ce.embedding <=> $2::vector) AS vector_similarity
      FROM cards c
      JOIN card_embeddings ce ON c.oracle_id = ce.oracle_id
      WHERE c.oracle_id != $1
        AND c.price_usd IS NOT NULL AND c.price_usd > 0 AND c.price_usd <= $3::numeric
        AND c.color_identity <@ $4::text[]
        AND COALESCE(c.is_silver_bordered, FALSE) = FALSE
        AND c.type_line NOT ILIKE '%Token%'
        AND c.type_line NOT ILIKE '%Emblem%'
        AND c.type_line NOT ILIKE '%Art Series%'
        AND c.type_line NOT ILIKE '%Card Back%'
        AND c.type_line NOT ILIKE '%Helper%'
        AND c.type_line NOT ILIKE '%Sticker%'
        AND c.type_line NOT ILIKE '%Attraction%'
      ORDER BY ce.embedding <=> $2::vector ASC
      LIMIT 30
    )
    SELECT cb.*,
      ARRAY(SELECT ot.tag FROM oracle_tags ot WHERE ot.card_oracle_id = cb.oracle_id AND ot.tag IN (SELECT tag FROM target_tags)) AS shared_tags,
      (SELECT COUNT(*)::int FROM oracle_tags ot WHERE ot.card_oracle_id = cb.oracle_id AND ot.tag IN (SELECT tag FROM target_tags)) AS shared_tag_count
    FROM candidate_base cb
    LIMIT 4`,
    [targetCard.oracle_id, embeddingSql, maxPrice, targetCard.color_identity || []]
  );

  const alternatives = candidatesRes.rows.map((cand: any) => {
    const price = parseFloat(cand.price_usd);
    const dollarSavings = targetPrice > 0 ? Math.max(0, targetPrice - price) : 0;
    const percentSavings = targetPrice > 0 ? Math.round((dollarSavings / targetPrice) * 100) : 0;
    const similarityScore = Math.max(0, Math.round(cand.vector_similarity * 100));

    // Tailored Attribute & Synergy Analysis
    const candCmc = parseFloat(cand.mana_value || '0');
    const targetCmc = parseFloat(targetCard.mana_value || '0');
    const cmcDiff = targetCmc - candCmc;

    let cmcComparison = '';
    if (cmcDiff > 0) {
      cmcComparison = `costs ${cmcDiff} less mana to cast (${candCmc} MV vs ${targetCmc} MV)`;
    } else if (cmcDiff === 0) {
      cmcComparison = `shares the exact same mana value (${candCmc} MV)`;
    } else {
      cmcComparison = `costs ${Math.abs(cmcDiff)} more mana to cast (${candCmc} MV)`;
    }

    const targetType = (targetCard.type_line || '').split('—')[0].trim();
    const candType = (cand.type_line || '').split('—')[0].trim();
    const isSameType = targetType.toLowerCase() === candType.toLowerCase();

    const typeSentence = isSameType
      ? `Matches ${targetCard.name}'s ${candType} card type`
      : `Functions as a ${candType} alternative to ${targetCard.name}'s ${targetType}`;

    const sharedTagsClean = (cand.shared_tags || []).map((t: string) => t.replace('otag:', ''));
    const tagSentence = sharedTagsClean.length > 0
      ? `Overlaps on functional mechanics including #${sharedTagsClean.slice(0, 3).join(', #')}.`
      : `Fills a similar strategic role in Commander and deck construction.`;

    const synergyInsight = `${typeSentence} and ${cmcComparison}. ${tagSentence}`;

    return {
      oracle_id: cand.oracle_id,
      name: cand.name,
      mana_value: candCmc,
      type_line: cand.type_line,
      oracle_text: cand.oracle_text,
      price_usd: price,
      image_uri: cand.image_uri,
      similarity_score: similarityScore,
      shared_tags: sharedTagsClean,
      synergy_insight: synergyInsight,
      dollar_savings: parseFloat(dollarSavings.toFixed(2)),
      percent_savings: percentSavings,
      tcgplayer_url: `https://www.tcgplayer.com/search/magic/product?q=${encodeURIComponent(cand.name)}&utm_source=cheapmtg`,
      manapool_url: `https://manapool.com/cards?q=${encodeURIComponent(cand.name)}&ref=cheapmtg`,
    };
  });

  // Query Related High-Value Article Cards for Internal Crawl Mesh
  const relatedRes = await query(
    `SELECT oracle_id, name, type_line, price_usd, image_uri, color_identity
     FROM cards
     WHERE oracle_id != $1
       AND price_usd IS NOT NULL AND price_usd >= 10.00
       AND COALESCE(is_silver_bordered, FALSE) = FALSE
     ORDER BY 
       CASE WHEN color_identity && $2::text[] THEN 0 ELSE 1 END,
       price_usd DESC
     LIMIT 6`,
    [targetCard.oracle_id, targetCard.color_identity || []]
  );

  const relatedArticles = relatedRes.rows.map((row: any) => ({
    oracle_id: row.oracle_id,
    name: row.name,
    type_line: row.type_line,
    price_usd: parseFloat(row.price_usd),
    image_uri: row.image_uri,
    color_identity: row.color_identity || [],
    slug: 'budget-options-for-' + row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  }));

  // Functional Role Determination for SEO Content Uniqueness
  const typeLower = (targetCard.type_line || '').toLowerCase();
  const textLower = (targetCard.oracle_text || '').toLowerCase();
  let cardRole = 'Versatile Deck Staple';
  if (textLower.includes('draw')) cardRole = 'Card Advantage Engine';
  else if (textLower.includes('destroy all') || textLower.includes('exile all')) cardRole = 'Board Wipe & Reset';
  else if (textLower.includes('destroy target') || textLower.includes('exile target')) cardRole = 'Single-Target Removal';
  else if (textLower.includes('search your library')) cardRole = 'Tutor & Consistency Helper';
  else if (textLower.includes('add {') || textLower.includes('mana')) cardRole = 'Mana Accelerator & Ramp';
  else if (typeLower.includes('creature')) cardRole = 'High-Impact Creature Body';

  return {
    targetCard: {
      oracle_id: targetCard.oracle_id,
      name: targetCard.name,
      type_line: targetCard.type_line,
      oracle_text: targetCard.oracle_text,
      color_identity: targetCard.color_identity || [],
      price_usd: targetPrice,
      image_uri: targetCard.image_uri,
      oracle_tags: targetTags.map((t: string) => t.replace('otag:', '')),
      cardRole,
    },
    alternatives,
    relatedArticles,
  };
}

function getColorLabel(colors?: string[]): string {
  if (!colors || colors.length === 0) return 'Colorless';
  if (colors.length === 1) {
    const map: Record<string, string> = { W: 'Mono-White', U: 'Mono-Blue', B: 'Mono-Black', R: 'Mono-Red', G: 'Mono-Green' };
    return map[colors[0]] || 'Mono-Color';
  }
  return 'Multicolor';
}

function getPriceCap(priceUsd: number): number {
  if (priceUsd >= 50) return 5;
  if (priceUsd >= 30) return 4;
  if (priceUsd >= 20) return 3;
  if (priceUsd >= 15) return 2;
  return 1;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getArticleData(params.slug);
  if (!data) return { title: 'Article Not Found | CheapMTG' };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';
  const name = data.targetCard.name;
  const colorLabel = getColorLabel(data.targetCard.color_identity);
  const topAlternative = data.alternatives[0]?.name || 'budget substitutes';
  const topSavings = data.alternatives[0]?.percent_savings || 90;
  const swapCount = data.alternatives.length;
  const priceDisplay = data.targetCard.price_usd > 0 ? `$${data.targetCard.price_usd.toFixed(0)}` : '';

  return {
    title: `Top ${swapCount} Budget Alternatives to ${name}${priceDisplay ? ` (${priceDisplay})` : ''} — Save ${topSavings}%+`,
    description: `Find the best ${colorLabel.toLowerCase()} budget replacements for ${name} in Commander & Modern. Top swap: ${topAlternative}. Save up to ${topSavings}% with functional substitutes under $5.`,
    keywords: [
      `budget ${name}`,
      `${name} alternatives`,
      `cheap ${name} replacement`,
      `best ${colorLabel.toLowerCase()} budget cards edh`,
      `mtg commander budget swaps`,
      `${name} substitute mtg`,
      `${topAlternative} vs ${name}`,
      `cheap ${data.targetCard.type_line} edh`,
    ],
    alternates: {
      canonical: `${baseUrl}/articles/${params.slug}`,
    },
    openGraph: {
      title: `Top ${swapCount} Budget Alternatives to ${name}${priceDisplay ? ` (${priceDisplay})` : ''} — Save ${topSavings}%+`,
      description: `Find the best ${colorLabel.toLowerCase()} budget replacements for ${name} in Commander & Modern. Save up to ${topSavings}%.`,
      url: `${baseUrl}/articles/${params.slug}`,
      images: data.targetCard.image_uri ? [{ url: data.targetCard.image_uri }] : [],
    },
  };
}

export default async function DynamicArticlePage({ params }: Props) {
  const data = await getArticleData(params.slug);

  if (!data) {
    notFound();
  }

  const { targetCard, alternatives, relatedArticles } = data;
  const colorLabel = getColorLabel(targetCard.color_identity);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';
  const canonicalUrl = `${baseUrl}/articles/${params.slug}`;
  const topAlternative = alternatives[0]?.name || 'low-cost substitutes';

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `Best ${colorLabel} budget alternatives to ${targetCard.name}`,
      description: `Definitive vector-matched budget substitutes for ${targetCard.name} ($${targetCard.price_usd.toFixed(2)}).`,
      author: { '@type': 'Organization', name: 'CheapMTG Data Lab' },
      publisher: { '@type': 'Organization', name: 'CheapMTG' },
      datePublished: '2026-08-03',
      dateModified: new Date().toISOString().split('T')[0],
      mainEntityOfPage: canonicalUrl,
      image: targetCard.image_uri ? [targetCard.image_uri] : [],
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
          name: targetCard.name,
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
          name: `What is the best cheap budget alternative to ${targetCard.name}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: alternatives.length > 0
              ? `The top vector-matched budget alternative to ${targetCard.name} is ${topAlternative} ($${alternatives[0].price_usd.toFixed(2)}), offering a ${alternatives[0].similarity_score}% functional match while saving $${alternatives[0].dollar_savings.toFixed(2)}.`
              : `Functional replacements for ${targetCard.name} are available for under $5.00 on CheapMTG.`,
          },
        },
        {
          '@type': 'Question',
          name: `How can I replace ${targetCard.name} in MTG Commander on a budget?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `You can replace ${targetCard.name} ($${targetCard.price_usd.toFixed(2)}) in EDH by swapping in lower-cost cards that share key Scryfall oracle tags like #${targetCard.oracle_tags.slice(0, 3).join(', #')} and identical color identity (${targetCard.color_identity.join(', ') || 'Colorless'}).`,
          },
        },
      ],
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
            <Link href="/articles" className="text-amber-400 font-bold">
              Articles
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-[#8b949e] font-mono">
            <Link href="/articles" className="hover:text-amber-300">Articles</Link>
            <span>/</span>
            <span className="text-amber-400">Budget Analysis</span>
          </div>

          <h1 className="font-cinzel text-3xl sm:text-4xl font-black text-white leading-tight gradient-text-gold">
            Best {colorLabel} budget alternatives to {targetCard.name}
          </h1>

          <div className="flex items-center gap-4 text-xs text-[#8b949e] font-mono border-b border-white/10 pb-6">
            <span>Automated Vector Analysis</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> 5 min read
            </span>
            <span>•</span>
            <span>Updated August 3, 2026</span>
          </div>
        </div>

        {/* Target Card Highlight */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-40 shrink-0 aspect-[488/680] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#090d16] relative">
            <ExpandableCardImage
              src={targetCard.image_uri}
              alt={`Magic: The Gathering card image for ${targetCard.name} (${targetCard.type_line})`}
              title={targetCard.name}
              sizes="160px"
            />
          </div>

          <div className="space-y-3 flex-1 text-xs">
            <div className="flex justify-between items-baseline">
              <h2 className="font-cinzel text-xl font-bold text-white">{targetCard.name}</h2>
              <span className="font-mono text-lg font-black text-amber-400">${targetCard.price_usd.toFixed(2)} Market</span>
            </div>
            <p className="text-[#8b949e]">
              <strong className="text-white">Card Breakdown:</strong> {targetCard.name} ({targetCard.type_line}) acts as a key <span className="text-amber-300 font-semibold">{targetCard.cardRole}</span> in competitive and casual EDH / Modern formats. At ${targetCard.price_usd.toFixed(2)}, budget-conscious players can leverage vector embedding similarity to achieve comparable game effects for under $5.00.
            </p>
            {relatedArticles && relatedArticles.length > 0 && (
              <div className="pt-2 text-[11px] text-[#8b949e]">
                <strong className="text-white">Looking for other high-cost replacements?</strong> See our budget guides for{' '}
                {relatedArticles.slice(0, 3).map((rel: any, i: number) => (
                  <span key={rel.oracle_id}>
                    {i > 0 && ', '}
                    <Link href={`/articles/${rel.slug}`} className="text-amber-400 font-semibold hover:underline">
                      {rel.name} (${rel.price_usd.toFixed(0)})
                    </Link>
                  </span>
                ))}.
              </div>
            )}
            {targetCard.oracle_tags && targetCard.oracle_tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {targetCard.oracle_tags.map((t: string) => (
                  <span key={t} className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Swaps List with Card Images */}
        <section className="space-y-6">
          <h2 className="font-cinzel text-2xl font-bold text-white border-b border-white/10 pb-3">
            Top Vector-Ranked Budget Swaps
          </h2>

          {alternatives.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-sm text-[#8b949e]">
              No direct budget alternatives under $5.00 found in current index.
            </div>
          ) : (
            <div className="space-y-6">
              {alternatives.map((swap: any, idx: number) => (
                <div key={swap.oracle_id} className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
                  {/* Header Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div>
                      <span className="text-xs font-mono text-amber-400 font-bold mr-2">#{idx + 1} Best Swap</span>
                      <h3 className="font-cinzel text-xl font-bold text-white inline">{swap.name}</h3>
                      <span className="text-xs text-[#8b949e] ml-2">({swap.type_line})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-extrabold text-emerald-400">${swap.price_usd.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Card Image & Information */}
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    <div className="w-28 shrink-0 aspect-[488/680] rounded-xl overflow-hidden border border-white/10 bg-[#05070a] shadow-xl relative">
                      <ExpandableCardImage
                        src={swap.image_uri}
                        alt={`Magic: The Gathering budget alternative card image for ${swap.name} (${swap.type_line})`}
                        title={swap.name}
                        sizes="112px"
                      />
                    </div>

                    <div className="space-y-3 flex-1">
                      {/* Similarity Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-cyan-300 font-bold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> {swap.similarity_score}% Vector Match
                          </span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full"
                            style={{ width: `${swap.similarity_score}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Oracle Text */}
                      <p className="bg-[#05070a]/80 p-3.5 rounded-xl border border-white/10 italic text-xs leading-relaxed text-[#f0f6fc]">
                        {swap.oracle_text}
                      </p>

                      {/* Tailored Synergy Analysis */}
                      <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl space-y-1">
                        <div className="text-[11px] font-bold text-amber-300 font-mono flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" /> Vector Synergy Breakdown
                        </div>
                        <p className="text-xs text-[#c9d1d9] leading-relaxed">
                          {swap.synergy_insight}
                        </p>
                      </div>

                      {/* Shared Tags */}
                      {swap.shared_tags && swap.shared_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {swap.shared_tags.map((t: string) => (
                            <span key={t} className="px-2.5 py-0.5 rounded-md font-mono text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-cyan-400" /> #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Affiliate Links */}
                  <div className="pt-3 border-t border-white/5 flex gap-3 justify-end">
                    <a href={swap.tcgplayer_url} target="_blank" rel="noopener noreferrer nofollow sponsored" className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-xs rounded-xl hover:brightness-110 transition-all flex items-center gap-1 shadow-md shadow-amber-500/20">
                      Buy TCGplayer <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a href={swap.manapool_url} target="_blank" rel="noopener noreferrer nofollow sponsored" className="px-4 py-2 bg-white/5 text-white font-semibold text-xs rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1">
                      Mana Pool <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Crawlable Backlinks Section: Similar Expensive Cards to Replace */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-white/10">
            <h2 className="font-cinzel text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" /> Similar Expensive Staples to Replace
            </h2>
            <p className="text-xs text-[#8b949e]">
              Looking to cut costs across your entire Commander deck? Browse budget guides for similar high-value cards in this format:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedArticles.map((rel: any) => (
                <Link
                  key={rel.oracle_id}
                  href={`/articles/${rel.slug}`}
                  className="glass-card rounded-2xl p-4 border border-white/10 hover:border-amber-500/50 hover:-translate-y-1 transition-all group flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-16 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-[#090d16] relative">
                      {rel.image_uri ? (
                        <Image src={rel.image_uri} alt={rel.name} fill sizes="48px" className="object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-[#8b949e]">Card</div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="font-cinzel font-bold text-xs text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                        {rel.name}
                      </div>
                      <div className="text-[10px] text-[#8b949e] font-mono">
                        ${rel.price_usd.toFixed(2)} Market
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Budget Swaps <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA Launch Engine */}
        <section className="glass-panel rounded-3xl p-8 border border-white/10 text-center space-y-4">
          <h3 className="font-cinzel text-2xl font-bold text-white">Test {targetCard.name} Swaps Live in the Engine</h3>
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
