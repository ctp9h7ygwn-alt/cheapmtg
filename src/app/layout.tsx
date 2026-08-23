import type { Metadata } from 'next';
import { Outfit, Cinzel } from 'next/font/google';
import Script from 'next/script';
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
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'MTGCheap | Find Budget Alternatives for Magic Cards',
    description:
      'Find lower-cost functional budget alternatives for Magic: The Gathering cards and Commander decks.',
    url: siteUrl,
    siteName: 'MTGCheap',
    images: [
      {
        url: `${siteUrl}/icon-512.png`,
        width: 512,
        height: 512,
        alt: 'MTGCheap Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MTGCheap | Find Budget Alternatives for Magic Cards',
    description:
      'Find lower-cost functional budget alternatives for Magic: The Gathering cards and Commander decks.',
    images: [`${siteUrl}/icon-512.png`],
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
        url: `${siteUrl}/icon-512.png`,
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-[#05070a] text-[#f0f6fc] font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LZK9BGYSG4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-LZK9BGYSG4');
          `}
        </Script>
      </body>
    </html>
  );
}
