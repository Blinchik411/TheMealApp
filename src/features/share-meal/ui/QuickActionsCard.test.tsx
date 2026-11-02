import type { IngredientItem } from '@/entities/meal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuickActionsCard } from './QuickActionsCard';

const mockIngredients: IngredientItem[] = [
  { id: '1', name: 'Soy Sauce', measure: '2 tbsp' },
  { id: '2', name: 'Water', measure: '1 cup' },
];

describe('QuickActionsCard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders quick action buttons and items count', () => {
    render(<QuickActionsCard mealTitle="Test Meal" ingredients={mockIngredients} />);

    expect(screen.getByRole('button', { name: /copy list/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();
  });

  it('copies ingredients to clipboard and shows feedback', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });

    render(<QuickActionsCard mealTitle="Test Meal" ingredients={mockIngredients} />);

    const copyBtn = screen.getByRole('button', { name: /copy list/i });
    await user.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining('🛒 Ingredients for "Test Meal":'),
    );
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('triggers window.print when print button is clicked', async () => {
    const user = userEvent.setup();
    const printMock = vi.fn();
    window.print = printMock;

    render(<QuickActionsCard mealTitle="Test Meal" ingredients={mockIngredients} />);

    const printBtn = screen.getByRole('button', { name: /print/i });
    await user.click(printBtn);

    expect(printMock).toHaveBeenCalled();
  });
});
