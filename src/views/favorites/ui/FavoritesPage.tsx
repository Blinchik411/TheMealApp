'use client';

import { useFavoritesStore } from '@/features/favorite-meal';
import { MealCategoryFilter, MealSearch } from '@/features/filter-meals';
import { MealGrid } from '@/widgets/meal-grid';
import { Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useMemo, useState } from 'react';

export const FavoritesPage: React.FC = () => {
  const favorites = useFavoritesStore((state) => state.favorites);
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const meal of favorites) {
      if (meal.strCategory) set.add(meal.strCategory);
    }
    return Array.from(set);
  }, [favorites]);

  const filteredFavorites = useMemo(() => {
    return favorites.filter((meal) => {
      const matchesSearch = meal.strMeal.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !activeCategory || meal.strCategory === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [favorites, searchQuery, activeCategory]);

  if (!hasHydrated) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">Loading favorites...</div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-center size-16 rounded-3xl bg-red-500/10 text-red-500 mb-2">
          <Heart className="size-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Your favorites list is empty
        </h1>
        <p className="text-sm text-muted-foreground">
          Save recipes you like using the heart icon on any meal card to easily find them here.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-xs"
        >
          Explore Recipe Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center max-w-2xl mx-auto space-y-2 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 mb-2">
          <Sparkles className="size-3.5" />
          <span>Your personal culinary collection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Favorite Recipes ({favorites.length})
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Quickly search and filter through your saved dishes.
        </p>
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

      <MealGrid
        meals={filteredFavorites}
        from="favorites"
        emptyMessage="No favorite recipes match this filter."
      />
    </div>
  );
};
