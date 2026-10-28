import type { Meal } from '@/entities/meal';
import { beforeEach, describe, expect, it } from 'vitest';
import { useFavoritesStore } from './favoritesStore';

const mockMeal1: Meal = {
  idMeal: '1001',
  strMeal: 'Spaghetti Carbonara',
  strMealThumb: 'https://example.com/carbonara.jpg',
};

const mockMeal2: Meal = {
  idMeal: '1002',
  strMeal: 'Margherita Pizza',
  strMealThumb: 'https://example.com/pizza.jpg',
};

describe('useFavoritesStore', () => {
  beforeEach(() => {
    useFavoritesStore.setState({ favorites: [], hasHydrated: false });
  });

  it('starts with an empty favorites list', () => {
    expect(useFavoritesStore.getState().favorites).toEqual([]);
    expect(useFavoritesStore.getState().isFavorite('1001')).toBe(false);
  });

  it('adds a meal to favorites and updates isFavorite', () => {
    useFavoritesStore.getState().toggleFavorite(mockMeal1);

    expect(useFavoritesStore.getState().favorites).toEqual([mockMeal1]);
    expect(useFavoritesStore.getState().isFavorite('1001')).toBe(true);
  });

  it('removes a meal from favorites when toggled again (prevents duplicates)', () => {
    const { toggleFavorite } = useFavoritesStore.getState();

    toggleFavorite(mockMeal1);
    expect(useFavoritesStore.getState().isFavorite('1001')).toBe(true);

    toggleFavorite(mockMeal1);
    expect(useFavoritesStore.getState().favorites).toEqual([]);
    expect(useFavoritesStore.getState().isFavorite('1001')).toBe(false);
  });

  it('handles multiple meals independently', () => {
    const { toggleFavorite } = useFavoritesStore.getState();

    toggleFavorite(mockMeal1);
    toggleFavorite(mockMeal2);

    expect(useFavoritesStore.getState().favorites).toHaveLength(2);
    expect(useFavoritesStore.getState().isFavorite('1001')).toBe(true);
    expect(useFavoritesStore.getState().isFavorite('1002')).toBe(true);

    toggleFavorite(mockMeal1);
    expect(useFavoritesStore.getState().favorites).toEqual([mockMeal2]);
    expect(useFavoritesStore.getState().isFavorite('1001')).toBe(false);
    expect(useFavoritesStore.getState().isFavorite('1002')).toBe(true);
  });
});
