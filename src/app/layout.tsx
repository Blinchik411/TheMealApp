import { Header } from '@/widgets/header';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://the-meal-app-three.vercel.app'),
  title: {
    default: 'TheMealApp — Recipe Book & Culinary Catalog',
    template: '%s | TheMealApp',
  },
  description: 'Search recipes, filter by world cuisines and categories, save your favorite meals',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TheMealApp — Recipe Book & Culinary Catalog',
    description:
      'Search recipes, filter by world cuisines and categories, save your favorite meals',
    url: 'https://the-meal-app-three.vercel.app',
    siteName: 'TheMealApp',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TheMealApp — Recipe Book & Culinary Catalog',
    description:
      'Search recipes, filter by world cuisines and categories, save your favorite meals',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
