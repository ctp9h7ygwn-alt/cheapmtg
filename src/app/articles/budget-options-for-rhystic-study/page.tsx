import type { Metadata } from 'next';
import DynamicArticlePage, { generateMetadata as baseGenerateMetadata } from '../[slug]/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return baseGenerateMetadata({ params: { slug: 'budget-options-for-rhystic-study' } });
}

export default async function RhysticStudyArticlePage() {
  return <DynamicArticlePage params={{ slug: 'budget-options-for-rhystic-study' }} />;
}
