'use client';

import type { Meal } from '@/entities/meal';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoritesState {
  favorites: Meal[];
  hasHydrated: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (meal: Meal) => boolean;
  setFavorites: (favorites: Meal[]) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      hasHydrated: false,

      isFavorite: (id: string) => {
        return get().favorites.some((item) => item.id === id);
      },

      toggleFavorite: (meal: Meal) => {
        const currentFavorites = get().favorites;
        const exists = currentFavorites.some((item) => item.id === meal.id);

        if (exists) {
          set({ favorites: currentFavorites.filter((item) => item.id !== meal.id) });
          return false;
        }

        set({ favorites: [meal, ...currentFavorites] });
        return true;
      },

      setFavorites: (favorites: Meal[]) => {
        set({ favorites });
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
