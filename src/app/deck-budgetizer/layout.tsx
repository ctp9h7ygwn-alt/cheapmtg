import type { Metadata } from 'next';
import Footer from '../components/Footer';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';

export const metadata: Metadata = {
  title: 'Commander Deck Budgetizer — Paste a Moxfield or Archidekt URL | MTGCheap',
  description:
    'Automatically replace expensive Commander staples with budget alternatives. Paste a Moxfield or Archidekt deck URL, set a target budget, and optimize your entire EDH deck instantly.',
  keywords: [
    'MTG deck budgetizer',
    'Commander budget deck tool',
    'Moxfield budget optimizer',
    'Archidekt budget tool',
    'EDH budget deck builder',
    'cheap Commander deck',
    'MTG deck budget calculator',
  ],
  alternates: {
    canonical: `${baseUrl}/deck-budgetizer`,
  },
  openGraph: {
    title: 'Commander Deck Budgetizer | MTGCheap',
    description:
      'Paste a Moxfield or Archidekt deck URL, set a target budget, and automatically swap expensive staples for budget alternatives.',
    url: `${baseUrl}/deck-budgetizer`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Commander Deck Budgetizer | MTGCheap',
    description:
      'Paste a Moxfield or Archidekt deck URL, set a target budget, and automatically swap expensive staples for budget alternatives.',
  },
};

export default function DeckBudgetizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
