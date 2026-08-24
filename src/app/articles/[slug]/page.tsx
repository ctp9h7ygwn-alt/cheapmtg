import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';
import { getCuratedGuide, CuratedCardGuide } from '@/lib/curated-card-swaps';
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
  ShieldAlert,
  AlertTriangle,
  Layers,
  DollarSign,
  Award,
  Flame,
  Check,
  X,
  ChevronRight,
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

async function getArticleData(slug: string) {
  const curated = getCuratedGuide(slug);
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
  } else if (curated) {
    targetCard = {
      oracle_id: curated.cleanSlug,
      name: curated.cardName,
      mana_value: curated.manaValue,
      color_identity: curated.colorIdentity,
      colors: curated.colorIdentity,
      type_line: curated.typeLine,
      oracle_text: curated.oracleText,
      price_usd: curated.marketPrice,
      image_uri: curated.imageUri,
      scryfall_uri: `https://scryfall.com/search?q=${encodeURIComponent(curated.cardName)}`,
      embedding_str: null,
    };
  } else {
    // Scryfall API Fallback
    try {
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

        try {
          await query(
            `INSERT INTO cards (oracle_id, name, mana_value, colors, color_identity, type_line, oracle_text, price_usd, scryfall_uri, image_uri, is_silver_bordered)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             ON CONFLICT (oracle_id) DO UPDATE SET price_usd = EXCLUDED.price_usd`,
            [oracleId, name, manaValue, colors, colorIdentity, typeLine, oracleText, priceUsd, scryfallUri, imageUri, isSilverBordered]
          );
        } catch (dbErr) {
          // ignore db insert failure
        }

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
    } catch (e) {
      // fallback
    }
  }

  if (!targetCard && !curated) return null;

  if (!targetCard && curated) {
    targetCard = {
      oracle_id: curated.cleanSlug,
      name: curated.cardName,
      mana_value: curated.manaValue,
      color_identity: curated.colorIdentity,
      colors: curated.colorIdentity,
      type_line: curated.typeLine,
      oracle_text: curated.oracleText,
      price_usd: curated.marketPrice,
      image_uri: curated.imageUri,
      scryfall_uri: `https://scryfall.com/search?q=${encodeURIComponent(curated.cardName)}`,
      embedding_str: null,
    };
  }

  const targetPrice = targetCard.price_usd ? parseFloat(targetCard.price_usd) : (curated?.marketPrice || 0);

  // Fetch Tags
  let targetTags: string[] = [];
  try {
    const tagsRes = await query(`SELECT tag FROM oracle_tags WHERE card_oracle_id = $1`, [targetCard.oracle_id]);
    targetTags = tagsRes.rows.map((r: any) => r.tag);
  } catch (e) {
    targetTags = [];
  }

  // 2. Compute Alternatives
  let alternatives: any[] = [];

  if (curated) {
    alternatives = curated.alternatives.map((cand, idx) => {
      const price = cand.priceUsd;
      const dollarSavings = targetPrice > 0 ? Math.max(0, targetPrice - price) : 0;
      const percentSavings = targetPrice > 0 ? Math.round((dollarSavings / targetPrice) * 100) : 0;

      return {
        oracle_id: `curated-${idx}`,
        name: cand.name,
        mana_value: cand.manaValue,
        type_line: cand.typeLine,
        oracle_text: cand.oracleText,
        price_usd: price,
        image_uri: cand.imageUri || `https://cards.scryfall.io/normal/front/0/0/00000000-0000-0000-0000-000000000000.jpg`,
        similarity_score: cand.similarityScore,
        shared_tags: cand.sharedTags || [],
        role: cand.role,
        why_similar: cand.whySimilar,
        what_it_does_differently: cand.whatItDoesDifferently,
        advantages: cand.advantages,
        disadvantages: cand.disadvantages,
        ideal_deck_situation: cand.idealDeckSituation,
        dollar_savings: parseFloat(dollarSavings.toFixed(2)),
        percent_savings: percentSavings,
        tcgplayer_url: `https://www.tcgplayer.com/search/magic/product?q=${encodeURIComponent(cand.name)}&utm_source=cheapmtg`,
        manapool_url: `https://manapool.com/cards?q=${encodeURIComponent(cand.name)}&ref=cheapmtg`,
      };
    });
  } else {
    // Dynamic Query Candidates
    try {
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

      alternatives = candidatesRes.rows.map((cand: any, idx: number) => {
        const price = parseFloat(cand.price_usd);
        const dollarSavings = targetPrice > 0 ? Math.max(0, targetPrice - price) : 0;
        const percentSavings = targetPrice > 0 ? Math.round((dollarSavings / targetPrice) * 100) : 0;
        const similarityScore = Math.max(0, Math.round(cand.vector_similarity * 100));

        const candCmc = parseFloat(cand.mana_value || '0');
        const targetCmc = parseFloat(targetCard.mana_value || '0');
        const cmcDiff = targetCmc - candCmc;

        let cmcComparison = '';
        if (cmcDiff > 0) cmcComparison = `costs ${cmcDiff} less mana (${candCmc} MV vs ${targetCmc} MV)`;
        else if (cmcDiff === 0) cmcComparison = `shares the exact same mana value (${candCmc} MV)`;
        else cmcComparison = `costs ${Math.abs(cmcDiff)} more mana (${candCmc} MV vs ${targetCmc} MV)`;

        const targetType = (targetCard.type_line || '').split('—')[0].trim();
        const candType = (cand.type_line || '').split('—')[0].trim();
        const isSameType = targetType.toLowerCase() === candType.toLowerCase();

        const typeSentence = isSameType
          ? `Matches ${targetCard.name}'s ${candType} card type`
          : `Acts as a ${candType} alternative to ${targetCard.name}'s ${targetType}`;

        const sharedTagsClean = (cand.shared_tags || []).map((t: string) => t.replace('otag:', ''));
        const matchedKeyTag = sharedTagsClean.find((t: string) => TAG_DESCRIPTIONS[t]);
        let tagSentence = '';
        if (matchedKeyTag && TAG_DESCRIPTIONS[matchedKeyTag]) {
          tagSentence = `Shares the #${matchedKeyTag} mechanic (${TAG_DESCRIPTIONS[matchedKeyTag]}).`;
        } else if (sharedTagsClean.length > 0) {
          tagSentence = `Overlaps on functional mechanics including #${sharedTagsClean.slice(0, 3).join(', #')}.`;
        } else {
          tagSentence = `Fills a similar strategic role in Commander deck construction.`;
        }

        const whySimilar = `${typeSentence} and ${cmcComparison}. ${tagSentence}`;

        const advantages: string[] = [
          `Costs $${price.toFixed(2)} (${percentSavings}% savings over ${targetCard.name})`,
          `Fills the ${targetCard.type_line.split('—')[0].trim()} curve slot cleanly`,
        ];
        if (candCmc < targetCmc) advantages.push(`Faster casting curve (${candCmc} MV vs ${targetCmc} MV)`);

        const disadvantages: string[] = [];
        if (candCmc > targetCmc) disadvantages.push(`Costs ${candCmc - targetCmc} additional mana to cast`);
        disadvantages.push(`Delivers ${similarityScore}% of the mechanical power ceiling`);

        const role = idx === 0 ? 'best_overall' : idx === 1 ? 'closest_functional' : 'alternative';

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
          role,
          why_similar: whySimilar,
          what_it_does_differently: `Operates with ${similarityScore}% vector similarity while costing $${price.toFixed(2)}.`,
          advantages,
          disadvantages,
          ideal_deck_situation: `Casual and budget Commander decks looking to preserve curve efficiency under $5.`,
          dollar_savings: parseFloat(dollarSavings.toFixed(2)),
          percent_savings: percentSavings,
          tcgplayer_url: `https://www.tcgplayer.com/search/magic/product?q=${encodeURIComponent(cand.name)}&utm_source=cheapmtg`,
          manapool_url: `https://manapool.com/cards?q=${encodeURIComponent(cand.name)}&ref=cheapmtg`,
        };
      });
    } catch (dbErr) {
      alternatives = [];
    }
  }

  // 3. Query Related High-Value Articles for Crawl Mesh
  let relatedArticles: any[] = [];
  try {
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

    relatedArticles = relatedRes.rows.map((row: any) => ({
      oracle_id: row.oracle_id,
      name: row.name,
      type_line: row.type_line,
      price_usd: parseFloat(row.price_usd),
      image_uri: row.image_uri,
      color_identity: row.color_identity || [],
      slug: 'budget-options-for-' + row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
  } catch (e) {
    relatedArticles = [];
  }

  // Functional Role
  const textLower = (targetCard.oracle_text || '').toLowerCase();
  let cardRole = curated?.cardRole || 'Versatile Deck Staple';
  if (!curated) {
    if (textLower.includes('draw')) cardRole = 'Card Advantage Engine';
    else if (textLower.includes('destroy all') || textLower.includes('exile all')) cardRole = 'Board Wipe & Reset';
    else if (textLower.includes('destroy target') || textLower.includes('exile target')) cardRole = 'Single-Target Removal';
    else if (textLower.includes('search your library')) cardRole = 'Tutor & Consistency Helper';
    else if (textLower.includes('add {') || textLower.includes('mana') || textLower.includes('untap')) cardRole = 'Mana Accelerator & Ramp';
  }

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
    curated,
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getArticleData(params.slug);
  if (!data) return { title: 'Article Not Found | MTGCheap' };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';
  const name = data.targetCard.name;
  const colorLabel = getColorLabel(data.targetCard.color_identity);
  const topSavings = data.alternatives[0]?.percent_savings || 90;
  const swapCount = data.alternatives.length;
  const priceDisplay = data.targetCard.price_usd > 0 ? `$${data.targetCard.price_usd.toFixed(2)}` : '';

  return {
    title: `Best ${name} Replacement & Budget Alternatives (Save ${topSavings}%) | MTGCheap`,
    description: `Looking for a ${name} replacement or cards like ${name} (${priceDisplay}) on a budget? Compare top functional alternatives, similarity breakdown, tradeoffs, and EDH recommendations.`,
    keywords: [
      `best ${name.toLowerCase()} replacement`,
      `replacement for ${name.toLowerCase()}`,
      `${name.toLowerCase()} replacement`,
      `budget alternatives to ${name.toLowerCase()}`,
      `cards like ${name.toLowerCase()}`,
      `cards like ${name.toLowerCase()} mtg`,
      `budget ${name.toLowerCase()}`,
      `${name.toLowerCase()} alternatives`,
      `${name.toLowerCase()} budget alternative`,
      `cheap ${name.toLowerCase()} mtg`,
      `${name.toLowerCase()} substitutes edh`,
      `cheapest replacement for ${name.toLowerCase()}`,
      `best ${colorLabel.toLowerCase()} budget cards edh`,
    ],
    alternates: {
      canonical: `${baseUrl}/articles/${params.slug}`,
    },
    openGraph: {
      title: `Best ${name} Replacement & Budget Alternatives (Save ${topSavings}%)`,
      description: `Looking for a ${name} replacement or cards like ${name} (${priceDisplay}) on a budget? Explore top-ranked functional substitutes for Commander.`,
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

  const { targetCard, curated, alternatives, relatedArticles } = data;
  const colorLabel = getColorLabel(targetCard.color_identity);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';
  const canonicalUrl = `${baseUrl}/articles/${params.slug}`;

  const sortedByPrice = [...alternatives].sort((a, b) => a.price_usd - b.price_usd);
  const cheapestAlt = sortedByPrice[0] || alternatives[0];
  const bestOverallAlt = alternatives.find((a) => a.role === 'best_overall') || alternatives[0];
  const closestFunctionalAlt = alternatives.find((a) => a.role === 'closest_functional') || alternatives[1] || alternatives[0];

  // Natural SEO FAQs
  const defaultFaqs = [
    {
      question: `What is the best budget alternative to ${targetCard.name}?`,
      answer: bestOverallAlt
        ? `${bestOverallAlt.name} ($${bestOverallAlt.price_usd.toFixed(2)}) is the best overall alternative to ${targetCard.name} ($${targetCard.price_usd.toFixed(2)}), saving $${bestOverallAlt.dollar_savings.toFixed(2)} (${bestOverallAlt.percent_savings}% savings) with a ${bestOverallAlt.similarity_score}% functional vector match.`
        : `Functional budget replacements for ${targetCard.name} are available for under $5.00 on MTGCheap.`,
    },
    {
      question: `What cards are like ${targetCard.name} in MTG?`,
      answer: alternatives.length > 0
        ? `Cards like ${targetCard.name} include ${alternatives.slice(0, 4).map((a) => `${a.name} ($${a.price_usd.toFixed(2)})`).join(', ')}. These cards share similar mana curves, mechanics, and strategic roles in Commander.`
        : `Multiple alternatives exist that share ${targetCard.name}'s functional role.`,
    },
    {
      question: `What is the cheapest replacement for ${targetCard.name}?`,
      answer: cheapestAlt
        ? `${cheapestAlt.name} ($${cheapestAlt.price_usd.toFixed(2)}) is the most affordable replacement, saving over ${cheapestAlt.percent_savings}% compared to ${targetCard.name}.`
        : `Budget substitutes are available for under $1.00.`,
    },
    {
      question: `Why would a player want a replacement for ${targetCard.name}?`,
      answer: targetCard.price_usd > 0
        ? `At $${targetCard.price_usd.toFixed(2)}, ${targetCard.name} represents a substantial financial barrier for casual Commander decks, budget league builds, or players testing new color identities.`
        : `Players seek budget alternatives to reduce overall deck cost while maintaining competitive curve efficiency.`,
    },
    {
      question: `When should a player NOT use a cheaper alternative to ${targetCard.name}?`,
      answer: curated?.whenNotToSwap || `In top-tier competitive cEDH pods or tournaments where minor efficiency differences (such as 1-mana differences or unconditional instant speed) decide matches, the original staple remains optimal.`,
    },
  ];

  const faqs = curated?.customFaqs && curated.customFaqs.length > 0 ? curated.customFaqs : defaultFaqs;

  // JSON-LD Structured Data
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `Budget Alternatives to ${targetCard.name} (Top Replacements & Savings)`,
      description: `Definitive functional budget alternatives and cards like ${targetCard.name} ($${targetCard.price_usd.toFixed(2)}).`,
      author: { '@type': 'Organization', name: 'MTGCheap Data Lab' },
      publisher: { '@type': 'Organization', name: 'MTGCheap' },
      datePublished: '2026-08-01',
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
          name: 'Budget Commander',
          item: `${baseUrl}/budget-commander`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Articles',
          item: `${baseUrl}/articles`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: `Budget ${targetCard.name}`,
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
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Best Budget Alternatives to ${targetCard.name}`,
      itemListElement: alternatives.map((alt, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: alt.name,
        description: `${alt.name} ($${alt.price_usd.toFixed(2)}) - ${alt.similarity_score}% functional match to ${targetCard.name}.`,
      })),
    },
  ];

  // Category Link mapping
  const categoryHubSlug = curated?.relatedHubSlug || (
    targetCard.cardRole.includes('Draw')
      ? 'card-draw'
      : targetCard.cardRole.includes('Wipe')
      ? 'board-wipes'
      : targetCard.cardRole.includes('Removal')
      ? 'removal'
      : targetCard.cardRole.includes('Tutor')
      ? 'tutors'
      : targetCard.cardRole.includes('Ramp') || targetCard.cardRole.includes('Untap') || targetCard.cardRole.includes('Mana')
      ? 'ramp'
      : 'staples'
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-[#f0f6fc] relative selection:bg-amber-500/30 selection:text-amber-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Ambient background styling */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle 600px at 20% 0%, rgba(245, 158, 11, 0.08), transparent 70%),
            radial-gradient(circle 600px at 80% 30%, rgba(6, 182, 212, 0.06), transparent 70%)
          `,
          transform: 'translateZ(0)',
        }}
      />

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
            <Link href="/budget-commander" className="text-[#8b949e] hover:text-white transition-colors">
              Budget Hub
            </Link>
            <Link href="/articles" className="text-amber-400 font-bold border-b border-amber-400 pb-0.5">
              Card Articles
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 relative z-10">
        
        {/* Breadcrumb & Strategy Series Hub Link */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-[#8b949e] font-mono">
            <Link href="/" className="hover:text-amber-300">Home</Link>
            <span>/</span>
            <Link href="/budget-commander" className="hover:text-amber-300">Budget Commander</Link>
            <span>/</span>
            <Link href={`/budget-commander/${categoryHubSlug}`} className="hover:text-amber-300 capitalize">{categoryHubSlug.replace(/-/g, ' ')}</Link>
            <span>/</span>
            <span className="text-amber-400">Budget {targetCard.name}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[#c9d1d9]">
                Part of our <strong className="text-white">Budget Commander Hub</strong>:
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/budget-commander/${categoryHubSlug}`}
                className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1"
              >
                View {curated?.relatedCategoryName || `${targetCard.cardRole} Hub`} →
              </Link>
              <Link
                href="/budget-commander/cards-under-1-dollar"
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                Cards Under $1 →
              </Link>
            </div>
          </div>

          {/* Section 1: H1 & Opening Problem Paragraph */}
          <div className="space-y-3">
            <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white leading-tight gradient-text-gold">
              Budget Alternatives to {targetCard.name}
            </h1>

            <p className="text-sm sm:text-base text-[#c9d1d9] leading-relaxed">
              {curated?.summaryProblem || (
                <>
                  Looking for a functional budget replacement for <strong className="text-white">{targetCard.name}</strong> (${targetCard.price_usd.toFixed(2)})? 
                  Whether you&apos;re brewing a 100-card Commander deck, upgrading a budget league list, or trying to avoid spending over $50 on cardboard, 
                  these vector-analyzed substitutes deliver comparable <span className="text-amber-300 font-semibold">{targetCard.cardRole}</span> power 
                  for a fraction of the cost.
                </>
              )}
            </p>

            <div className="flex items-center gap-4 text-xs text-[#8b949e] font-mono border-b border-white/10 pb-4">
              <span>By MTGCheap Data Lab</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> 6 min read
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">Updated August 2026</span>
            </div>
          </div>
        </div>

        {/* Section 2: Quick Answer Box (Top 3-5 Alternatives Immediately) */}
        <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-[#070b12]/90 space-y-5 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> Quick Answer: Best Replacements
              </div>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
                Top 3 Substitutes for {targetCard.name} at a Glance
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-[#8b949e]">Original Price: </span>
              <span className="font-mono text-base font-black text-amber-400">${targetCard.price_usd.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Best Overall Highlight */}
            {bestOverallAlt && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-black">
                    <Award className="w-3 h-3" /> BEST OVERALL
                  </div>
                  <h3 className="font-cinzel text-base font-bold text-white">{bestOverallAlt.name}</h3>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">${bestOverallAlt.price_usd.toFixed(2)}</span>
                    <span className="text-amber-300 font-bold">Save {bestOverallAlt.percent_savings}%</span>
                  </div>
                  <p className="text-[11px] text-[#c9d1d9] leading-relaxed pt-1">
                    {curated?.bestOverallReason || bestOverallAlt.why_similar}
                  </p>
                </div>
                <div className="pt-2 text-[10px] text-cyan-300 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {bestOverallAlt.similarity_score}% Match
                </div>
              </div>
            )}

            {/* Cheapest Highlight */}
            {cheapestAlt && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500 text-black">
                    <TrendingDown className="w-3 h-3" /> CHEAPEST VIABLE
                  </div>
                  <h3 className="font-cinzel text-base font-bold text-white">{cheapestAlt.name}</h3>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">${cheapestAlt.price_usd.toFixed(2)}</span>
                    <span className="text-emerald-300 font-bold">Save {cheapestAlt.percent_savings}%</span>
                  </div>
                  <p className="text-[11px] text-[#c9d1d9] leading-relaxed pt-1">
                    {curated?.cheapestReason || cheapestAlt.why_similar}
                  </p>
                </div>
                <div className="pt-2 text-[10px] text-cyan-300 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {cheapestAlt.similarity_score}% Match
                </div>
              </div>
            )}

            {/* Closest Functional Highlight */}
            {closestFunctionalAlt && (
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500 text-black">
                    <ShieldCheck className="w-3 h-3" /> CLOSEST 1:1 MATCH
                  </div>
                  <h3 className="font-cinzel text-base font-bold text-white">{closestFunctionalAlt.name}</h3>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">${closestFunctionalAlt.price_usd.toFixed(2)}</span>
                    <span className="text-cyan-300 font-bold">Save {closestFunctionalAlt.percent_savings}%</span>
                  </div>
                  <p className="text-[11px] text-[#c9d1d9] leading-relaxed pt-1">
                    {curated?.closestFunctionalReason || closestFunctionalAlt.why_similar}
                  </p>
                </div>
                <div className="pt-2 text-[10px] text-cyan-300 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {closestFunctionalAlt.similarity_score}% Match
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Target Card Deep Breakdown */}
        <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <ExpandableCardImage
              src={targetCard.image_uri}
              alt={`Magic: The Gathering card image for ${targetCard.name} (${targetCard.type_line})`}
              title={targetCard.name}
              sizes="160px"
              className="w-44 shrink-0 aspect-[488/680] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#090d16]"
            />

            <div className="space-y-4 flex-1 text-xs">
              <div className="flex flex-wrap justify-between items-baseline gap-2">
                <div>
                  <h2 className="font-cinzel text-2xl font-bold text-white">{targetCard.name}</h2>
                  <div className="text-xs text-[#8b949e] font-mono">{targetCard.type_line}</div>
                </div>
                <span className="font-mono text-xl font-black text-amber-400">${targetCard.price_usd.toFixed(2)} Market</span>
              </div>

              <div className="bg-[#05070a]/90 p-4 rounded-xl border border-white/10 font-serif italic text-xs leading-relaxed text-[#f0f6fc]">
                {targetCard.oracle_text}
              </div>

              <div className="space-y-2 text-[#c9d1d9]">
                <div>
                  <strong className="text-white">Why It&apos;s Expensive: </strong>
                  {curated?.whyExpensive || `${targetCard.name} is a high-demand staple in Commander and competitive constructed formats due to its efficient mana value and game-defining ${targetCard.cardRole.toLowerCase()} mechanics.`}
                </div>
              </div>

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
        </section>

        {/* Section 4: How Much Can You Save? (Comparison Matrix Table) */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-cinzel text-2xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" /> How Much Can You Save? (Price &amp; Similarity Matrix)
            </h2>
            <p className="text-xs text-[#8b949e]">
              Direct financial comparison between {targetCard.name} and top budget alternatives.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#070b12]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] text-[#8b949e] font-mono uppercase text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-3.5">Card Name</th>
                  <th className="p-3.5">Card Type &amp; CMC</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Savings ($)</th>
                  <th className="p-3.5">Savings (%)</th>
                  <th className="p-3.5">Vector Similarity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                <tr className="bg-amber-500/5 font-bold">
                  <td className="p-3.5 text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    {targetCard.name} (Original)
                  </td>
                  <td className="p-3.5 text-[#8b949e]">{targetCard.type_line.split('—')[0]}</td>
                  <td className="p-3.5 text-amber-400">${targetCard.price_usd.toFixed(2)}</td>
                  <td className="p-3.5 text-[#8b949e]">—</td>
                  <td className="p-3.5 text-[#8b949e]">—</td>
                  <td className="p-3.5 text-amber-300">100% (Baseline)</td>
                </tr>
                {alternatives.map((swap, idx) => (
                  <tr key={swap.name} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 text-white font-sans font-semibold">
                      #{idx + 1} {swap.name}
                    </td>
                    <td className="p-3.5 text-[#8b949e]">{swap.type_line.split('—')[0]} ({swap.mana_value} MV)</td>
                    <td className="p-3.5 text-emerald-400 font-bold">${swap.price_usd.toFixed(2)}</td>
                    <td className="p-3.5 text-emerald-300 font-bold">${swap.dollar_savings.toFixed(2)}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">{swap.percent_savings}%</td>
                    <td className="p-3.5 text-cyan-300">{swap.similarity_score}% Match</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Deep-Dive Card by Card Alternatives */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-cinzel text-2xl font-bold text-white border-b border-white/10 pb-3">
              In-Depth Analysis: Best Alternatives to {targetCard.name}
            </h2>
            <p className="text-xs text-[#8b949e]">
              Detailed mechanical similarities, differences, advantages, disadvantages, and ideal deck situations for each substitute.
            </p>
          </div>

          <div className="space-y-8">
            {alternatives.map((swap, idx) => (
              <div key={swap.name} className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
                {/* Header & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-mono font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white inline">{swap.name}</h3>
                      <span className="text-xs text-[#8b949e] ml-2 font-mono">({swap.type_line} • {swap.mana_value} MV)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-extrabold text-emerald-400">${swap.price_usd.toFixed(2)}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Save {swap.percent_savings}%
                    </span>
                  </div>
                </div>

                {/* Card Image & Body Grid */}
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <ExpandableCardImage
                    src={swap.image_uri}
                    alt={`Magic: The Gathering budget alternative card image for ${swap.name} (${swap.type_line})`}
                    title={swap.name}
                    sizes="128px"
                    className="w-32 sm:w-36 shrink-0 aspect-[488/680] rounded-xl overflow-hidden border border-white/10 bg-[#05070a] shadow-xl"
                  />

                  <div className="space-y-4 flex-1 text-xs">
                    {/* Similarity score bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-cyan-300 font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> {swap.similarity_score}% Vector Similarity Match
                        </span>
                        <span className="text-[#8b949e]">Under $5.00</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full"
                          style={{ width: `${swap.similarity_score}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Oracle Text */}
                    <p className="bg-[#05070a]/90 p-3.5 rounded-xl border border-white/10 font-serif italic text-xs leading-relaxed text-[#f0f6fc]">
                      {swap.oracle_text}
                    </p>

                    {/* Why Similar */}
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl space-y-1">
                      <div className="text-[11px] font-bold text-emerald-300 font-mono flex items-center gap-1.5 uppercase">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Why It&apos;s A Strong Alternative
                      </div>
                      <p className="text-xs text-[#c9d1d9] leading-relaxed">
                        {swap.why_similar}
                      </p>
                    </div>

                    {/* Pros and Cons Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 space-y-1.5">
                        <div className="font-mono font-bold text-[10px] text-emerald-400 uppercase flex items-center gap-1">
                          <Check className="w-3 h-3" /> Key Advantages
                        </div>
                        <ul className="space-y-1 text-[11px] text-[#c9d1d9]">
                          {(swap.advantages || []).map((adv: string, aIdx: number) => (
                            <li key={aIdx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">•</span> {adv}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 space-y-1.5">
                        <div className="font-mono font-bold text-[10px] text-amber-400 uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Trade-offs &amp; Nuance
                        </div>
                        <ul className="space-y-1 text-[11px] text-[#c9d1d9]">
                          {(swap.disadvantages || []).map((dis: string, dIdx: number) => (
                            <li key={dIdx} className="flex items-start gap-1.5">
                              <span className="text-amber-400 font-bold">•</span> {dis}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Ideal Deck Situation */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-[#8b949e]">
                      <strong className="text-white">Ideal Deck Context: </strong>
                      {swap.ideal_deck_situation}
                    </div>

                    {/* Shared Tags */}
                    {swap.shared_tags && swap.shared_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {swap.shared_tags.map((t: string) => (
                          <span key={t} className="px-2.5 py-0.5 rounded-md font-mono text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Affiliate Buy Links */}
                <div className="pt-3 border-t border-white/5 flex flex-wrap gap-3 justify-end items-center">
                  <span className="text-[11px] text-[#8b949e] mr-auto hidden sm:inline">Support MTGCheap via verified marketplace links:</span>
                  <a
                    href={swap.tcgplayer_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-xs rounded-xl hover:brightness-110 transition-all flex items-center gap-1 shadow-md shadow-amber-500/20"
                  >
                    Buy on TCGplayer <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={swap.manapool_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="px-4 py-2 bg-white/5 text-white font-semibold text-xs rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1"
                  >
                    Mana Pool <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Which Alternative Should You Choose? (Archetype Matrix) */}
        <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
          <div className="space-y-1">
            <h2 className="font-cinzel text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" /> Which Alternative Should You Choose?
            </h2>
            <p className="text-xs text-[#8b949e]">
              Match the right replacement card to your specific commander archetype and deck strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {(curated?.archetypeGuidance || [
              { archetype: 'Competitive / High Velocity', recommendedCard: bestOverallAlt?.name || 'Best Overall', rationale: `Maximizes mana efficiency and replicates ${targetCard.name}'s primary trigger role.` },
              { archetype: 'Ultra-Budget / Casual Pods', recommendedCard: cheapestAlt?.name || 'Cheapest Alt', rationale: `Reduces total deck cost below $50 while keeping the curve active.` },
              { archetype: 'Synergy-Driven Strategies', recommendedCard: closestFunctionalAlt?.name || 'Closest Match', rationale: `Interacts directly with creature types, enchantments, or artifact themes.` },
            ]).map((guide, gIdx) => (
              <div key={gIdx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase">{guide.archetype}</div>
                <div className="font-cinzel text-base font-bold text-white">{guide.recommendedCard}</div>
                <p className="text-[11px] text-[#8b949e] leading-relaxed">{guide.rationale}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7: When NOT to Swap (Trade-off Warnings) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-red-500/10 border border-red-500/30 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs uppercase">
            <ShieldAlert className="w-4 h-4" /> Competitive Nuance: When NOT to Use A Replacement
          </div>
          <h2 className="font-cinzel text-xl font-bold text-white">
            When Is {targetCard.name} Irreplaceable?
          </h2>
          <p className="text-xs sm:text-sm text-[#c9d1d9] leading-relaxed">
            {curated?.whenNotToSwap || (
              `If your deck relies on specific infinite combo lines that require ${targetCard.name}'s exact mana cost, unconditional timing, or unique text interaction, budget alternatives may not provide 100% parity. For casual Commander, mid-power EDH, and local game store play, the substitutes above deliver 90%+ functionality without the $${targetCard.price_usd.toFixed(2)} price tag.`
            )}
          </p>
        </section>

        {/* Section 8: FAQ Accordion Section for SEO Long-Tail */}
        <section className="space-y-6 pt-4 border-t border-white/10">
          <div className="space-y-1">
            <h2 className="font-cinzel text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" /> Frequently Asked Questions About {targetCard.name} Alternatives
            </h2>
            <p className="text-xs text-[#8b949e]">Answers to the most common deckbuilding and replacement queries.</p>
          </div>

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

        {/* Section 9: Crawlable Internal Linking Mesh */}
        <section className="space-y-6 pt-6 border-t border-white/10">
          <div className="space-y-1">
            <h2 className="font-cinzel text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Explore More Budget MTG Guides &amp; Tools
            </h2>
            <p className="text-xs text-[#8b949e]">
              Continue optimizing your deck with our dedicated strategy hubs, card replacement engines, and price filters.
            </p>
          </div>

          {/* Related High-Value Staples */}
          {relatedArticles && relatedArticles.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase">Related Expensive Card Swaps:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {relatedArticles.map((rel: any) => (
                  <Link
                    key={rel.oracle_id}
                    href={`/articles/${rel.slug}`}
                    className="glass-card rounded-2xl p-3.5 border border-white/10 hover:border-amber-500/50 hover:-translate-y-0.5 transition-all group space-y-1"
                  >
                    <div className="font-cinzel font-bold text-xs text-white group-hover:text-amber-300 transition-colors truncate">
                      {rel.name}
                    </div>
                    <div className="text-[10px] text-[#8b949e] font-mono">${rel.price_usd.toFixed(0)} Market</div>
                    <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1 pt-1">
                      View Budget Swaps →
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Hub Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <Link
              href={`/budget-commander/${categoryHubSlug}`}
              className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 text-center space-y-1"
            >
              <div className="font-bold text-white capitalize">{categoryHubSlug.replace(/-/g, ' ')} Hub</div>
              <div className="text-[10px] text-[#8b949e]">Category Guide</div>
            </Link>
            <Link
              href="/budget-commander/cards-under-1-dollar"
              className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 text-center space-y-1"
            >
              <div className="font-bold text-emerald-400">Cards Under $1</div>
              <div className="text-[10px] text-[#8b949e]">Penny Staples</div>
            </Link>
            <Link
              href="/budget-commander/cards-under-2-dollars"
              className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 text-center space-y-1"
            >
              <div className="font-bold text-amber-300">Cards Under $2</div>
              <div className="text-[10px] text-[#8b949e]">Mid-Budget Tier</div>
            </Link>
            <Link
              href="/deck-budgetizer"
              className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 text-center space-y-1"
            >
              <div className="font-bold text-cyan-300">Deck Budgetizer</div>
              <div className="text-[10px] text-[#8b949e]">Cost Reducer Tool</div>
            </Link>
          </div>
        </section>

        {/* Section 10: Interactive Swap Tool CTA */}
        <section className="glass-panel rounded-3xl p-8 border border-white/10 text-center space-y-4 shadow-2xl">
          <h3 className="font-cinzel text-2xl font-bold text-white">Find Swaps for Any Card with the MTGCheap Engine</h3>
          <p className="text-xs text-[#8b949e] max-w-lg mx-auto">
            Use our local PostgreSQL pgvector engine to search any card in Magic: The Gathering and filter by custom price ceilings, strict card types, and Commander color identity.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold text-sm rounded-xl shadow-xl hover:brightness-110 transition-all"
            >
              Open Swap Engine <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/deck-budgetizer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-white font-semibold text-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all"
            >
              Budgetize Whole Decklist <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
