import dotenv from 'dotenv';
dotenv.config();

import os from 'os';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uqvvfhcygbbhbwhuhetx.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdnZmaGN5Z2JiaGJ3aHVoZXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MDM4MzEsImV4cCI6MjEwMTA3OTgzMX0.pWFW9EgATNl9bOXbUxT2eImbzjbdPD7PPxKC-b2anmY';

async function fetchFromSupabase(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };
  return fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, { ...options, headers });
}

async function getAllExistingEmbeddingOracleIds(): Promise<Set<string>> {
  console.log('Fetching existing embedding oracle IDs from Supabase...');
  const existingSet = new Set<string>();
  let offset = 0;
  const limit = 1000;

  while (true) {
    const res = await fetchFromSupabase(`card_embeddings?select=oracle_id&limit=${limit}&offset=${offset}`);
    if (!res.ok) {
      console.error(`Failed to fetch embedding IDs at offset ${offset}: ${res.statusText}`);
      break;
    }

    const data: { oracle_id: string }[] = await res.json();
    if (!data || data.length === 0) break;

    for (const item of data) {
      existingSet.add(item.oracle_id);
    }

    offset += data.length;
    process.stdout.write(`  Loaded ${existingSet.size} existing embedding IDs...\r`);
    if (data.length < limit) break;
  }

  console.log(`\n✓ Found ${existingSet.size} existing embeddings in Supabase.`);
  return existingSet;
}

async function getAllCards(): Promise<any[]> {
  console.log('Fetching all cards from Supabase...');
  const allCards: any[] = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const res = await fetchFromSupabase(
      `cards?select=oracle_id,name,type_line,mana_value,oracle_text,is_silver_bordered&limit=${limit}&offset=${offset}`
    );

    if (!res.ok) {
      console.error(`Failed to fetch cards at offset ${offset}: ${res.statusText}`);
      break;
    }

    const data: any[] = await res.json();
    if (!data || data.length === 0) break;

    allCards.push(...data);
    offset += data.length;
    process.stdout.write(`  Loaded ${allCards.length} cards...\r`);
    if (data.length < limit) break;
  }

  console.log(`\n✓ Loaded ${allCards.length} total cards from Supabase.`);
  return allCards;
}

async function getAllTagsMap(): Promise<Map<string, string[]>> {
  console.log('Fetching oracle tags from Supabase...');
  const tagsMap = new Map<string, string[]>();
  let offset = 0;
  const limit = 2000;

  while (true) {
    const res = await fetchFromSupabase(`oracle_tags?select=card_oracle_id,tag&limit=${limit}&offset=${offset}`);
    if (!res.ok) {
      console.error(`Failed to fetch tags at offset ${offset}: ${res.statusText}`);
      break;
    }

    const data: { card_oracle_id: string; tag: string }[] = await res.json();
    if (!data || data.length === 0) break;

    for (const item of data) {
      const existing = tagsMap.get(item.card_oracle_id) || [];
      existing.push(item.tag);
      tagsMap.set(item.card_oracle_id, existing);
    }

    offset += data.length;
    process.stdout.write(`  Loaded tags for ${tagsMap.size} cards...\r`);
    if (data.length < limit) break;
  }

  console.log(`\n✓ Loaded tags for ${tagsMap.size} unique cards.`);
  return tagsMap;
}

async function main() {
  console.log('=== Local Embedding Generation & Supabase Sync ===\n');

  // Load embedding model locally
  console.log('Initializing local transformer pipeline...');
  const { pipeline, env } = await import('@xenova/transformers');
  env.allowLocalModels = false;
  env.cacheDir = path.join(os.tmpdir(), '.cache');
  const generateEmbeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log('✓ Local feature-extraction pipeline ready.\n');

  // Fetch data
  const existingEmbeddingIds = await getAllExistingEmbeddingOracleIds();
  const allCards = await getAllCards();
  const tagsMap = await getAllTagsMap();

  // Find cards missing embeddings
  const missingCards = allCards.filter((card) => !existingEmbeddingIds.has(card.oracle_id));

  console.log(`\nSummary:`);
  console.log(`- Total Cards in Supabase: ${allCards.length}`);
  console.log(`- Already Have Embeddings: ${existingEmbeddingIds.size}`);
  console.log(`- Missing Embeddings:      ${missingCards.length}\n`);

  if (missingCards.length === 0) {
    console.log('🎉 All cards already have embeddings in Supabase! Nothing to do.');
    return;
  }

  console.log(`Starting local embedding generation for ${missingCards.length} missing cards...\n`);

  const BATCH_SIZE = 25;
  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < missingCards.length; i += BATCH_SIZE) {
    const chunk = missingCards.slice(i, i + BATCH_SIZE);
    const payload: { oracle_id: string; embedding: string }[] = [];

    for (const card of chunk) {
      try {
        const cardTags = tagsMap.get(card.oracle_id) || [];
        const textToEmbed = `Type: ${card.type_line || ''} | Cost: ${card.mana_value || 0} | Text: ${card.oracle_text || ''} | Tags: ${cardTags.join(', ')}`;
        
        const output = await generateEmbeddingPipeline(textToEmbed, { pooling: 'mean', normalize: true });
        const vectorArray = Array.from(output.data);
        const vectorStr = `[${vectorArray.join(',')}]`;

        payload.push({
          oracle_id: card.oracle_id,
          embedding: vectorStr,
        });
      } catch (err: any) {
        console.error(`Error generating embedding for ${card.name} (${card.oracle_id}):`, err.message);
        errorCount++;
      }
    }

    if (payload.length > 0) {
      // Upsert into Supabase card_embeddings table via REST API
      const res = await fetchFromSupabase('card_embeddings', {
        method: 'POST',
        headers: {
          'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 409) {
        successCount += payload.length;
      } else {
        const errorText = await res.text();
        console.error(`\nFailed to upload batch to Supabase (${res.status}): ${errorText}`);
        errorCount += payload.length;
      }
    }

    processedCount += chunk.length;
    const pct = ((processedCount / missingCards.length) * 100).toFixed(1);
    process.stdout.write(`Progress: ${processedCount}/${missingCards.length} (${pct}%) - Uploaded: ${successCount}, Errors: ${errorCount}\r`);
  }

  console.log(`\n\n🎉 Local embedding generation and sync complete!`);
  console.log(`- Successfully uploaded: ${successCount} vectors`);
  console.log(`- Errors encountered:    ${errorCount} vectors`);
}

main().catch((err) => {
  console.error('Fatal error in script:', err);
  process.exit(1);
});
