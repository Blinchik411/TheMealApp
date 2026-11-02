import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders branding correctly and does not render Surprise Me CTA banner', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: /themealdb/i })).toBeInTheDocument();
    expect(screen.queryByText(/don't know what to cook today\?/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /surprise me/i })).not.toBeInTheDocument();
  });

  it('renders navigation, cuisines and categories sections', () => {
    render(<Footer />);

    expect(screen.getByRole('heading', { name: /explore/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /world cuisines/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /popular categories/i })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /recipe catalog/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /favorite meals/i })).toHaveAttribute(
      'href',
      '/favorites',
    );

    expect(screen.getByRole('link', { name: /italian cuisine/i })).toHaveAttribute(
      'href',
      '/?area=Italian',
    );
    expect(screen.getByRole('link', { name: /japanese cuisine/i })).toHaveAttribute(
      'href',
      '/?area=Japanese',
    );

    expect(screen.getByRole('link', { name: /seafood/i })).toHaveAttribute(
      'href',
      '/?category=Seafood',
    );
    expect(screen.getByRole('link', { name: /dessert/i })).toHaveAttribute(
      'href',
      '/?category=Dessert',
    );
  });

  it('renders TheMealDB external attribution and github links with safe rel and labels', () => {
    render(<Footer />);

    const mealDbLink = screen.getByRole('link', { name: /powered by themealdb/i });
    expect(mealDbLink).toHaveAttribute('href', 'https://www.themealdb.com/api.php');
    expect(mealDbLink).toHaveAttribute('target', '_blank');
    expect(mealDbLink).toHaveAttribute('rel', 'noopener noreferrer');

    const githubLink = screen.getByRole('link', { name: /github repository/i });
    expect(githubLink).toHaveAttribute('href', 'https://github.com');
    expect(githubLink).toHaveAttribute('target', '_blank');
  });

  it('displays current year in copyright', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} TheMealApp`, 'i'))).toBeInTheDocument();
  });
});
