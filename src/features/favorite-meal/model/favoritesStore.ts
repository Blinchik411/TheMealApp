'use client';

import type { Meal } from '@/entities/meal';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: Meal[];
  hasHydrated: boolean;
  toggleFavorite: (meal: Meal) => void;
  isFavorite: (idMeal: string) => boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      hasHydrated: false,
      toggleFavorite: (meal: Meal) => {
        const { favorites } = get();
        const exists = favorites.some((item) => item.idMeal === meal.idMeal);
        if (exists) {
          set({ favorites: favorites.filter((item) => item.idMeal !== meal.idMeal) });
        } else {
          set({ favorites: [...favorites, meal] });
        }
      },
      isFavorite: (idMeal: string) => {
        return get().favorites.some((item) => item.idMeal === idMeal);
      },
      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state });
      },
    }),
    {
      name: 'the-meal-favorites',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
