import { FavoritesPage } from '@/views/favorites';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Favorite Recipes — TheMealApp',
  description: 'Your personal collection of favorite recipes and meals',
};

export default function Page() {
  return <FavoritesPage />;
}
