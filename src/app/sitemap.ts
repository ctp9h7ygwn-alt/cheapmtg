import { MetadataRoute } from 'next';
import { query } from '@/lib/db';

export const revalidate = 86400;

function cardNameToSlug(name: string): string {
  return 'budget-options-for-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://cheapmtg.com');

  let articleUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await query(
      `SELECT name FROM cards WHERE price_usd IS NOT NULL AND price_usd >= 15.00 AND COALESCE(is_silver_bordered, FALSE) = FALSE ORDER BY price_usd DESC LIMIT 1000`
    );
    articleUrls = res.rows.map((row: any) => ({
      url: `${baseUrl}/articles/${cardNameToSlug(row.name)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.error('Sitemap DB query error:', e);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    ...articleUrls,
  ];
}
