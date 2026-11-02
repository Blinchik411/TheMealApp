import type { Meal } from '@/entities/meal';
import { useUserStore } from '@/entities/user';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { favoritesApi } from '../api/favoritesApi';
import { useFavoritesStore } from '../model/favoritesStore';
import { useFavoritesSync } from './useFavoritesSync';

vi.mock('../api/favoritesApi', () => ({
  favoritesApi: {
    getFavorites: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
  },
}));

const mockMeal: Meal = {
  id: '5001',
  title: 'Test Dish',
  image: 'https://example.com/dish.jpg',
  category: 'Vegetarian',
  cuisine: 'Italian',
  instructions: 'Cook it',
  ingredients: [],
};

describe('useFavoritesSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFavoritesStore.setState({ favorites: [], hasHydrated: true });
    useUserStore.setState({ user: null, isLoading: false });
  });

  it('toggles locally when guest user is not logged in', async () => {
    const { result } = renderHook(() => useFavoritesSync());

    let wasAdded = false;
    await act(async () => {
      wasAdded = await result.current.toggleWithSync(mockMeal);
    });

    expect(wasAdded).toBe(true);
    expect(useFavoritesStore.getState().favorites).toEqual([mockMeal]);
    expect(favoritesApi.addFavorite).not.toHaveBeenCalled();
  });

  it('calls favoritesApi.addFavorite when logged in user adds a favorite', async () => {
    useUserStore.setState({ user: { id: 'user-1', email: 'test@example.com' }, isLoading: false });
    vi.mocked(favoritesApi.addFavorite).mockResolvedValue(undefined);

    const { result } = renderHook(() => useFavoritesSync());

    await act(async () => {
      await result.current.toggleWithSync(mockMeal);
    });

    expect(useFavoritesStore.getState().favorites).toEqual([mockMeal]);
    expect(favoritesApi.addFavorite).toHaveBeenCalledWith(mockMeal);
  });

  it('migrates unsynced guest favorites to Supabase when user logs in', async () => {
    useFavoritesStore.setState({ favorites: [mockMeal], hasHydrated: true });
    vi.mocked(favoritesApi.getFavorites).mockResolvedValue([]);
    vi.mocked(favoritesApi.addFavorite).mockResolvedValue(undefined);

    const { rerender } = renderHook(() => useFavoritesSync());

    await act(async () => {
      useUserStore.setState({
        user: { id: 'user-1', email: 'test@example.com' },
        isLoading: false,
      });
      rerender();
    });

    expect(favoritesApi.getFavorites).toHaveBeenCalled();
    expect(favoritesApi.addFavorite).toHaveBeenCalledWith(mockMeal);
  });
});
