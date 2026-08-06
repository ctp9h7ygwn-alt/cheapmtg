import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';

function extractPrimaryTypes(typeLine: string): string[] {
  const primaryTypes = ['Artifact', 'Creature', 'Enchantment', 'Instant', 'Sorcery', 'Planeswalker', 'Land', 'Battle'];
  const matches = primaryTypes.filter((t) => typeLine.toLowerCase().includes(t.toLowerCase()));
  return matches.length > 0 ? matches : ['Artifact'];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetName = searchParams.get('target_card_name');
  const oracleIdParam = searchParams.get('oracle_id');
  const maxPriceParam = searchParams.get('max_price');
  const limitParam = searchParams.get('limit');
  const excludeSilverParam = searchParams.get('exclude_silver_bordered');
  const matchCardTypeParam = searchParams.get('match_card_type');

  const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : 3.00;
  const limit = limitParam ? parseInt(limitParam, 10) : 5;
  const excludeSilver = excludeSilverParam !== null ? excludeSilverParam === 'true' : true;
  const matchCardType = matchCardTypeParam !== null ? matchCardTypeParam === 'true' : false;

  if (!targetName && !oracleIdParam) {
    return NextResponse.json(
      { error: 'Please provide either target_card_name or oracle_id parameter.' },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch Target Card Metadata from DB
    let targetRes;
    if (oracleIdParam) {
      targetRes = await query(
        `SELECT c.*, ce.embedding::text AS embedding_str
         FROM cards c
         LEFT JOIN card_embeddings ce ON c.oracle_id = ce.oracle_id
         WHERE c.oracle_id = $1`,
        [oracleIdParam]
      );
    } else {
      targetRes = await query(
        `SELECT c.*, ce.embedding::text AS embedding_str
         FROM cards c
         LEFT JOIN card_embeddings ce ON c.oracle_id = ce.oracle_id
         WHERE LOWER(c.name) = LOWER($1) 
            OR LOWER(c.name) LIKE LOWER($1) || '%' 
            OR LOWER(c.name) LIKE '%' || LOWER($1) || '%'
            OR REGEXP_REPLACE(LOWER(c.name), '[^a-z0-9]', '', 'g') = REGEXP_REPLACE(LOWER($1), '[^a-z0-9]', '', 'g')
         ORDER BY 
           CASE WHEN LOWER(c.name) = LOWER($1) THEN 0
                WHEN REGEXP_REPLACE(LOWER(c.name), '[^a-z0-9]', '', 'g') = REGEXP_REPLACE(LOWER($1), '[^a-z0-9]', '', 'g') THEN 1
                WHEN LOWER(c.name) LIKE LOWER($1) || '%' THEN 2
                ELSE 3 END,
           c.price_usd DESC NULLS LAST
         LIMIT 1`,
        [targetName]
      );
    }

    let targetCard: any = null;

    if (targetRes.rows.length > 0) {
      targetCard = targetRes.rows[0];
    } else if (targetName) {
      // Fallback: Fetch missing card directly from Scryfall API on demand!
      console.log(`Card "${targetName}" not in DB. Fetching from Scryfall API...`);
      const scryfallRes = await fetch(
        `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(targetName)}`,
        { headers: { 'User-Agent': 'CheapMTG-BudgetSwapEngine/1.0' } }
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
        let priceUsd = card.prices?.usd ? parseFloat(card.prices.usd) : (card.prices?.usd_foil ? parseFloat(card.prices.usd_foil) : null);
        let imageUri = card.image_uris?.normal || card.image_uris?.large || (card.card_faces && card.card_faces[0]?.image_uris?.normal ? card.card_faces[0].image_uris.normal : '');
        const scryfallUri = card.scryfall_uri || `https://scryfall.com/card/${card.id}`;
        const isSilverBordered =
          card.set_type === 'funny' ||
          card.border_color === 'silver' ||
          card.security_stamp === 'acorn' ||
          (oracleText && oracleText.toLowerCase().includes('silver-bordered')) ||
          (oracleText && oracleText.toLowerCase().includes('acorn permanent'));

        // Insert card into DB
        await query(
          `INSERT INTO cards (oracle_id, name, mana_value, colors, color_identity, type_line, oracle_text, price_usd, scryfall_uri, image_uri, is_silver_bordered)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (oracle_id) DO UPDATE SET price_usd = EXCLUDED.price_usd, is_silver_bordered = EXCLUDED.is_silver_bordered`,
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
          is_silver_bordered: isSilverBordered,
          embedding_str: null,
        };
      }
    }

    if (!targetCard) {
      return NextResponse.json({ error: `Target card "${targetName || oracleIdParam}" not found on Scryfall.` }, { status: 404 });
    }

    const targetPrice = targetCard.price_usd ? parseFloat(targetCard.price_usd) : 0;
    const targetPrimaryTypes = extractPrimaryTypes(targetCard.type_line || '');

    // Fetch Target Card Oracle Tags
    const tagsRes = await query(
      `SELECT tag FROM oracle_tags WHERE card_oracle_id = $1`,
      [targetCard.oracle_id]
    );
    const targetTags = tagsRes.rows.map((r: any) => r.tag);

    // 2. Ensure embedding vector exists
    let embeddingSql = targetCard.embedding_str;
    if (!embeddingSql) {
      console.log(`Generating embedding for target card: ${targetCard.name}`);
      const joinedTags = targetTags.join(', ');
      const textToEmbed = `Type: ${targetCard.type_line} | Cost: ${targetCard.mana_value} | Text: ${targetCard.oracle_text} | Tags: ${joinedTags}`;
      const vector = await generateEmbedding(textToEmbed);
      embeddingSql = `[${vector.join(',')}]`;

      // Save generated vector
      await query(
        `INSERT INTO card_embeddings (oracle_id, embedding) VALUES ($1, $2::vector)
         ON CONFLICT (oracle_id) DO UPDATE SET embedding = EXCLUDED.embedding`,
        [targetCard.oracle_id, embeddingSql]
      );
    }

    // 3. Perform Optimized Hybrid SQL Search Query
    const candidatesRes = await query(
      `WITH target_tags AS (
        SELECT tag FROM oracle_tags WHERE card_oracle_id = $1
      ),
      candidate_base AS (
        SELECT 
          c.oracle_id,
          c.name,
          c.mana_value,
          c.colors,
          c.color_identity,
          c.type_line,
          c.oracle_text,
          c.price_usd,
          c.scryfall_uri,
          c.image_uri,
          1 - (ce.embedding <=> $2::vector) AS vector_similarity
        FROM cards c
        JOIN card_embeddings ce ON c.oracle_id = ce.oracle_id
        WHERE c.oracle_id != $1
          AND c.price_usd IS NOT NULL
          AND c.price_usd > 0
          AND c.price_usd <= $3::numeric
          AND c.color_identity <@ $4::text[]
          AND c.type_line NOT ILIKE '%Token%'
          AND c.type_line NOT ILIKE '%Emblem%'
          AND c.type_line NOT ILIKE '%Art Series%'
          AND c.type_line NOT ILIKE '%Card Back%'
          AND c.type_line NOT ILIKE '%Helper%'
          AND (
            $7::boolean = FALSE OR (
              COALESCE(c.is_silver_bordered, FALSE) = FALSE
              AND LOWER(c.oracle_text) NOT LIKE '%silver-bordered%'
              AND LOWER(c.oracle_text) NOT LIKE '%acorn permanent%'
              AND c.scryfall_uri NOT LIKE '%/unh/%'
              AND c.scryfall_uri NOT LIKE '%/ust/%'
              AND c.scryfall_uri NOT LIKE '%/ugl/%'
              AND c.scryfall_uri NOT LIKE '%/und/%'
              AND c.scryfall_uri NOT LIKE '%/unf/%'
            )
          )
          AND (
            $8::boolean = FALSE OR EXISTS (
              SELECT 1 FROM unnest($9::text[]) t WHERE c.type_line ILIKE '%' || t || '%'
            )
          )
        ORDER BY ce.embedding <=> $2::vector ASC
        LIMIT 40
      )
      SELECT 
        cb.*,
        ARRAY(
          SELECT ot.tag FROM oracle_tags ot WHERE ot.card_oracle_id = cb.oracle_id AND ot.tag IN (SELECT tag FROM target_tags)
        ) AS shared_tags,
        (
          SELECT COUNT(*)::int FROM oracle_tags ot WHERE ot.card_oracle_id = cb.oracle_id AND ot.tag IN (SELECT tag FROM target_tags)
        ) AS shared_tag_count
      FROM candidate_base cb
      ORDER BY 
        ((vector_similarity * 0.70) + 
         (LEAST((SELECT COUNT(*)::int FROM oracle_tags ot WHERE ot.card_oracle_id = cb.oracle_id AND ot.tag IN (SELECT tag FROM target_tags)), 5) * 0.05) +
         (CASE WHEN $5::numeric > 0 THEN LEAST(($5::numeric - cb.price_usd) / $5::numeric, 1.0) * 0.10 ELSE 0 END)) DESC,
        vector_similarity DESC
      LIMIT $6`,
      [
        targetCard.oracle_id,
        embeddingSql,
        maxPrice,
        targetCard.color_identity || [],
        targetPrice,
        limit,
        excludeSilver,
        matchCardType,
        targetPrimaryTypes,
      ]
    );

    // 4. Format Recommendations & Calculate Savings
    const alternatives = candidatesRes.rows.map((cand: any) => {
      const price = parseFloat(cand.price_usd);
      const dollarSavings = targetPrice > 0 ? Math.max(0, targetPrice - price) : 0;
      const percentSavings = targetPrice > 0 ? Math.round((dollarSavings / targetPrice) * 100) : 0;
      const similarityScore = Math.max(0, Math.round(cand.vector_similarity * 100));

      const sharedTagsClean = (cand.shared_tags || []).map((t: string) => t.replace('otag:', ''));

      const tcgplayerUrl = `https://www.tcgplayer.com/search/magic/product?q=${encodeURIComponent(cand.name)}&utm_source=cheapmtg`;
      const manaPoolUrl = `https://manapool.com/cards?q=${encodeURIComponent(cand.name)}&ref=cheapmtg`;

      return {
        oracle_id: cand.oracle_id,
        name: cand.name,
        mana_value: parseFloat(cand.mana_value),
        colors: cand.colors,
        color_identity: cand.color_identity,
        type_line: cand.type_line,
        oracle_text: cand.oracle_text,
        price_usd: price,
        scryfall_uri: cand.scryfall_uri,
        image_uri: cand.image_uri,
        similarity_score: similarityScore,
        shared_tag_count: cand.shared_tag_count,
        shared_tags: sharedTagsClean,
        dollar_savings: parseFloat(dollarSavings.toFixed(2)),
        percent_savings: percentSavings,
        tcgplayer_url: tcgplayerUrl,
        manapool_url: manaPoolUrl,
      };
    });

    return NextResponse.json({
      target_card: {
        oracle_id: targetCard.oracle_id,
        name: targetCard.name,
        mana_value: parseFloat(targetCard.mana_value),
        colors: targetCard.colors,
        color_identity: targetCard.color_identity,
        type_line: targetCard.type_line,
        oracle_text: targetCard.oracle_text,
        price_usd: targetPrice,
        scryfall_uri: targetCard.scryfall_uri,
        image_uri: targetCard.image_uri,
        oracle_tags: targetTags.map((t: string) => t.replace('otag:', '')),
        primary_types: targetPrimaryTypes,
      },
      filters: {
        max_price: maxPrice,
        limit,
        exclude_silver_bordered: excludeSilver,
        match_card_type: matchCardType,
      },
      alternatives,
    });
  } catch (err: any) {
    console.error('Budget swap API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
