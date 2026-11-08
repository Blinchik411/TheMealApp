import { FavoritesPage } from '@/views/favorites';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isRu = locale === 'ru';

  return {
    title: isRu ? 'Избранные рецепты — TheMealApp' : 'Favorite Recipes — TheMealApp',
    description: isRu
      ? 'Ваша личная коллекция любимых рецептов и блюд'
      : 'Your personal collection of favorite recipes and meals',
    alternates: {
      canonical: isRu ? '/ru/favorites' : '/favorites',
      languages: {
        'en-US': '/favorites',
        'ru-RU': '/ru/favorites',
      },
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <FavoritesPage />;
}
