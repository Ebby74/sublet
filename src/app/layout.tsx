import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n';
import { AnalyticsScripts } from '@/components/analytics/AnalyticsScripts';
import { Providers } from '@/components/providers';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'AMR Home Solutions | Co-Living Room Rentals in KL',
  description: 'Find your perfect room in Malaysia — fully furnished, move-in ready. AI-powered rental platform with 24/7 AIrene support.',
  keywords: ['room rental KL', 'co-living Malaysia', 'AMR Home Solutions', 'furnished rooms', 'LRT accessible'],
  openGraph: {
    title: 'AMR Home Solutions | Co-Living Room Rentals in KL',
    description: 'Find your perfect room in Malaysia — fully furnished, move-in ready. AI-powered rental platform.',
    url: 'https://amrhomes.com',
    siteName: 'AMR Home Solutions',
    images: [
      {
        url: 'https://amrhomes.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AMR Home Solutions - Co-Living Room Rentals',
      },
    ],
    locale: 'en_MY',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AMR Home Solutions | Co-Living Room Rentals in KL',
    description: 'Find your perfect room in Malaysia — fully furnished, move-in ready.',
    images: ['https://amrhomes.com/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AnalyticsScripts />
        <LanguageProvider>
          <Providers>{children}</Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
