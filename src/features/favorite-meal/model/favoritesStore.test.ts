import type { Meal } from '@/entities/meal';
import { beforeEach, describe, expect, it } from 'vitest';
import { useFavoritesStore } from './favoritesStore';

const mockMeal1: Meal = {
  id: '1001',
  title: 'Spaghetti Carbonara',
  image: 'https://example.com/carbonara.jpg',
  category: 'Pasta',
  cuisine: 'Italian',
  instructions: 'Cook pasta',
  ingredients: [],
};

const mockMeal2: Meal = {
  id: '1002',
  title: 'Margherita Pizza',
  image: 'https://example.com/pizza.jpg',
  category: 'Pizza',
  cuisine: 'Italian',
  instructions: 'Bake pizza',
  ingredients: [],
};

describe('useFavoritesStore', () => {
  beforeEach(() => {
    useFavoritesStore.setState({
      favorites: [],
      hasHydrated: false,
    });
  });

  it('starts with an empty favorites list', () => {
    expect(useFavoritesStore.getState().favorites).toEqual([]);
    expect(useFavoritesStore.getState().isFavorite('1001')).toBe(false);
  });

  it('adds a meal to favorites and updates isFavorite', () => {
    const wasAdded = useFavoritesStore.getState().toggleFavorite(mockMeal1);

    expect(wasAdded).toBe(true);
    expect(useFavoritesStore.getState().favorites).toEqual([mockMeal1]);
    expect(useFavoritesStore.getState().isFavorite('1001')).toBe(true);
  });

  it('removes a meal from favorites when toggled again (prevents duplicates)', () => {
    const { toggleFavorite } = useFavoritesStore.getState();

    const added = toggleFavorite(mockMeal1);
    expect(added).toBe(true);
    expect(useFavoritesStore.getState().favorites).toHaveLength(1);

    const removed = toggleFavorite(mockMeal1);
    expect(removed).toBe(false);
    expect(useFavoritesStore.getState().favorites).toHaveLength(0);
    expect(useFavoritesStore.getState().isFavorite('1001')).toBe(false);
  });

  it('toggles multiple different meals correctly', () => {
    const { toggleFavorite } = useFavoritesStore.getState();

    toggleFavorite(mockMeal1);
    toggleFavorite(mockMeal2);

    expect(useFavoritesStore.getState().favorites).toHaveLength(2);
    expect(useFavoritesStore.getState().isFavorite('1001')).toBe(true);
    expect(useFavoritesStore.getState().isFavorite('1002')).toBe(true);
  });
});
