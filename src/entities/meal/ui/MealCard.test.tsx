import type { Meal } from '@/entities/meal';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MealCard } from './MealCard';

vi.mock('@/shared/config/i18n', () => ({
  Link: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      viewRecipe: 'View Recipe',
    };
    return translations[key] || key;
  },
}));

describe('MealCard', () => {
  const baseMeal: Meal = {
    id: '52772',
    slug: 'teriyaki-chicken-casserole',
    title: 'Teriyaki Chicken Casserole',
    image: 'https://example.com/teriyaki.jpg',
    category: 'Chicken',
    cuisine: 'Japanese',
    instructions: 'Mix and bake.',
    ingredients: [],
  };

  it('generates link using slug when available', () => {
    render(<MealCard meal={baseMeal} />);

    const link = screen.getByRole('link', { name: /view recipe/i });
    expect(link).toHaveAttribute('href', '/meal/teriyaki-chicken-casserole');
  });

  it('falls back to meal id when slug is absent', () => {
    const mealWithoutSlug: Meal = {
      ...baseMeal,
      slug: undefined,
    };

    render(<MealCard meal={mealWithoutSlug} />);

    const link = screen.getByRole('link', { name: /view recipe/i });
    expect(link).toHaveAttribute('href', '/meal/52772');
  });

  it('preserves from parameter in link query', () => {
    render(<MealCard meal={baseMeal} from="favorites" />);

    const link = screen.getByRole('link', { name: /view recipe/i });
    expect(link).toHaveAttribute('href', '/meal/teriyaki-chicken-casserole?from=favorites');
  });

  it('renders category, cuisine, and title correctly', () => {
    render(<MealCard meal={baseMeal} />);

    expect(screen.getByText('Chicken')).toBeInTheDocument();
    expect(screen.getByText('Japanese')).toBeInTheDocument();
    expect(screen.getByText('Teriyaki Chicken Casserole')).toBeInTheDocument();
  });
});
