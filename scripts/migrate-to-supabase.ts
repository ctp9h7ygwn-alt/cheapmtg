/**
 * Migrate local PostgreSQL data to Supabase via REST API (HTTPS).
 * Works even when direct Postgres ports are blocked by network firewalls.
 */
import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

const LOCAL_DB_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/cheapmtg';
const SUPABASE_URL = 'https://uqvvfhcygbbhbwhuhetx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdnZmaGN5Z2JiaGJ3aHVoZXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MDM4MzEsImV4cCI6MjEwMTA3OTgzMX0.pWFW9EgATNl9bOXbUxT2eImbzjbdPD7PPxKC-b2anmY';

const localPool = new Pool({ connectionString: LOCAL_DB_URL, max: 5 });

const CARD_BATCH = 200;
const TAG_BATCH = 500;
const EMB_BATCH = 50;

async function supabasePost(table: string, data: any[]): Promise<number> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=ignore-duplicates,return=minimal',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok && res.status !== 409) {
    const text = await res.text();
    throw new Error(`REST API error ${res.status}: ${text}`);
  }
  return res.status;
}

async function migrateCards() {
  const { rows } = await localPool.query(
    `SELECT oracle_id, name, mana_value, colors, color_identity, type_line, oracle_text, price_usd, scryfall_uri, image_uri, is_silver_bordered FROM cards`
  );
  console.log(`Migrating ${rows.length} cards...`);

  let migrated = 0;
  for (let i = 0; i < rows.length; i += CARD_BATCH) {
    const batch = rows.slice(i, i + CARD_BATCH).map((r) => ({
      oracle_id: r.oracle_id,
      name: r.name,
      mana_value: parseFloat(r.mana_value) || 0,
      colors: r.colors || [],
      color_identity: r.color_identity || [],
      type_line: r.type_line,
      oracle_text: r.oracle_text,
      price_usd: r.price_usd ? parseFloat(r.price_usd) : null,
      scryfall_uri: r.scryfall_uri,
      image_uri: r.image_uri,
      is_silver_bordered: r.is_silver_bordered || false,
    }));

    await supabasePost('cards', batch);
    migrated += batch.length;
    process.stdout.write(`  Cards: ${migrated}/${rows.length}\r`);
  }
  console.log(`\n✓ Cards complete: ${migrated}`);
}

async function migrateTags() {
  const { rows } = await localPool.query(`SELECT card_oracle_id, tag FROM oracle_tags`);
  console.log(`Migrating ${rows.length} tags...`);

  let migrated = 0;
  for (let i = 0; i < rows.length; i += TAG_BATCH) {
    const batch = rows.slice(i, i + TAG_BATCH).map((r) => ({
      card_oracle_id: r.card_oracle_id,
      tag: r.tag,
    }));

    await supabasePost('oracle_tags', batch);
    migrated += batch.length;
    process.stdout.write(`  Tags: ${migrated}/${rows.length}\r`);
  }
  console.log(`\n✓ Tags complete: ${migrated}`);
}

async function migrateEmbeddings() {
  const { rows } = await localPool.query(`SELECT oracle_id, embedding::text FROM card_embeddings`);
  console.log(`Migrating ${rows.length} embeddings...`);

  let migrated = 0;
  let errors = 0;
  for (let i = 0; i < rows.length; i += EMB_BATCH) {
    const batch = rows.slice(i, i + EMB_BATCH).map((r) => ({
      oracle_id: r.oracle_id,
      embedding: r.embedding,
    }));

    try {
      await supabasePost('card_embeddings', batch);
      migrated += batch.length;
    } catch (err: any) {
      // Embeddings with vector type can be tricky via REST - fall back to individual inserts
      for (const item of batch) {
        try {
          await supabasePost('card_embeddings', [item]);
          migrated++;
        } catch {
          errors++;
        }
      }
    }
    process.stdout.write(`  Embeddings: ${migrated}/${rows.length} (errors: ${errors})\r`);
  }
  console.log(`\n✓ Embeddings complete: ${migrated} (errors: ${errors})`);
}

async function main() {
  console.log('=== CheapMTG → Supabase Migration (REST API) ===\n');

  // Test connection
  const test = await fetch(`${SUPABASE_URL}/rest/v1/cards?select=count&limit=1`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Prefer': 'count=exact' },
  });
  if (!test.ok) {
    console.error('✗ Cannot reach Supabase REST API');
    process.exit(1);
  }
  console.log('✓ Supabase REST API connection OK\n');

  await migrateCards();
  await migrateTags();
  await migrateEmbeddings();

  // Verify final counts
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
  }).catch(() => null);

  console.log('\nMigration complete! Check Supabase dashboard for final counts.');

  await localPool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
