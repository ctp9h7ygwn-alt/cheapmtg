import { query } from './db';
import { TOPIC_CLUSTERS, ClusterCard } from './topic-clusters-data';

export * from './topic-clusters-data';

// Database Query Helper for Topic Hubs (Server Side)
export async function getCardsForTopic(topicSlug: string, limit: number = 36, maxPrice: number = 2.50): Promise<ClusterCard[]> {
  const meta = TOPIC_CLUSTERS[topicSlug];
  if (!meta) return [];

  const tagPlaceholders = meta.targetTags.map((t) => `otag:${t}`);

  try {
    const res = await query(
      `WITH tag_matches AS (
        SELECT ot.card_oracle_id, COUNT(*) as match_count
        FROM oracle_tags ot
        WHERE ot.tag = ANY($1::text[])
        GROUP BY ot.card_oracle_id
      )
      SELECT c.oracle_id, c.name, c.mana_value, c.type_line, c.oracle_text, c.price_usd, c.image_uri, c.color_identity, c.colors,
             ARRAY(
               SELECT ot2.tag FROM oracle_tags ot2 WHERE ot2.card_oracle_id = c.oracle_id
             ) as all_tags,
             COALESCE(tm.match_count, 0) as tag_score
      FROM cards c
      LEFT JOIN tag_matches tm ON c.oracle_id = tm.card_oracle_id
      WHERE (
        tm.match_count > 0 
        OR EXISTS (
          SELECT 1 FROM unnest($2::text[]) kw 
          WHERE c.oracle_text ILIKE '%' || kw || '%'
        )
      )
      AND c.price_usd IS NOT NULL AND c.price_usd > 0 AND c.price_usd <= $3::numeric
      AND COALESCE(c.is_silver_bordered, FALSE) = FALSE
      AND c.type_line NOT ILIKE '%Token%'
      AND c.type_line NOT ILIKE '%Emblem%'
      AND c.type_line NOT ILIKE '%Art Series%'
      AND c.type_line NOT ILIKE '%Card Back%'
      AND c.type_line NOT ILIKE '%Helper%'
      ORDER BY 
        (COALESCE(tm.match_count, 0) * 1.5) + (CASE WHEN c.price_usd <= 1.00 THEN 0.5 ELSE 0 END) DESC,
        c.price_usd ASC
      LIMIT $4`,
      [tagPlaceholders, meta.fallbackKeywords, maxPrice, limit]
    );

    return res.rows.map((row: any) => {
      const price = parseFloat(row.price_usd);
      return {
        oracle_id: row.oracle_id,
        name: row.name,
        mana_value: parseFloat(row.mana_value || '0'),
        type_line: row.type_line || '',
        oracle_text: row.oracle_text || '',
        price_usd: price,
        image_uri: row.image_uri || '',
        color_identity: row.color_identity || [],
        colors: row.colors || [],
        tags: (row.all_tags || []).map((t: string) => t.replace('otag:', '')),
        tcgplayer_url: `https://www.tcgplayer.com/search/magic/product?q=${encodeURIComponent(row.name)}&utm_source=cheapmtg`,
        manapool_url: `https://manapool.com/cards?q=${encodeURIComponent(row.name)}&ref=cheapmtg`,
      };
    });
  } catch (err) {
    console.error('Error fetching cards for topic:', topicSlug, err);
    return [];
  }
}
