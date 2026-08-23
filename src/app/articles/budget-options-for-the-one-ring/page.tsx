import type { Metadata } from 'next';
import DynamicArticlePage, { generateMetadata as baseGenerateMetadata } from '../[slug]/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return baseGenerateMetadata({ params: { slug: 'budget-options-for-the-one-ring' } });
}

export default async function TheOneRingArticlePage() {
  return <DynamicArticlePage params={{ slug: 'budget-options-for-the-one-ring' }} />;
}
