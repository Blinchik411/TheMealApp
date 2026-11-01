import type { Meal } from '@/entities/meal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFavoritesStore } from '../model/favoritesStore';
import { FavoriteButton } from './FavoriteButton';

vi.mock('../api/favoritesApi', () => ({
  favoritesApi: {
    getFavorites: vi.fn().mockResolvedValue([]),
    addFavorite: vi.fn().mockResolvedValue(undefined),
    removeFavorite: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockMeal: Meal = {
  id: '52771',
  title: 'Spicy Arrabiata Penne',
  image: 'https://example.com/arrabiata.jpg',
  category: 'Pasta',
  cuisine: 'Italian',
  instructions: 'Cook penne',
  ingredients: [],
};

describe('FavoriteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFavoritesStore.setState({
      favorites: [],
      hasHydrated: false,
      isLoading: false,
      error: null,
    });
  });

  it('renders in initial unliked state with correct aria-label', () => {
    render(<FavoriteButton meal={mockMeal} />);

    const button = screen.getByRole('button', { name: /add to favorites/i });
    expect(button).toBeInTheDocument();
  });

  it('toggles favorite state and updates aria-label on user click', async () => {
    const user = userEvent.setup();
    render(<FavoriteButton meal={mockMeal} />);

    const button = screen.getByRole('button', { name: /add to favorites/i });
    await user.click(button);

    expect(screen.getByRole('button', { name: /remove from favorites/i })).toBeInTheDocument();
    expect(useFavoritesStore.getState().isFavorite(mockMeal.id)).toBe(true);

    await user.click(screen.getByRole('button', { name: /remove from favorites/i }));
    expect(screen.getByRole('button', { name: /add to favorites/i })).toBeInTheDocument();
    expect(useFavoritesStore.getState().isFavorite(mockMeal.id)).toBe(false);
  });

  it('renders label text when showText is true', async () => {
    const user = userEvent.setup();
    render(<FavoriteButton meal={mockMeal} showText />);

    expect(screen.getByText('To Favorites')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /add to favorites/i });
    await user.click(button);

    expect(screen.getByText('In Favorites')).toBeInTheDocument();
  });
});
