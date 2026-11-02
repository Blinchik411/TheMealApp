import type { Meal } from '@/entities/meal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MealDetailsPage } from './MealDetailsPage';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('from=catalog'),
}));

vi.mock('@/features/favorite-meal', () => ({
  FavoriteButton: () => <button type="button">Favorite</button>,
}));

const mockMeal: Meal = {
  id: '52772',
  title: 'Teriyaki Chicken Casserole',
  image: 'https://example.com/teriyaki.jpg',
  category: 'Chicken',
  cuisine: 'Japanese',
  instructions: 'Preheat oven to 350 F.\nBake for 30 minutes.',
  ingredients: [
    { id: 'ing-1', name: 'soy sauce', measure: '3/4 cup' },
    { id: 'ing-2', name: 'water', measure: '1/2 cup' },
  ],
};

const mockRelatedMeal: Meal = {
  id: '52959',
  title: 'Baked Salmon',
  image: 'https://example.com/salmon.jpg',
  category: 'Chicken',
  cuisine: 'Japanese',
  instructions: 'Bake salmon',
  ingredients: [],
};

describe('MealDetailsPage', () => {
  it('renders recipe title, category, cuisine, and ingredients', () => {
    render(<MealDetailsPage meal={mockMeal} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Teriyaki Chicken Casserole' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Chicken')).toBeInTheDocument();
    expect(screen.getByText('Japanese')).toBeInTheDocument();
    expect(screen.getByText('soy sauce')).toBeInTheDocument();
    expect(screen.getByText('3/4 cup')).toBeInTheDocument();
  });

  it('renders related recipes section when relatedMeals are provided', () => {
    render(<MealDetailsPage meal={mockMeal} relatedMeals={[mockRelatedMeal]} />);

    expect(screen.getByText('More in Chicken')).toBeInTheDocument();
    expect(screen.getByText('Baked Salmon')).toBeInTheDocument();
    expect(screen.getByText('View all Chicken')).toBeInTheDocument();
  });

  it('does not render related recipes section when relatedMeals is empty', () => {
    render(<MealDetailsPage meal={mockMeal} relatedMeals={[]} />);

    expect(screen.queryByText('More in Chicken')).not.toBeInTheDocument();
  });

  it('allows checking off ingredients, updates progress, and resets on click', async () => {
    const user = userEvent.setup();
    render(<MealDetailsPage meal={mockMeal} />);

    expect(screen.getAllByText('Click to check off')).toHaveLength(2);
    expect(screen.getByText('0 of 2 (0%)')).toBeInTheDocument();

    const ingredientBtn = screen.getByRole('button', { name: /soy sauce/i });
    expect(ingredientBtn).not.toHaveClass('line-through');

    await user.click(ingredientBtn);
    expect(ingredientBtn).toHaveClass('line-through');
    expect(screen.getByText('1 of 2 (50%)')).toBeInTheDocument();
    expect(screen.getAllByText('Click to check off')).toHaveLength(1);

    const resetBtn = screen.getByRole('button', { name: /reset progress/i });
    expect(resetBtn).toBeInTheDocument();

    await user.click(resetBtn);
    expect(ingredientBtn).not.toHaveClass('line-through');
    expect(screen.getByText('0 of 2 (0%)')).toBeInTheDocument();
    expect(screen.getAllByText('Click to check off')).toHaveLength(2);
  });

  it('renders quick action buttons: copy list, share, and print', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });

    const printMock = vi.fn();
    window.print = printMock;

    render(<MealDetailsPage meal={mockMeal} />);

    const copyBtn = screen.getByRole('button', { name: /copy list/i });
    const shareBtn = screen.getByRole('button', { name: /share/i });
    const printBtn = screen.getByRole('button', { name: /print/i });

    expect(copyBtn).toBeInTheDocument();
    expect(shareBtn).toBeInTheDocument();
    expect(printBtn).toBeInTheDocument();

    await user.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining('🛒 Ingredients for "Teriyaki Chicken Casserole":'),
    );

    await user.click(printBtn);
    expect(printMock).toHaveBeenCalled();
  });

  it('renders a dedicated print layout for physical printing', () => {
    render(<MealDetailsPage meal={mockMeal} />);

    const printLayout = screen.getByTestId('meal-print-layout');
    expect(printLayout).toBeInTheDocument();
    expect(printLayout).toHaveClass('hidden', 'print:block');
  });
});
