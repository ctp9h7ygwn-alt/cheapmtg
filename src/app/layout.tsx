import type { Metadata } from 'next';
import { Outfit, Cinzel } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtgcheap.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MTGCheap | Find Budget Alternatives',
    template: '%s | MTGCheap',
  },
  description:
    'Find contextually accurate, lower-cost functional MTG card alternatives using machine learning embeddings and Scryfall oracle tags.',
  keywords: [
    'MTG budget cards',
    'Magic: The Gathering budget swaps',
    'Commander budget alternatives',
    'cheap MTG cards',
    'EDH budget staples',
    'MTGCheap',
  ],
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
  openGraph: {
    title: 'MTGCheap | Find Budget Alternatives',
    description:
      'Find contextually accurate, lower-cost functional MTG card alternatives using machine learning embeddings and Scryfall oracle tags.',
    url: siteUrl,
    siteName: 'MTGCheap',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MTGCheap | Find Budget Alternatives',
    description:
      'Find contextually accurate, lower-cost functional MTG card alternatives using machine learning embeddings and Scryfall oracle tags.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${outfit.variable} ${cinzel.variable}`}>
      <body className="min-h-screen bg-[#05070a] text-[#f0f6fc] font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
