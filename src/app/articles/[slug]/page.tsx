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
  Zap,
  ShieldAlert
} from 'lucide-react';

export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

function slugToCleanName(slug: string): string {
  return slug
    .replace(/^budget-options-for-/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

function slugToCardSearchName(slug: string): string {
  return slug
    .replace(/^budget-options-for-/, '')
    .replace(/-/g, ' ');
}

const TAG_DESCRIPTIONS: Record<string, string> = {
  'impact-effect': 'deals direct damage to opponents whenever creatures enter the battlefield',
  'cast-tax': 'forces opponents to pay additional mana when casting spells',
  'draw-tax': 'punishes opponents or yields benefits whenever they draw cards',
  'asymmetrical-bounce': 'returns opponents’ nonland permanents to hand without disrupting your board',
  'burst-draw': 'delivers high-volume card advantage into your hand',
  'repeatable-pure-draw': 'provides ongoing turn-over-turn card advantage',
  'pinger': 'delivers repeatable direct damage increments across the table',
  'group-slug': 'accelerates the game by applying consistent damage pressure to all opponents',
  'board-wipe': 'clears the board of creatures or nonland permanents',
  'mana-rock': 'provides repeatable mana ramp from a nonland permanent',
  'tutor': 'searches your library directly for key combo or answer cards',
  'counterspell': 'counters target opponent spells directly from the stack',
  'extra-turn': 'grants an additional turn step to push for a win',
  'reanimation': 'returns high-impact creatures directly from the graveyard to the battlefield',
  'aristocrat': 'triggers beneficial drain or card advantage when your creatures die',
  'treasure': 'produces Treasure tokens for flexible mana ramp and color fixing',
  'protection': 'shields your permanents or life total from opponent spells and attacks',
  'anthem': 'provides a static power and toughness boost to your entire board',
  'haste-enabler': 'grants haste so your creatures can attack immediately',
  'token-generator': 'creates creature tokens to expand your board presence',
  'graveyard-hate': 'exiles cards from opponent graveyards to disrupt recursion strategies',
  'loot': 'lets you draw cards and discard to filter your hand',
};

// Fetch card and compute budget swaps on server
async function getArticleData(slug: string) {
  const cleanSearch = slugToCleanName(slug);
  const cardSearch = slugToCardSearchName(slug);

  // 1. Fetch Target Card from DB or Scryfall API
  let targetRes = await query(
    `SELECT c.*, ce.embedding::text AS embedding_str
     FROM cards c
     LEFT JOIN card_embeddings ce ON c.oracle_id = ce.oracle_id
     WHERE REGEXP_REPLACE(TRANSLATE(LOWER(c.name), 'âàáäãåêèéëîìíïôòóöõûùúüñÿ', 'aaaaaaeeeeiiiiooooouuuuny'), '[^a-z0-9]', '', 'g') = $1
        OR LOWER(c.name) LIKE LOWER($2) || '%'
     ORDER BY 
       CASE WHEN REGEXP_REPLACE(TRANSLATE(LOWER(c.name), 'âàáäãåêèéëîìíïôòóöõûùúüñÿ', 'aaaaaaeeeeiiiiooooouuuuny'), '[^a-z0-9]', '', 'g') = $1 THEN 0 ELSE 1 END,
       c.price_usd DESC NULLS LAST
     LIMIT 1`,
    [cleanSearch, cardSearch]
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

  // Query Candidates with Hybrid Search (Union of Vector + Shared Tag Pool)
  const maxPrice = 5.00;
  const candidatesRes = await query(
    `WITH target_tags AS (
      SELECT tag FROM oracle_tags 
      WHERE card_oracle_id = $1 
        AND tag NOT LIKE '%cycle%' 
        AND tag NOT LIKE '%set%' 
        AND tag NOT LIKE '%border%'
    ),
    candidate_pool AS (
      -- 1. Top vector candidates
      (
        SELECT c.oracle_id
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
        LIMIT 60
      )
      UNION
      -- 2. Candidates directly sharing functional oracle tags
      (
        SELECT c.oracle_id
        FROM cards c
        JOIN oracle_tags ot ON c.oracle_id = ot.card_oracle_id
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
          AND ot.tag IN (SELECT tag FROM target_tags)
        LIMIT 60
      )
    ),
    scored_candidates AS (
      SELECT 
        c.oracle_id, c.name, c.mana_value, c.colors, c.color_identity, c.type_line, c.oracle_text, c.price_usd, c.scryfall_uri, c.image_uri,
        1 - (ce.embedding <=> $2::vector) AS vector_similarity,
        ARRAY(
          SELECT ot.tag FROM oracle_tags ot 
          WHERE ot.card_oracle_id = c.oracle_id 
            AND ot.tag IN (SELECT tag FROM target_tags)
        ) AS shared_tags,
        (
          SELECT COUNT(*)::int FROM oracle_tags ot 
          WHERE ot.card_oracle_id = c.oracle_id 
            AND ot.tag IN (SELECT tag FROM target_tags)
        ) AS shared_tag_count
      FROM cards c
      JOIN card_embeddings ce ON c.oracle_id = ce.oracle_id
      WHERE c.oracle_id IN (SELECT oracle_id FROM candidate_pool)
    )
    SELECT *
    FROM scored_candidates
    ORDER BY 
      (
        (vector_similarity * 0.45) +
        (LEAST(shared_tag_count, 4) * 0.12) +
        (CASE WHEN $5::numeric > 0 THEN LEAST(($5::numeric - price_usd) / $5::numeric, 1.0) * 0.05 ELSE 0 END)
      ) DESC,
      vector_similarity DESC
    LIMIT 6`,
    [targetCard.oracle_id, embeddingSql, maxPrice, targetCard.color_identity || [], targetPrice]
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
    
    // Find the most descriptive shared tag if available
    const matchedKeyTag = sharedTagsClean.find((t: string) => TAG_DESCRIPTIONS[t]);
    let tagSentence = '';
    if (matchedKeyTag && TAG_DESCRIPTIONS[matchedKeyTag]) {
      tagSentence = `Directly shares the #${matchedKeyTag} mechanic (${TAG_DESCRIPTIONS[matchedKeyTag]}).`;
    } else if (sharedTagsClean.length > 0) {
      tagSentence = `Overlaps on functional mechanics including #${sharedTagsClean.slice(0, 3).join(', #')}.`;
    } else {
      tagSentence = `Fills a similar strategic role in Commander and deck construction.`;
    }

    const whySimilar = `${typeSentence} and ${cmcComparison}. ${tagSentence}`;

    // Deterministic Trade-off & Nuance Analysis
    const tradeOffs: string[] = [];
    const candTextLower = (cand.oracle_text || '').toLowerCase();
    const targetTextLower = (targetCard.oracle_text || '').toLowerCase();

    if (candCmc > targetCmc) {
      tradeOffs.push(`Costs ${candCmc - targetCmc} additional mana (${candCmc} MV vs ${targetCmc} MV), making it slightly slower on curve.`);
    }

    if ((candTextLower.includes('each player') || candTextLower.includes('all players') || candTextLower.includes('any player')) &&
        (!targetTextLower.includes('each player') && !targetTextLower.includes('all players'))) {
      tradeOffs.push(`Symmetrical effect: benefits all players at the table rather than uniquely favoring you.`);
    }

    if ((candTextLower.includes('{t}') || candTextLower.includes('pay') || candTextLower.includes('{1}') || candTextLower.includes('{2}')) &&
        (!targetTextLower.includes('{t}') && !targetTextLower.includes('pay'))) {
      tradeOffs.push(`Requires manual mana or tap investment to activate, whereas ${targetCard.name} functions passively.`);
    }

    if (candTextLower.includes('creature') && !targetTextLower.includes('creature')) {
      tradeOffs.push(`Narrower trigger condition: specifically targets or triggers off creature spells/permanents.`);
    }

    if (tradeOffs.length === 0) {
      tradeOffs.push(`At $${price.toFixed(2)} (${percentSavings}% less than ${targetCard.name}), it delivers ${similarityScore}% of the mechanical function, but lacks the absolute power ceiling of the original staple.`);
    }

    const whyNotPerfect = tradeOffs.join(' ');

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
      why_similar: whySimilar,
      why_not_perfect: whyNotPerfect,
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
  if (!data) return { title: 'Article Not Found | MTGCheap' };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';
  const name = data.targetCard.name;
  const colorLabel = getColorLabel(data.targetCard.color_identity);
  const topAlternative = data.alternatives[0]?.name || 'budget substitutes';
  const topSavings = data.alternatives[0]?.percent_savings || 90;
  const swapCount = data.alternatives.length;
  const priceDisplay = data.targetCard.price_usd > 0 ? `$${data.targetCard.price_usd.toFixed(2)}` : '';

  return {
    title: `Top ${swapCount} Budget Cards Like ${name} & Replacements (${priceDisplay}) | MTGCheap`,
    description: `Looking for cards like ${name} (${priceDisplay}) on a budget? Explore top-ranked ${colorLabel.toLowerCase()} replacements, cheaper substitutes, and budget alternatives for Commander & Modern.`,
    keywords: [
      `cards like ${name}`,
      `cards like ${name} mtg`,
      `${name} replacement`,
      `replacement for ${name}`,
      `budget ${name}`,
      `${name} alternatives`,
      `${name} budget alternative`,
      `cheap ${name} mtg`,
      `${name} substitutes edh`,
      `${topAlternative} vs ${name}`,
      `best ${colorLabel.toLowerCase()} budget cards edh`,
    ],
    alternates: {
      canonical: `${baseUrl}/articles/${params.slug}`,
    },
    openGraph: {
      title: `Top ${swapCount} Budget Cards Like ${name} & Replacements (${priceDisplay})`,
      description: `Looking for cards like ${name} (${priceDisplay}) on a budget? Explore top-ranked ${colorLabel.toLowerCase()} functional replacements and budget alternatives for Commander.`,
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

  const sortedByPrice = [...alternatives].sort((a, b) => a.price_usd - b.price_usd);
  const cheapestAlt = sortedByPrice[0] || alternatives[0];

  const faqs = [
    {
      question: `What are the best cards like ${targetCard.name} in MTG?`,
      answer: alternatives.length > 0
        ? `The best budget cards like ${targetCard.name} are ${alternatives.slice(0, 3).map((a: any) => `${a.name} ($${a.price_usd.toFixed(2)})`).join(', ')}. These cards provide similar ${targetCard.cardRole.toLowerCase()} mechanics and functional vector match scores up to ${alternatives[0]?.similarity_score}%.`
        : `Functional budget replacements for ${targetCard.name} are available for under $5.00 on MTGCheap.`,
    },
    {
      question: `What is the cheapest replacement for ${targetCard.name} in Commander?`,
      answer: cheapestAlt
        ? `${cheapestAlt.name} ($${cheapestAlt.price_usd.toFixed(2)}) is the most affordable functional replacement for ${targetCard.name} ($${targetCard.price_usd.toFixed(2)}), saving $${cheapestAlt.dollar_savings.toFixed(2)} (${cheapestAlt.percent_savings}% savings) with a ${cheapestAlt.similarity_score}% vector match.`
        : `Affordable replacements are available for under $1.00.`,
    },
    {
      question: `Why do players look for budget alternatives to ${targetCard.name}?`,
      answer: `Commanding a market price of $${targetCard.price_usd.toFixed(2)}, ${targetCard.name} is a significant financial investment. Using vector-ranked substitutes lets players build competitive Commander and Modern decks without overspending.`,
    },
    {
      question: `Can you replace ${targetCard.name} without losing synergy?`,
      answer: `Yes. By matching core mechanics like #${targetCard.oracle_tags.slice(0, 2).join(', #')} and identical ${colorLabel} color identity, recommended substitutes fill the exact same functional role on curve.`,
    },
  ];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `Top ${alternatives.length} Budget Cards Like ${targetCard.name} & Replacements`,
      description: `Definitive vector-matched budget substitutes and cards like ${targetCard.name} ($${targetCard.price_usd.toFixed(2)}).`,
      author: { '@type': 'Organization', name: 'MTGCheap Data Lab' },
      publisher: { '@type': 'Organization', name: 'MTGCheap' },
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
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
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
            <Link href="/budget-commander" className="text-[#8b949e] hover:text-white transition-colors">
              Budget Hub
            </Link>
            <Link href="/articles" className="text-amber-400 font-bold">
              Card Articles
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-[#8b949e] font-mono">
            <Link href="/" className="hover:text-amber-300">Home</Link>
            <span>/</span>
            <Link href="/budget-commander" className="hover:text-amber-300">Budget Commander</Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-amber-300">Articles</Link>
            <span>/</span>
            <span className="text-amber-400">Budget Analysis</span>
          </div>

          {/* Contextual Parent Cluster Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[#c9d1d9]">
                Part of our <strong className="text-white">Budget Commander Strategy Series</strong>:
              </span>
            </div>
            <Link
              href={
                targetCard.cardRole.includes('Draw')
                  ? '/budget-commander/card-draw'
                  : targetCard.cardRole.includes('Wipe')
                  ? '/budget-commander/board-wipes'
                  : targetCard.cardRole.includes('Removal')
                  ? '/budget-commander/removal'
                  : targetCard.cardRole.includes('Tutor')
                  ? '/budget-commander/tutors'
                  : targetCard.cardRole.includes('Ramp')
                  ? '/budget-commander/ramp'
                  : '/budget-commander/staples'
              }
              className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 shrink-0 ml-2"
            >
              View All {targetCard.cardRole} Guides →
            </Link>
          </div>

          <h1 className="font-cinzel text-3xl sm:text-4xl font-black text-white leading-tight gradient-text-gold">
            Best Cards Like {targetCard.name} (Budget Alternatives & Replacements)
          </h1>

          <p className="text-sm text-[#8b949e] leading-relaxed">
            Looking for a replacement for <strong className="text-white">{targetCard.name}</strong> (${targetCard.price_usd.toFixed(2)})? 
            Whether you&apos;re building a budget Commander deck or upgrading a casual 60-card list, these vector-ranked substitutes deliver 
            comparable <span className="text-amber-300 font-semibold">{targetCard.cardRole}</span> effects for under $5.00.
          </p>

          <div className="flex items-center gap-4 text-xs text-[#8b949e] font-mono border-b border-white/10 pb-6">
            <span>Automated Vector Analysis</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> 5 min read
            </span>
            <span>•</span>
            <span>Updated August 14, 2026</span>
          </div>
        </div>

        {/* Target Card Highlight */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col md:flex-row gap-6 items-center">
          <ExpandableCardImage
            src={targetCard.image_uri}
            alt={`Magic: The Gathering card image for ${targetCard.name} (${targetCard.type_line})`}
            title={targetCard.name}
            sizes="160px"
            className="w-40 shrink-0 aspect-[488/680] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#090d16]"
          />

          <div className="space-y-3 flex-1 text-xs">
            <div className="flex justify-between items-baseline">
              <h2 className="font-cinzel text-xl font-bold text-white">Why Replace {targetCard.name}?</h2>
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
            Top {alternatives.length} Budget Cards Like {targetCard.name} (Ranked by Similarity)
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
                    <ExpandableCardImage
                      src={swap.image_uri}
                      alt={`Magic: The Gathering budget alternative card image for ${swap.name} (${swap.type_line})`}
                      title={swap.name}
                      sizes="112px"
                      className="w-28 shrink-0 aspect-[488/680] rounded-xl overflow-hidden border border-white/10 bg-[#05070a] shadow-xl"
                    />

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

                      {/* Proprietary Analytical Insights: Why Similar */}
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl space-y-1">
                        <div className="text-[11px] font-bold text-emerald-300 font-mono flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Why It&apos;s Similar
                        </div>
                        <p className="text-xs text-[#c9d1d9] leading-relaxed">
                          {swap.why_similar}
                        </p>
                      </div>

                      {/* Proprietary Analytical Insights: Why Not Perfect */}
                      <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl space-y-1">
                        <div className="text-[11px] font-bold text-amber-300 font-mono flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Why It Isn&apos;t A Perfect Replacement (Trade-offs)
                        </div>
                        <p className="text-xs text-[#c9d1d9] leading-relaxed">
                          {swap.why_not_perfect}
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

        {/* FAQ Accordion Section for Long-Tail SEO */}
        <section className="space-y-6 pt-6 border-t border-white/10">
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" /> Frequently Asked Questions About {targetCard.name} Replacements
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group glass-card rounded-2xl p-4 border border-white/10 transition-all [&_summary::-webkit-details-marker]:hidden cursor-pointer"
              >
                <summary className="flex items-center justify-between font-cinzel font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors">
                  <span>{faq.question}</span>
                  <span className="ml-2 font-mono text-amber-400 text-lg transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-[#8b949e] leading-relaxed border-t border-white/5 pt-3">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
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
