import { FavoritesPage } from '@/views/favorites';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Favorite Recipes — TheMealApp',
  description: 'Your personal collection of favorite recipes and meals',
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <FavoritesPage />;
}
