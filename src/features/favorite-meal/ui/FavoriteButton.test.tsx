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
  idMeal: '52771',
  strMeal: 'Spicy Arrabiata Penne',
  strMealThumb: 'https://example.com/arrabiata.jpg',
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
    expect(useFavoritesStore.getState().isFavorite(mockMeal.idMeal)).toBe(true);

    await user.click(screen.getByRole('button', { name: /remove from favorites/i }));
    expect(screen.getByRole('button', { name: /add to favorites/i })).toBeInTheDocument();
    expect(useFavoritesStore.getState().isFavorite(mockMeal.idMeal)).toBe(false);
  });

  it('renders label text when showText is true', async () => {
    const user = userEvent.setup();
    render(<FavoriteButton meal={mockMeal} showText />);

    expect(screen.getByText('To Favorites')).toBeInTheDocument();

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('In Favorites')).toBeInTheDocument();
  });

  it('stops event propagation when stopProp is enabled', async () => {
    const parentClick = vi.fn();
    const user = userEvent.setup();

    render(
      <div onClick={parentClick} onKeyDown={() => {}}>
        <FavoriteButton meal={mockMeal} stopProp />
      </div>,
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(parentClick).not.toHaveBeenCalled();
  });
});
