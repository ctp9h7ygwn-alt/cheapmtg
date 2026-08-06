-- Enable vector and uuid extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: cards
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oracle_id UUID NOT NULL UNIQUE,
    name TEXT NOT NULL,
    mana_value NUMERIC(10, 2) DEFAULT 0,
    colors TEXT[] DEFAULT '{}',
    color_identity TEXT[] DEFAULT '{}',
    type_line TEXT,
    oracle_text TEXT,
    price_usd NUMERIC(12, 2),
    scryfall_uri TEXT,
    image_uri TEXT,
    is_silver_bordered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cards_oracle_id_idx ON cards(oracle_id);
CREATE INDEX IF NOT EXISTS cards_name_idx ON cards (LOWER(name));
CREATE INDEX IF NOT EXISTS cards_price_usd_idx ON cards(price_usd);
CREATE INDEX IF NOT EXISTS cards_color_identity_idx ON cards USING GIN(color_identity);

-- Table 2: oracle_tags
CREATE TABLE IF NOT EXISTS oracle_tags (
    id SERIAL PRIMARY KEY,
    card_oracle_id UUID NOT NULL,
    tag TEXT NOT NULL,
    UNIQUE (card_oracle_id, tag)
);

CREATE INDEX IF NOT EXISTS oracle_tags_card_oracle_id_idx ON oracle_tags(card_oracle_id);
CREATE INDEX IF NOT EXISTS oracle_tags_tag_idx ON oracle_tags(tag);

-- Table 3: card_embeddings
CREATE TABLE IF NOT EXISTS card_embeddings (
    oracle_id UUID PRIMARY KEY REFERENCES cards(oracle_id) ON DELETE CASCADE,
    embedding vector(384),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cosine Distance HNSW Vector Index
CREATE INDEX IF NOT EXISTS card_embeddings_hnsw_idx 
ON card_embeddings USING hnsw (embedding vector_cosine_ops);
