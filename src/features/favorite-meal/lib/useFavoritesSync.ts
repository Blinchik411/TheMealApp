'use client';

import type { Meal } from '@/entities/meal';
import { useUserStore } from '@/entities/user';
import { useCallback, useEffect, useRef, useState } from 'react';
import { favoritesApi } from '../api/favoritesApi';
import { useFavoritesStore } from '../model/favoritesStore';

export const useFavoritesSync = () => {
  const user = useUserStore((state) => state.user);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const syncedUserIdRef = useRef<string | null>(null);

  const syncWithCloud = useCallback(async () => {
    if (!user) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      const dbFavorites = await favoritesApi.getFavorites();
      if (Array.isArray(dbFavorites)) {
        const localFavorites = useFavoritesStore.getState().favorites;
        const unsyncedFavorites = localFavorites.filter(
          (local) => !dbFavorites.some((db) => db.id === local.id),
        );

        if (unsyncedFavorites.length > 0) {
          // Migrate local guest favorites to Supabase
          await Promise.allSettled(unsyncedFavorites.map((meal) => favoritesApi.addFavorite(meal)));
          useFavoritesStore.getState().setFavorites([...unsyncedFavorites, ...dbFavorites]);
        } else {
          useFavoritesStore.getState().setFavorites(dbFavorites);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync favorites with cloud';
      console.error('[FavoritesSync Error]:', err);
      setSyncError(message);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  // Automatically sync when user logs in
  useEffect(() => {
    if (user?.id && syncedUserIdRef.current !== user.id) {
      syncedUserIdRef.current = user.id;
      void syncWithCloud();
    } else if (!user) {
      syncedUserIdRef.current = null;
    }
  }, [user, syncWithCloud]);

  const toggleWithSync = useCallback(
    async (meal: Meal): Promise<boolean> => {
      // 1. Optimistic local update
      const wasAdded = useFavoritesStore.getState().toggleFavorite(meal);

      // 2. Cloud sync if logged in
      if (user) {
        try {
          if (wasAdded) {
            await favoritesApi.addFavorite(meal);
          } else {
            await favoritesApi.removeFavorite(meal.id);
          }
        } catch (err) {
          console.error(
            '[FavoritesSync Error] Failed to sync toggle with Supabase, rolling back:',
            err,
          );
          // Rollback local state
          useFavoritesStore.getState().toggleFavorite(meal);
          setSyncError(err instanceof Error ? err.message : 'Database sync failed');
          return !wasAdded;
        }
      }

      return wasAdded;
    },
    [user],
  );

  return {
    isSyncing,
    syncError,
    syncWithCloud,
    toggleWithSync,
  };
};
