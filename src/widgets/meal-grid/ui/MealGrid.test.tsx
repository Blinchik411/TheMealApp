import type { Meal } from '@/entities/meal';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MealGrid } from './MealGrid';

vi.mock('@/features/favorite-meal', () => ({
  FavoriteButton: () => <button type="button">Fav</button>,
}));

const mockMeals: Meal[] = [
  {
    id: '1',
    title: 'Chicken Curry',
    image: 'https://example.com/chicken.jpg',
    category: 'Chicken',
    cuisine: 'Indian',
    instructions: 'Cook curry',
    ingredients: [],
  },
  {
    id: '2',
    title: 'Pasta Carbonara',
    image: 'https://example.com/pasta.jpg',
    category: 'Pasta',
    cuisine: 'Italian',
    instructions: 'Cook pasta',
    ingredients: [],
  },
];

describe('MealGrid', () => {
  it('renders skeletons when isLoading is true', () => {
    const { container } = render(<MealGrid meals={[]} isLoading={true} skeletonCount={4} />);

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4);
    expect(container.querySelector('.aspect-square')).toBeInTheDocument();
  });

  it('renders empty message when meals is empty and not loading', () => {
    render(<MealGrid meals={[]} emptyMessage="Custom empty message" />);

    expect(screen.getByText('Nothing Found')).toBeInTheDocument();
    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  it('renders meal cards with dishes when meals are provided', () => {
    render(<MealGrid meals={mockMeals} />);

    expect(screen.getByText('Chicken Curry')).toBeInTheDocument();
    expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /view recipe/i })).toHaveLength(2);
  });
});
