'use client';

import type { Meal } from '@/entities/meal';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { favoritesApi } from '../api/favoritesApi';

interface FavoritesState {
  favorites: Meal[];
  hasHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (meal: Meal) => Promise<void>;
  isFavorite: (id: string) => boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      hasHydrated: false,
      isLoading: false,
      error: null,

      loadFavorites: async () => {
        set({ isLoading: true, error: null });
        try {
          const dbFavorites = await favoritesApi.getFavorites();
          if (dbFavorites !== null) {
            // User is signed in: merge any local guest favorites to database
            const currentFavorites = get().favorites;
            const unsyncedFavorites = currentFavorites.filter(
              (local) => !dbFavorites.some((db) => db.id === local.id),
            );

            if (unsyncedFavorites.length > 0) {
              await Promise.allSettled(
                unsyncedFavorites.map((meal) => favoritesApi.addFavorite(meal)),
              );
              set({
                favorites: [...unsyncedFavorites, ...dbFavorites],
                isLoading: false,
                hasHydrated: true,
              });
            } else {
              set({ favorites: dbFavorites, isLoading: false, hasHydrated: true });
            }
          } else {
            // Guest mode: keep local storage favorites
            set({ isLoading: false, hasHydrated: true });
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to load favorites';
          set({ error: message, isLoading: false, hasHydrated: true });
        }
      },

      toggleFavorite: async (meal: Meal) => {
        const previousFavorites = get().favorites;
        const exists = previousFavorites.some((item) => item.id === meal.id);

        // Optimistic UI update: sync immediately in memory
        if (exists) {
          set({ favorites: previousFavorites.filter((item) => item.id !== meal.id) });
        } else {
          set({ favorites: [meal, ...previousFavorites] });
        }

        // Background sync with Supabase PostgreSQL
        try {
          if (exists) {
            await favoritesApi.removeFavorite(meal.id);
          } else {
            await favoritesApi.addFavorite(meal);
          }
        } catch (err) {
          console.error('Failed to sync favorite with Supabase, rolling back:', err);
          // Rollback optimistic state
          set({
            favorites: previousFavorites,
            error: err instanceof Error ? err.message : 'Database sync failed',
          });
        }
      },

      isFavorite: (id: string) => {
        return get().favorites.some((item) => item.id === id);
      },

      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state });
      },
    }),
    {
      name: 'the-meal-favorites',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        void state?.loadFavorites();
      },
    },
  ),
);
