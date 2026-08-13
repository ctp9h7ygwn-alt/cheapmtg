import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

function cardNameToSlug(name: string): string {
  return 'budget-options-for-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const search = (searchParams.get('q') || '').trim();
  const offset = (page - 1) * limit;

  try {
    let whereClause = `WHERE price_usd IS NOT NULL AND price_usd >= 10.00 AND COALESCE(is_silver_bordered, FALSE) = FALSE`;
    const params: any[] = [limit, offset];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      whereClause += ` AND (LOWER(name) LIKE $3 OR LOWER(type_line) LIKE $3)`;
    }

    const res = await query(
      `SELECT oracle_id, name, type_line, price_usd, image_uri, color_identity
       FROM cards
       ${whereClause}
       ORDER BY price_usd DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    const countParams = search ? [`%${search.toLowerCase()}%`] : [];
    const countWhere = search
      ? `WHERE price_usd IS NOT NULL AND price_usd >= 10.00 AND COALESCE(is_silver_bordered, FALSE) = FALSE AND (LOWER(name) LIKE $1 OR LOWER(type_line) LIKE $1)`
      : `WHERE price_usd IS NOT NULL AND price_usd >= 10.00 AND COALESCE(is_silver_bordered, FALSE) = FALSE`;

    const countRes = await query(
      `SELECT COUNT(*) as total FROM cards ${countWhere}`,
      countParams
    );

    const total = parseInt(countRes.rows[0].total, 10);

    const cards = res.rows.map((row: any) => ({
      oracle_id: row.oracle_id,
      name: row.name,
      type_line: row.type_line,
      price_usd: parseFloat(row.price_usd),
      image_uri: row.image_uri,
      color_identity: row.color_identity || [],
      slug: cardNameToSlug(row.name),
    }));

    return NextResponse.json({
      cards,
      page,
      limit,
      total,
      hasMore: offset + cards.length < total,
    });
  } catch (err) {
    console.error('Error fetching articles paginated:', err);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
