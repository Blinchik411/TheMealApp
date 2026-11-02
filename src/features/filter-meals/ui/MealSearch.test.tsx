import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MealSearch } from './MealSearch';

describe('MealSearch (Progressive Enhancement)', () => {
  it('renders native GET form attributes and input with name="search" and aria-label', () => {
    render(<MealSearch value="Pancake" action="/search-recipes" />);

    const form = screen.getByRole('button', { name: 'Search' }).closest('form');
    expect(form).toHaveAttribute('action', '/search-recipes');
    expect(form).toHaveAttribute('method', 'GET');

    const input = screen.getByRole('textbox', {
      name: /search recipes/i,
    });
    expect(input).toHaveAttribute('name', 'search');
    expect(input).toHaveValue('Pancake');
  });

  it('renders hidden inputs to preserve active filters on native submission', () => {
    const { container } = render(
      <MealSearch
        value=""
        action="/"
        hiddenFields={{
          category: 'Dessert',
          area: 'Canadian',
          empty: undefined,
        }}
      />,
    );

    const hiddenCategory = container.querySelector('input[type="hidden"][name="category"]');
    const hiddenArea = container.querySelector('input[type="hidden"][name="area"]');
    const hiddenEmpty = container.querySelector('input[type="hidden"][name="empty"]');

    expect(hiddenCategory).toHaveValue('Dessert');
    expect(hiddenArea).toHaveValue('Canadian');
    expect(hiddenEmpty).toBeNull();
  });

  it('calls onSearch when user submits the form with JavaScript enabled', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(<MealSearch value="" onSearch={handleSearch} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Lasagna');

    const submitBtn = screen.getByRole('button', { name: 'Search' });
    await user.click(submitBtn);

    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith('Lasagna');
  });

  it('trims whitespace and submits when Enter key is pressed', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(<MealSearch value="" onSearch={handleSearch} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '  Carbonara  {Enter}');

    expect(handleSearch).toHaveBeenCalledWith('Carbonara');
  });

  it('clears input and triggers onSearch with empty string when clear button is clicked', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(<MealSearch value="Soup" onSearch={handleSearch} />);

    const clearBtn = screen.getByRole('button', { name: /clear search/i });
    await user.click(clearBtn);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
    expect(handleSearch).toHaveBeenCalledWith('');
  });
});
