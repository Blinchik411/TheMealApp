'use client';

import { useFavoritesStore } from '@/features/favorite-meal';
import { MealCategoryFilter, MealSearch } from '@/features/filter-meals';
import { Link } from '@/shared/config/i18n';
import { MealGrid } from '@/widgets/meal-grid';
import { Heart, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

export const FavoritesPage = () => {
  const t = useTranslations('Favorites');
  const favorites = useFavoritesStore((state) => state.favorites);
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const meal of favorites) {
      if (meal.category) set.add(meal.category);
    }
    return Array.from(set);
  }, [favorites]);

  const filteredFavorites = useMemo(() => {
    return favorites.filter((meal) => {
      const matchesSearch = meal.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !activeCategory || meal.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [favorites, searchQuery, activeCategory]);

  if (!hasHydrated) {
    return (
      <div className="space-y-8 pb-12 animate-pulse">
        <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
          <div className="h-6 w-44 bg-muted rounded-full mx-auto" />
          <div className="h-9 w-64 bg-muted rounded-xl mx-auto" />
          <div className="h-4 w-72 bg-muted rounded-md mx-auto" />
        </div>
        <div className="h-24 bg-card border border-border rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {['skel-1', 'skel-2', 'skel-3', 'skel-4'].map((id) => (
            <div key={id} className="bg-card border border-border rounded-2xl h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-center size-16 rounded-3xl bg-red-500/10 text-red-500 mb-2">
          <Heart className="size-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('emptyTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('emptyDescription')}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-xs"
        >
          {t('exploreButton')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center max-w-2xl mx-auto space-y-2 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 mb-2">
          <Sparkles className="size-3.5" />
          <span>{t('subtitle')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t('title')} ({favorites.length})
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">{t('subtitle')}</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <MealSearch value={searchQuery} onSearch={setSearchQuery} />

        {categories.length > 0 && (
          <div className="pt-2 border-t border-border/60">
            <MealCategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          </div>
        )}
      </div>

      <MealGrid meals={filteredFavorites} from="favorites" emptyMessage={t('emptyDescription')} />
    </div>
  );
};
