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
    default: 'MTGCheap | Find Budget Alternatives for Magic Cards',
    template: '%s | MTGCheap',
  },
  description:
    'Find lower-cost functional budget alternatives for Magic: The Gathering cards and Commander decks.',
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
    languages: {
      'en-US': siteUrl,
      'en': siteUrl,
    },
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
    title: 'MTGCheap | Find Budget Alternatives for Magic Cards',
    description:
      'Find lower-cost functional budget alternatives for Magic: The Gathering cards and Commander decks.',
    url: siteUrl,
    siteName: 'MTGCheap',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MTGCheap | Find Budget Alternatives for Magic Cards',
    description:
      'Find lower-cost functional budget alternatives for Magic: The Gathering cards and Commander decks.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'MTGCheap',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon.png`,
      },
      sameAs: ['https://github.com/ctp9h7ygwn-alt/cheapmtg'],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'MTGCheap',
      description: 'Find lower-cost functional budget alternatives for Magic: The Gathering cards and Commander decks.',
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/?target_card_name={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'en-US',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${outfit.variable} ${cinzel.variable}`}>
      <body className="min-h-screen bg-[#05070a] text-[#f0f6fc] font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
