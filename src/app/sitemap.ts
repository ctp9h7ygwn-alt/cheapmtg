import { MetadataRoute } from 'next';
import { query } from '@/lib/db';

export const revalidate = 86400;

function cardNameToSlug(name: string): string {
  return 'budget-options-for-' + name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';
  const stableDate = new Date('2026-08-03');

  let articleUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await query(
      `SELECT name FROM cards WHERE price_usd IS NOT NULL AND price_usd >= 10.00 AND COALESCE(is_silver_bordered, FALSE) = FALSE ORDER BY price_usd DESC LIMIT 45000`
    );
    articleUrls = res.rows.map((row: any) => ({
      url: `${baseUrl}/articles/${cardNameToSlug(row.name)}`,
      lastModified: stableDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.error('Sitemap DB query error:', e);
  }

  const staticArticles: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/articles/budget-options-for-rhystic-study`,
      lastModified: stableDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/articles/budget-options-for-the-one-ring`,
      lastModified: stableDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ];

  const clusterUrls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/budget-commander`, lastModified: stableDate, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/budget-commander/staples`, lastModified: stableDate, changeFrequency: 'weekly' as const, priority: 0.95 },
    { url: `${baseUrl}/budget-commander/deck-building`, lastModified: stableDate, changeFrequency: 'weekly' as const, priority: 0.95 },
    { url: `${baseUrl}/budget-commander/alternatives`, lastModified: stableDate, changeFrequency: 'weekly' as const, priority: 0.95 },
    { url: `${baseUrl}/budget-commander/mana-base`, lastModified: stableDate, changeFrequency: 'weekly' as const, priority: 0.95 },
    { url: `${baseUrl}/budget-commander/card-draw`, lastModified: stableDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/budget-commander/ramp`, lastModified: stableDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/budget-commander/removal`, lastModified: stableDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/budget-commander/board-wipes`, lastModified: stableDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/budget-commander/protection`, lastModified: stableDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/budget-commander/counterspells`, lastModified: stableDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/budget-commander/tutors`, lastModified: stableDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/budget-commander/lands`, lastModified: stableDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/budget-commander/dual-lands`, lastModified: stableDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/budget-commander/cards-under-1-dollar`, lastModified: stableDate, changeFrequency: 'weekly' as const, priority: 0.9 },
  ];

  return [
    {
      url: baseUrl,
      lastModified: stableDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/deck-budgetizer`,
      lastModified: stableDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: stableDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    ...clusterUrls,
    ...staticArticles,
    ...articleUrls,
  ];
}
