import { MetadataRoute } from 'next';
import { query } from '@/lib/db';

export const revalidate = 43200; // 12 hours

function cardNameToSlug(name: string): string {
  return (
    'budget-options-for-' +
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';
  const currentDate = new Date();

  // Core Static & Tool Pages
  const coreUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/budget-commander`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/deck-budgetizer`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Strategic Topic Clusters & Functional Hubs
  const clusterUrls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/budget-commander/staples`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/budget-commander/deck-building`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/budget-commander/alternatives`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/budget-commander/mana-base`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/budget-commander/card-draw`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/budget-commander/ramp`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/budget-commander/removal`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/budget-commander/board-wipes`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/budget-commander/protection`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/budget-commander/counterspells`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/budget-commander/tutors`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/budget-commander/lands`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/budget-commander/dual-lands`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/budget-commander/cards-under-1-dollar`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
  ];

  // Static flagship card guides
  const staticArticles: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/articles/budget-options-for-rhystic-study`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/articles/budget-options-for-the-one-ring`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ];

  // Dynamic High-Value Card Articles from Database (Indexed Staples >= $10.00)
  let dynamicArticleUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await query(
      `SELECT name FROM cards 
       WHERE price_usd IS NOT NULL AND price_usd >= 10.00 
         AND COALESCE(is_silver_bordered, FALSE) = FALSE 
       ORDER BY price_usd DESC 
       LIMIT 3000`
    );

    if (res && res.rows && res.rows.length > 0) {
      dynamicArticleUrls = res.rows.map((row: any) => ({
        url: `${baseUrl}/articles/${cardNameToSlug(row.name)}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      }));
    }
  } catch (e) {
    console.error('Sitemap DB query error, falling back to core URLs:', e);
  }

  return [...coreUrls, ...clusterUrls, ...staticArticles, ...dynamicArticleUrls];
}
