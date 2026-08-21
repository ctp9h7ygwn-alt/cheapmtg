import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface ParsedCard {
  name: string;
  count: number;
}

interface DeckCardInfo {
  oracle_id: string;
  name: string;
  count: number;
  type_line: string;
  mana_value: number;
  colors: string[];
  color_identity: string[];
  oracle_text: string;
  price_usd: number;
  image_uri: string;
  scryfall_uri: string;
  oracle_tags: string[];
  embedding_str?: string;
  is_commander?: boolean;
}

interface AppliedSwap {
  original_card: DeckCardInfo;
  swap_card: {
    oracle_id: string;
    name: string;
    type_line: string;
    mana_value: number;
    price_usd: number;
    image_uri: string;
    similarity_score: number;
    shared_tags: string[];
    tcgplayer_url: string;
    manapool_url: string;
  };
  dollar_savings: number;
  percent_savings: number;
}

// Helper to extract Moxfield deck ID
function extractMoxfieldId(input: string): string | null {
  const match =
    input.match(/moxfield\.com\/(?:decks|public)\/(?:decks\/)?([a-zA-Z0-9_-]+)/i) ||
    input.match(/moxfield\.com\/decks\/([a-zA-Z0-9_-]+)/i);
  return match ? match[1].split('?')[0].split('/')[0] : null;
}

// Helper to extract Archidekt deck ID
function extractArchidektId(input: string): string | null {
  const match = input.match(/archidekt\.com\/decks\/([0-9]+)/i);
  return match ? match[1].split('?')[0].split('/')[0] : null;
}

function extractMoxfieldCards(data: any): ParsedCard[] {
  const cards: ParsedCard[] = [];
  const parseBoard = (boardObj: any) => {
    if (!boardObj || typeof boardObj !== 'object') return;
    if (Array.isArray(boardObj)) {
      for (const item of boardObj) {
        const name = item.card?.name || item.name;
        const count = item.quantity || item.count || 1;
        if (name && typeof name === 'string') cards.push({ name: name.trim(), count });
      }
    } else {
      for (const [key, info] of Object.entries(boardObj) as any[]) {
        const name = info?.card?.name || info?.name || key;
        const count = info?.quantity || info?.count || 1;
        if (name && typeof name === 'string') cards.push({ name: name.trim(), count });
      }
    }
  };

  // v2 API format
  if (data.commanders) parseBoard(data.commanders);
  if (data.mainboard) parseBoard(data.mainboard);
  if (data.companions) parseBoard(data.companions);
  if (data.signatureSpells) parseBoard(data.signatureSpells);

  // v3 API format
  if (data.boards) {
    if (data.boards.commanders?.cards) parseBoard(data.boards.commanders.cards);
    if (data.boards.mainboard?.cards) parseBoard(data.boards.mainboard.cards);
    if (data.boards.companions?.cards) parseBoard(data.boards.companions.cards);
    if (data.boards.signatureSpells?.cards) parseBoard(data.boards.signatureSpells.cards);
  }

  // Flat card array format
  if (data.cards && Array.isArray(data.cards)) parseBoard(data.cards);

  return cards;
}

// Parse text decklist lines (e.g. "1 Sol Ring", "1x Rhystic Study")
function parseTextDecklist(text: string): ParsedCard[] {
  const lines = text.split('\n');
  const cards: ParsedCard[] = [];

  const SECTION_HEADERS = [
    'commander', 'commanders', 'deck', 'mainboard', 'sideboard', 'maybeboard', 
    'tokens', 'lands', 'creatures', 'artifacts', 'enchantments', 'instants', 'sorceries', 'planeswalkers', 'other'
  ];

  for (const rawLine of lines) {
    let line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('#')) continue;

    // Check if line is a section header like "Commander:" or "COMMANDER"
    const headerCheck = line.replace(/[:]/g, '').trim().toLowerCase();
    if (SECTION_HEADERS.includes(headerCheck)) continue;

    // Remove category tags like #!Commander, #Ramp, etc.
    line = line.replace(/#[^\s]+/g, '').trim();

    // Remove foil tags like *F*, *FOIL*, *E*
    line = line.replace(/\*[a-zA-Z0-9]+\*/g, '').trim();

    // Match "1x Card Name (SET) 123" or "1 Card Name [SET]"
    const match = line.match(/^(\d+)\s*[xX*]?\s+(.+)$/i);
    if (match) {
      const count = parseInt(match[1], 10);
      let name = match[2].trim();
      // Remove set and collector number: (ABC) 123 or [ABC] 123
      name = name.replace(/\s*\([a-zA-Z0-9_-]+\)\s*[a-zA-Z0-9_-]*/g, '');
      name = name.replace(/\s*\[[a-zA-Z0-9_-]+\]\s*[a-zA-Z0-9_-]*/g, '');
      name = name.replace(/\s*\*.*\*\s*$/g, '');
      name = name.trim();

      if (name && !SECTION_HEADERS.includes(name.toLowerCase())) {
        cards.push({ name, count });
      }
    } else if (line.length > 2 && !line.includes(':')) {
      let name = line.replace(/\s*\([a-zA-Z0-9_-]+\)\s*[a-zA-Z0-9_-]*/g, '')
                     .replace(/\s*\[[a-zA-Z0-9_-]+\]\s*[a-zA-Z0-9_-]*/g, '')
                     .trim();
      if (name && !SECTION_HEADERS.includes(name.toLowerCase())) {
        cards.push({ name, count: 1 });
      }
    }
  }

  return cards;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deck_input, target_budget = 100, exclude_silver = true } = body;

    if (!deck_input || typeof deck_input !== 'string') {
      return NextResponse.json({ error: 'Please provide a Moxfield URL, Archidekt URL, or text decklist.' }, { status: 400 });
    }

    let parsedCards: ParsedCard[] = [];
    const moxId = extractMoxfieldId(deck_input);
    const archId = extractArchidektId(deck_input);

    if (moxId) {
      const moxEndpoints = [
        `https://api2.moxfield.com/v2/decks/all/${moxId}`,
        `https://api.moxfield.com/v2/decks/all/${moxId}`,
        `https://api2.moxfield.com/v3/decks/all/${moxId}`,
      ];

      for (const endpoint of moxEndpoints) {
        try {
          const res = await fetch(endpoint, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Accept': 'application/json, text/plain, */*',
              'Accept-Language': 'en-US,en;q=0.9',
              'Referer': 'https://www.moxfield.com/',
            },
            next: { revalidate: 3600 },
          });

          if (res.ok) {
            const data = await res.json();
            const extracted = extractMoxfieldCards(data);
            if (extracted.length > 0) {
              parsedCards = extracted;
              break;
            }
          }
        } catch (e) {
          console.error(`Failed fetching from Moxfield endpoint ${endpoint}:`, e);
        }
      }
    } else if (archId) {
      const archEndpoints = [
        `https://archidekt.com/api/decks/${archId}/`,
        `https://archidekt.com/api/decks/${archId}/small/`,
      ];

      for (const endpoint of archEndpoints) {
        try {
          const res = await fetch(endpoint, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Accept': 'application/json',
            },
            next: { revalidate: 3600 },
          });

          if (res.ok) {
            const data = await res.json();
            const cardsList = data.cards || [];
            for (const c of cardsList) {
              const name = c.card?.oracleCard?.name || c.card?.name;
              if (name) {
                parsedCards.push({ name: name.trim(), count: c.quantity || 1 });
              }
            }
            if (parsedCards.length > 0) break;
          }
        } catch (e) {
          console.error(`Failed fetching from Archidekt endpoint ${endpoint}:`, e);
        }
      }
    }

    // Fallback to text parsing if API didn't populate
    if (parsedCards.length === 0) {
      parsedCards = parseTextDecklist(deck_input);
    }

    if (parsedCards.length === 0) {
      return NextResponse.json(
        {
          error:
            'Could not parse any valid MTG cards. If using a Moxfield or Archidekt link, ensure the deck is set to Public, or click "Export" on the deck site and paste the text decklist directly here.',
        },
        { status: 400 }
      );
    }

    // Query DB for all cards in the deck
    const names = parsedCards.map((c) => c.name);
    const dbRes = await query(
      `SELECT c.oracle_id, c.name, c.mana_value, c.colors, c.color_identity, c.type_line, c.oracle_text, c.price_usd, c.image_uri, c.scryfall_uri, ce.embedding::text as embedding_str
       FROM cards c
       LEFT JOIN card_embeddings ce ON c.oracle_id = ce.oracle_id
       WHERE LOWER(c.name) = ANY($1::text[])`,
      [names.map((n) => n.toLowerCase())]
    );

    const dbMap = new Map<string, any>();
    for (const row of dbRes.rows) {
      dbMap.set(row.name.toLowerCase(), row);
    }

    // Fetch oracle tags for found cards
    const foundOracleIds = dbRes.rows.map((r: any) => r.oracle_id);
    let tagsMap = new Map<string, string[]>();
    if (foundOracleIds.length > 0) {
      const tagsRes = await query(
        `SELECT card_oracle_id, tag FROM oracle_tags WHERE card_oracle_id = ANY($1::uuid[])`,
        [foundOracleIds]
      );
      for (const tRow of tagsRes.rows) {
        const existing = tagsMap.get(tRow.card_oracle_id) || [];
        existing.push(tRow.tag.replace('otag:', ''));
        tagsMap.set(tRow.card_oracle_id, existing);
      }
    }

    const deckCards: DeckCardInfo[] = [];
    let currentTotalCost = 0;

    for (const pCard of parsedCards) {
      const dbCard = dbMap.get(pCard.name.toLowerCase());
      if (dbCard) {
        const price = dbCard.price_usd !== null ? parseFloat(dbCard.price_usd) : 0.50;
        const cardInfo: DeckCardInfo = {
          oracle_id: dbCard.oracle_id,
          name: dbCard.name,
          count: pCard.count,
          type_line: dbCard.type_line || '',
          mana_value: parseFloat(dbCard.mana_value || '0'),
          colors: dbCard.colors || [],
          color_identity: dbCard.color_identity || [],
          oracle_text: dbCard.oracle_text || '',
          price_usd: price,
          image_uri: dbCard.image_uri || '',
          scryfall_uri: dbCard.scryfall_uri || '',
          oracle_tags: tagsMap.get(dbCard.oracle_id) || [],
          embedding_str: dbCard.embedding_str,
        };
        deckCards.push(cardInfo);
        currentTotalCost += price * pCard.count;
      }
    }

    const targetNumBudget = parseFloat(target_budget.toString()) || 100;
    const targetAvgCardPrice = targetNumBudget / Math.max(1, deckCards.length);
    const appliedSwaps: AppliedSwap[] = [];
    const keptCoreCards: DeckCardInfo[] = [];
    let optimizedDeckCost = currentTotalCost;
    const swappedOracleIds = new Set<string>();

    const WINCON_KEYWORDS = [
      'win-condition',
      'alternate-win-condition',
      'wincon',
      'win-con',
      'infinite-combo',
      'combo-piece',
      'game-ender',
      'extra-turn',
      'extra-turns',
    ];

    // Cascading Multi-Pass Reduction Function
    const runSwapPass = async (minCardPrice: number, maxSwapPrice: number, minSavings: number) => {
      const candidates = deckCards
        .filter((c) => c.price_usd >= minCardPrice && !c.is_commander && c.embedding_str && !swappedOracleIds.has(c.oracle_id))
        .sort((a, b) => b.price_usd - a.price_usd);

      for (const card of candidates) {
        if (optimizedDeckCost <= targetNumBudget) break;

        // Check if original card has wincon tags
        const winconOtags = card.oracle_tags
          .filter((t) => WINCON_KEYWORDS.some((kw) => t.toLowerCase().includes(kw)))
          .map((t) => `otag:${t}`);
        const isWinconCard = winconOtags.length > 0;

        const candRes = await query(
          `SELECT c.oracle_id, c.name, c.type_line, c.mana_value, c.price_usd, c.image_uri,
                  (1 - (ce.embedding <=> $1::vector)) as vector_similarity,
                  ARRAY(
                    SELECT ot.tag FROM oracle_tags ot 
                    WHERE ot.card_oracle_id = c.oracle_id 
                    AND ot.tag = ANY($2::text[])
                  ) as shared_tags
           FROM card_embeddings ce
           JOIN cards c ON ce.oracle_id = c.oracle_id
           WHERE c.oracle_id != $3
             AND c.price_usd IS NOT NULL
             AND c.price_usd <= $4
             AND c.price_usd > 0
             AND ($5::text[] IS NULL OR c.color_identity <@ $5::text[])
             AND ($6::boolean = FALSE OR COALESCE(c.is_silver_bordered, FALSE) = FALSE)
             AND ($7::boolean = FALSE OR EXISTS (
               SELECT 1 FROM oracle_tags ot_w
               WHERE ot_w.card_oracle_id = c.oracle_id
               AND (ot_w.tag = ANY($8::text[]) OR ot_w.tag LIKE '%win-condition%' OR ot_w.tag LIKE '%wincon%' OR ot_w.tag LIKE '%alternate-win-condition%')
             ))
           ORDER BY ce.embedding <=> $1::vector ASC
           LIMIT 1`,
          [
            card.embedding_str,
            card.oracle_tags.map((t) => `otag:${t}`),
            card.oracle_id,
            maxSwapPrice,
            card.color_identity,
            exclude_silver,
            isWinconCard,
            winconOtags.length > 0 ? winconOtags : ['otag:win-condition', 'otag:alternate-win-condition'],
          ]
        );

        if (candRes.rows.length > 0) {
          const topCand = candRes.rows[0];
          const candPrice = parseFloat(topCand.price_usd);
          const savingsPerCard = card.price_usd - candPrice;

          if (savingsPerCard >= minSavings) {
            const similarityScore = Math.max(0, Math.round(topCand.vector_similarity * 100));
            const sharedTagsClean = (topCand.shared_tags || []).map((t: string) => t.replace('otag:', ''));

            swappedOracleIds.add(card.oracle_id);
            appliedSwaps.push({
              original_card: card,
              swap_card: {
                oracle_id: topCand.oracle_id,
                name: topCand.name,
                type_line: topCand.type_line,
                mana_value: parseFloat(topCand.mana_value || '0'),
                price_usd: candPrice,
                image_uri: topCand.image_uri,
                similarity_score: similarityScore,
                shared_tags: sharedTagsClean,
                tcgplayer_url: `https://www.tcgplayer.com/search/magic/product?q=${encodeURIComponent(topCand.name)}&utm_source=cheapmtg`,
                manapool_url: `https://manapool.com/cards?q=${encodeURIComponent(topCand.name)}&ref=cheapmtg`,
              },
              dollar_savings: parseFloat((savingsPerCard * card.count).toFixed(2)),
              percent_savings: Math.round((savingsPerCard / card.price_usd) * 100),
            });

            optimizedDeckCost -= savingsPerCard * card.count;
          }
        }
      }
    };

    // Pass 1: High Staples ($5.00+ cards -> $2.50 or 3x average)
    await runSwapPass(5.00, Math.max(0.75, Math.min(2.50, targetAvgCardPrice * 3)), 1.50);

    // Pass 2: Mid-tier Cards ($1.50+ cards -> $1.00 or 2x average)
    if (optimizedDeckCost > targetNumBudget) {
      await runSwapPass(1.50, Math.max(0.40, Math.min(1.00, targetAvgCardPrice * 2)), 0.50);
    }

    // Pass 3: Ultra-Budget Deep Sweep (cards > average -> penny cards <= $0.25)
    if (optimizedDeckCost > targetNumBudget) {
      await runSwapPass(Math.max(0.35, targetAvgCardPrice), Math.max(0.15, Math.min(0.30, targetAvgCardPrice * 1.2)), 0.10);
    }

    // Identify preserved high-value cards not swapped
    for (const card of deckCards) {
      if (card.price_usd >= 3.00 && !swappedOracleIds.has(card.oracle_id)) {
        if (!keptCoreCards.some((k) => k.oracle_id === card.oracle_id)) {
          keptCoreCards.push(card);
        }
      }
    }

    // Build optimized export decklist
    const finalDecklistLines: string[] = [];
    const swapMap = new Map<string, string>();
    for (const swap of appliedSwaps) {
      swapMap.set(swap.original_card.name.toLowerCase(), swap.swap_card.name);
    }

    for (const pCard of parsedCards) {
      const swappedName = swapMap.get(pCard.name.toLowerCase());
      if (swappedName) {
        finalDecklistLines.push(`${pCard.count} ${swappedName}`);
      } else {
        finalDecklistLines.push(`${pCard.count} ${pCard.name}`);
      }
    }

    return NextResponse.json({
      parsed_count: deckCards.length,
      original_deck_price: parseFloat(currentTotalCost.toFixed(2)),
      optimized_deck_price: parseFloat(optimizedDeckCost.toFixed(2)),
      total_savings: parseFloat((currentTotalCost - optimizedDeckCost).toFixed(2)),
      target_budget: targetNumBudget,
      swaps_applied: appliedSwaps,
      kept_core_cards: keptCoreCards,
      optimized_decklist_text: finalDecklistLines.join('\n'),
    });
  } catch (err: any) {
    console.error('Deck Budgetizer Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to process deck budgetizer request.' }, { status: 500 });
  }
}
