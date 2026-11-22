import type { IngredientItem } from '@/entities/meal';
import { useMealChecklistStore } from '@/features/meal-checklist';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useIngredientsChecklist } from './useIngredientsChecklist';

const mockIngredients: IngredientItem[] = [
  { id: '1', name: 'Flour', measure: '200g' },
  { id: '2', name: 'Sugar', measure: '100g' },
  { id: '3', name: 'Eggs', measure: '2 pcs' },
];

describe('useIngredientsChecklist', () => {
  beforeEach(() => {
    act(() => {
      useMealChecklistStore.getState().resetChecklist('meal-123');
    });
  });

  it('works with Zustand store when mealId is provided', () => {
    const { result } = renderHook(() =>
      useIngredientsChecklist({
        mealId: 'meal-123',
        ingredients: mockIngredients,
      }),
    );

    expect(result.current.hasProgress).toBe(false);
    expect(result.current.checkedCount).toBe(0);
    expect(result.current.progressPercent).toBe(0);
    expect(result.current.isItemChecked('1')).toBe(false);

    // Toggle item 1
    act(() => {
      result.current.handleToggle('1');
    });

    expect(result.current.isItemChecked('1')).toBe(true);
    expect(result.current.checkedCount).toBe(1);
    expect(result.current.progressPercent).toBe(33);
    expect(result.current.hasProgress).toBe(true);

    // Reset checklist
    act(() => {
      result.current.handleReset();
    });

    expect(result.current.isItemChecked('1')).toBe(false);
    expect(result.current.checkedCount).toBe(0);
    expect(result.current.progressPercent).toBe(0);
    expect(result.current.hasProgress).toBe(false);
  });

  it('works with custom props when mealId is not provided', () => {
    let checkedId = '';
    let isReset = false;

    const { result } = renderHook(() =>
      useIngredientsChecklist({
        ingredients: mockIngredients,
        checkedIngredients: { '2': true },
        checkedIngredientsCount: 1,
        ingredientsProgress: 33,
        hasProgress: true,
        onToggleIngredient: (id) => {
          checkedId = id;
        },
        onReset: () => {
          isReset = true;
        },
      }),
    );

    expect(result.current.isItemChecked('2')).toBe(true);
    expect(result.current.isItemChecked('1')).toBe(false);
    expect(result.current.checkedCount).toBe(1);
    expect(result.current.progressPercent).toBe(33);
    expect(result.current.hasProgress).toBe(true);

    act(() => {
      result.current.handleToggle('1');
    });
    expect(checkedId).toBe('1');

    act(() => {
      result.current.handleReset();
    });
    expect(isReset).toBe(true);
  });
});
