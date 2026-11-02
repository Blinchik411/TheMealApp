import type { Meal } from '@/entities/meal';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RelatedMealsSection } from './RelatedMealsSection';

vi.mock('@/features/favorite-meal', () => ({
  FavoriteButton: () => <button type="button">Fav</button>,
}));

const mockRelatedMeal: Meal = {
  id: '123',
  title: 'Related Test Meal',
  image: 'https://example.com/meal.jpg',
  category: 'Seafood',
  cuisine: 'Italian',
  instructions: 'Cook meal',
  ingredients: [],
};

describe('RelatedMealsSection', () => {
  it('returns null when relatedMeals is empty or undefined', () => {
    const { container: emptyContainer } = render(<RelatedMealsSection relatedMeals={[]} />);
    expect(emptyContainer).toBeEmptyDOMElement();

    const { container: undefinedContainer } = render(<RelatedMealsSection />);
    expect(undefinedContainer).toBeEmptyDOMElement();
  });

  it('renders section title, link to category, and related meal cards', () => {
    render(<RelatedMealsSection relatedMeals={[mockRelatedMeal]} category="Seafood" />);

    expect(screen.getByText('More in Seafood')).toBeInTheDocument();
    expect(screen.getByText('Related Test Meal')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view all seafood/i })).toHaveAttribute(
      'href',
      '/?category=Seafood',
    );
  });
});
