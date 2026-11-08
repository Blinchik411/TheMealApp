import { type Locale, routing } from '@/shared/config/i18n';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import '../styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

interface GenerateMetadataProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: GenerateMetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const isRu = locale === 'ru';

  return {
    metadataBase: new URL('https://the-meal-app-three.vercel.app'),
    title: {
      default: isRu
        ? 'TheMealApp — Кулинарная книга и каталог рецептов'
        : 'TheMealApp — Recipe Book & Culinary Catalog',
      template: '%s | TheMealApp',
    },
    description: isRu
      ? 'Ищите рецепты, фильтруйте по кухням мира и категориям, сохраняйте любимые блюда'
      : 'Search recipes, filter by world cuisines and categories, save your favorite meals',
    alternates: {
      canonical: isRu ? '/ru' : '/',
      languages: {
        'en-US': '/',
        'ru-RU': '/ru',
      },
    },
    openGraph: {
      title: isRu
        ? 'TheMealApp — Кулинарная книга и каталог рецептов'
        : 'TheMealApp — Recipe Book & Culinary Catalog',
      description: isRu
        ? 'Ищите рецепты, фильтруйте по кухням мира и категориям, сохраняйте любимые блюда'
        : 'Search recipes, filter by world cuisines and categories, save your favorite meals',
      url: isRu
        ? 'https://the-meal-app-three.vercel.app/ru'
        : 'https://the-meal-app-three.vercel.app',
      siteName: 'TheMealApp',
      locale: isRu ? 'ru_RU' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: isRu
        ? 'TheMealApp — Кулинарная книга и каталог рецептов'
        : 'TheMealApp — Recipe Book & Culinary Catalog',
      description: isRu
        ? 'Ищите рецепты, фильтруйте по кухням мира и категориям, сохраняйте любимые блюда'
        : 'Search recipes, filter by world cuisines and categories, save your favorite meals',
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
