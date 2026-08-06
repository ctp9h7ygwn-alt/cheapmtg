import dotenv from 'dotenv';
dotenv.config();

import { pool } from '../src/lib/db';
import { getEmbeddingPipeline } from '../src/lib/embeddings';
import readline from 'readline';
import zlib from 'zlib';
import https from 'https';
import http from 'http';

// Parse command line arguments
const args = process.argv.slice(2);
let cardLimit: number | null = null;
const limitIdx = args.indexOf('--limit');
if (limitIdx !== -1 && args[limitIdx + 1]) {
  cardLimit = parseInt(args[limitIdx + 1], 10);
}

interface ScryfallBulkItem {
  type: string;
  jsonl_download_uri?: string;
  download_uri?: string;
}

interface CardMetadata {
  oracle_id: string;
  name: string;
  mana_value: number;
  colors: string[];
  color_identity: string[];
  type_line: string;
  oracle_text: string;
  price_usd: number | null;
  scryfall_uri: string;
  image_uri: string;
  mana_cost: string;
}

function fetchStream(url: string): Promise<NodeJS.ReadableStream> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'CheapMTG-BudgetSwapEngine/1.0',
        'Accept': '*/*',
      }
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchStream(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}, status code: ${res.statusCode}`));
      }
      resolve(res);
    });
    req.on('error', reject);
  });
}

async function getBulkDataUrls() {
  console.log('Fetching Scryfall bulk data index...');
  const res = await fetch('https://api.scryfall.com/bulk-data', {
    headers: { 'User-Agent': 'CheapMTG-BudgetSwapEngine/1.0' }
  });
  if (!res.ok) {
    throw new Error(`Scryfall API error: ${res.statusText}`);
  }
  const json = await res.json();
  const data: ScryfallBulkItem[] = json.data;

  const oracleCards = data.find((item) => item.type === 'oracle_cards');
  const oracleTags = data.find((item) => item.type === 'oracle_tags');

  const cardsUri = oracleCards?.jsonl_download_uri || oracleCards?.download_uri;
  const tagsUri = oracleTags?.jsonl_download_uri || oracleTags?.download_uri;

  if (!cardsUri) throw new Error('Could not find oracle_cards download URI');

  return { cardsUri, tagsUri };
}

async function ingestTags(tagsUri: string | undefined): Promise<Map<string, Set<string>>> {
  const tagMap = new Map<string, Set<string>>();
  if (!tagsUri) {
    console.warn('No oracle_tags URI found, skipping otag ingestion.');
    return tagMap;
  }

  console.log(`Downloading and parsing oracle_tags from: ${tagsUri}...`);
  const stream = await fetchStream(tagsUri);
  const decompressed = tagsUri.endsWith('.gz') ? stream.pipe(zlib.createGunzip()) : stream;
  const rl = readline.createInterface({ input: decompressed, crlfDelay: Infinity });

  let tagCount = 0;
  const dbClient = await pool.connect();

  try {
    await dbClient.query('BEGIN');
    
    // Clear tags table
    await dbClient.query('TRUNCATE TABLE oracle_tags RESTART IDENTITY');

    for await (const line of rl) {
      if (!line.trim()) continue;
      try {
        const item = JSON.parse(line);
        if (item.object === 'tag' && item.slug && Array.isArray(item.taggings)) {
          const tagSlug = `otag:${item.slug}`;
          for (const tagging of item.taggings) {
            if (tagging.oracle_id) {
              const oId = tagging.oracle_id;
              if (!tagMap.has(oId)) {
                tagMap.set(oId, new Set());
              }
              tagMap.get(oId)!.add(tagSlug);

              // Direct insert into DB
              await dbClient.query(
                `INSERT INTO oracle_tags (card_oracle_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [oId, tagSlug]
              );
              tagCount++;
            }
          }
        }
      } catch (err) {
        // Ignore single line JSON parse errors
      }
    }
    await dbClient.query('COMMIT');
    console.log(`Finished ingesting ${tagCount} tag associations for ${tagMap.size} cards.`);
  } catch (err) {
    await dbClient.query('ROLLBACK');
    console.error('Error during tag ingestion:', err);
  } finally {
    dbClient.release();
  }

  return tagMap;
}

// Fallback tag extractor from card oracle text
function extractRuleTags(typeLine: string, oracleText: string): Set<string> {
  const ruleTags = new Set<string>();
  const text = (oracleText || '').toLowerCase();
  const type = (typeLine || '').toLowerCase();

  if (text.includes('counter target spell') || text.includes('counter target noncreature')) {
    ruleTags.add('otag:counterspell');
  }
  if (text.includes('destroy all') || text.includes('exile all') || text.includes('each player sacrifices')) {
    ruleTags.add('otag:board-wipe');
  }
  if (text.includes('return all') || text.includes('return target') && text.includes('to its owner\'s hand')) {
    ruleTags.add('otag:mass-bounce');
  }
  if (text.includes('search your library for a land') || text.includes('search your library for a basic land')) {
    ruleTags.add('otag:ramp-land');
  }
  if (text.includes('draw') && (text.includes('card') || text.includes('cards'))) {
    ruleTags.add('otag:card-draw');
  }
  if (text.includes('search your library') && !text.includes('land')) {
    ruleTags.add('otag:tutor');
  }
  if (text.includes('destroy target') || text.includes('exile target')) {
    ruleTags.add('otag:removal');
  }
  if (type.includes('land')) {
    ruleTags.add('otag:land');
  }
  if (type.includes('creature')) {
    ruleTags.add('otag:creature');
  }
  return ruleTags;
}

async function main() {
  console.log('=== MTG BUDGET SWAP ENGINE - DATA INGESTION ===');
  if (cardLimit) {
    console.log(`Limit set: processing up to ${cardLimit} cards.`);
  } else {
    console.log(`Processing FULL dataset.`);
  }

  const { cardsUri, tagsUri } = await getBulkDataUrls();

  // 1. Ingest Tags
  const tagMap = await ingestTags(tagsUri);

  // 2. Initialize Transformer pipeline
  console.log('Initializing local embedding model (Xenova/all-MiniLM-L6-v2)...');
  const pipe = await getEmbeddingPipeline();

  // 3. Download & Process Oracle Cards
  console.log(`Downloading oracle_cards from: ${cardsUri}...`);
  const stream = await fetchStream(cardsUri);
  const decompressed = cardsUri.endsWith('.gz') ? stream.pipe(zlib.createGunzip()) : stream;
  const rl = readline.createInterface({ input: decompressed, crlfDelay: Infinity });

  let processedCount = 0;
  const batchSize = 50;
  let cardBatch: CardMetadata[] = [];
  let embeddingTextBatch: { oracle_id: string; text: string }[] = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    if (cardLimit && processedCount >= cardLimit) break;

    try {
      const card = JSON.parse(line);

      // We focus on standard paper cards with oracle_id
      if (!card.oracle_id || card.layout === 'art_series' || card.layout === 'token') continue;

      const oracleId = card.oracle_id;
      const name = card.name;
      const manaValue = card.cmc ?? 0;
      const colors = card.colors || [];
      const colorIdentity = card.color_identity || [];
      const typeLine = card.type_line || '';
      const oracleText = card.oracle_text || (card.card_faces ? card.card_faces.map((f: any) => f.oracle_text).join(' // ') : '');
      const manaCost = card.mana_cost || (card.card_faces ? card.card_faces.map((f: any) => f.mana_cost).join(' // ') : '');

      let priceUsd: number | null = null;
      if (card.prices?.usd) {
        priceUsd = parseFloat(card.prices.usd);
      } else if (card.prices?.usd_foil) {
        priceUsd = parseFloat(card.prices.usd_foil);
      }

      let imageUri = '';
      if (card.image_uris?.normal) {
        imageUri = card.image_uris.normal;
      } else if (card.image_uris?.large) {
        imageUri = card.image_uris.large;
      } else if (card.card_faces && card.card_faces[0]?.image_uris?.normal) {
        imageUri = card.card_faces[0].image_uris.normal;
      }

      const scryfallUri = card.scryfall_uri || `https://scryfall.com/card/${card.id}`;

      // Combine tags from Scryfall Tagger + Rule-based fallback tags
      const otags = tagMap.get(oracleId) || new Set<string>();
      const ruleTags = extractRuleTags(typeLine, oracleText);
      ruleTags.forEach((t) => otags.add(t));
      const joinedTags = Array.from(otags).join(', ');

      const isSilverBordered = 
        card.set_type === 'funny' ||
        card.border_color === 'silver' ||
        card.security_stamp === 'acorn' ||
        (card.oracle_text && card.oracle_text.toLowerCase().includes('silver-bordered')) ||
        (card.oracle_text && card.oracle_text.toLowerCase().includes('acorn permanent'));

      const metadata: CardMetadata & { is_silver_bordered: boolean } = {
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
        mana_cost: manaCost,
        is_silver_bordered: isSilverBordered,
      };

      // Construct embedding input string:
      // Type: {type_line} | Cost: {mana_cost} | Text: {oracle_text} | Tags: {joined_otags}
      const embeddingText = `Type: ${typeLine} | Cost: ${manaCost || 'CMC ' + manaValue} | Text: ${oracleText} | Tags: ${joinedTags}`;

      cardBatch.push(metadata);
      embeddingTextBatch.push({ oracle_id: oracleId, text: embeddingText });
      processedCount++;

      // Process batch
      if (cardBatch.length >= batchSize) {
        await processBatch(cardBatch, embeddingTextBatch, pipe);
        console.log(`Processed and embedded ${processedCount} cards...`);
        cardBatch = [];
        embeddingTextBatch = [];
      }
    } catch (err) {
      // Ignore invalid JSON lines
    }
  }

  if (cardBatch.length > 0) {
    await processBatch(cardBatch, embeddingTextBatch, pipe);
    console.log(`Processed and embedded final ${processedCount} cards.`);
  }

  console.log('=== DATA INGESTION COMPLETE ===');
  process.exit(0);
}

async function processBatch(
  cards: CardMetadata[],
  embeddingTexts: { oracle_id: string; text: string }[],
  pipe: any
) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Upsert cards
    for (const card of cards as any[]) {
      await client.query(
        `INSERT INTO cards (
          oracle_id, name, mana_value, colors, color_identity, type_line, oracle_text, price_usd, scryfall_uri, image_uri, is_silver_bordered
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (oracle_id) DO UPDATE SET
          name = EXCLUDED.name,
          mana_value = EXCLUDED.mana_value,
          colors = EXCLUDED.colors,
          color_identity = EXCLUDED.color_identity,
          type_line = EXCLUDED.type_line,
          oracle_text = EXCLUDED.oracle_text,
          price_usd = EXCLUDED.price_usd,
          scryfall_uri = EXCLUDED.scryfall_uri,
          image_uri = EXCLUDED.image_uri,
          is_silver_bordered = EXCLUDED.is_silver_bordered`,
        [
          card.oracle_id,
          card.name,
          card.mana_value,
          card.colors,
          card.color_identity,
          card.type_line,
          card.oracle_text,
          card.price_usd,
          card.scryfall_uri,
          card.image_uri,
          card.is_silver_bordered || false,
        ]
      );
    }

    // 2. Generate local embeddings
    for (const item of embeddingTexts) {
      const output = await pipe(item.text, { pooling: 'mean', normalize: true });
      const vectorArray = Array.from(output.data);
      const vectorSql = `[${vectorArray.join(',')}]`;

      await client.query(
        `INSERT INTO card_embeddings (oracle_id, embedding)
         VALUES ($1, $2::vector)
         ON CONFLICT (oracle_id) DO UPDATE SET
           embedding = EXCLUDED.embedding`,
        [item.oracle_id, vectorSql]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error processing card batch:', err);
    throw err;
  } finally {
    client.release();
  }
}

main().catch((err) => {
  console.error('Fatal ingestion error:', err);
  process.exit(1);
});
