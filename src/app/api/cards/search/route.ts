import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ cards: [] });
  }

  const searchTerm = q.trim().toLowerCase();

  try {
    // 1. Search local Postgres DB
    const res = await query(
      `SELECT oracle_id, name, type_line, mana_value, color_identity, price_usd, image_uri
       FROM cards
       WHERE LOWER(name) LIKE $1 || '%' OR LOWER(name) LIKE '%' || $1 || '%'
       ORDER BY 
         CASE WHEN LOWER(name) = $1 THEN 0
              WHEN LOWER(name) LIKE $1 || '%' THEN 1
              ELSE 2 END,
         price_usd DESC NULLS LAST
       LIMIT 10`,
      [searchTerm]
    );

    let dbCards = res.rows;

    // 2. If fewer than 5 cards match in DB, query Scryfall API autocomplete
    if (dbCards.length < 5) {
      try {
        const scryfallRes = await fetch(
          `https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchTerm)}&unique=cards`,
          { headers: { 'User-Agent': 'CheapMTG-BudgetSwapEngine/1.0' } }
        );

        if (scryfallRes.ok) {
          const scryfallData = await scryfallRes.json();
          const apiCards = scryfallData.data || [];

          const existingOracleIds = new Set(dbCards.map((c: any) => c.oracle_id));

          for (const card of apiCards) {
            if (card.oracle_id && !existingOracleIds.has(card.oracle_id)) {
              let priceUsd = card.prices?.usd ? parseFloat(card.prices.usd) : (card.prices?.usd_foil ? parseFloat(card.prices.usd_foil) : null);
              let imageUri = card.image_uris?.normal || card.image_uris?.large || (card.card_faces && card.card_faces[0]?.image_uris?.normal ? card.card_faces[0].image_uris.normal : '');

              dbCards.push({
                oracle_id: card.oracle_id,
                name: card.name,
                type_line: card.type_line || '',
                mana_value: card.cmc ?? 0,
                color_identity: card.color_identity || [],
                price_usd: priceUsd,
                image_uri: imageUri,
              });

              existingOracleIds.add(card.oracle_id);
              if (dbCards.length >= 10) break;
            }
          }
        }
      } catch (err) {
        console.warn('Scryfall search fallback failed:', err);
      }
    }

    return NextResponse.json({ cards: dbCards });
  } catch (err: any) {
    console.error('Card search API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
