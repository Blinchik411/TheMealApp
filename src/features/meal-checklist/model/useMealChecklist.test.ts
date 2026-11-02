import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useMealChecklist } from './useMealChecklist';

describe('useMealChecklist', () => {
  it('initializes with empty states and 0 progress', () => {
    const { result } = renderHook(() => useMealChecklist({ totalIngredients: 4 }));

    expect(result.current.checkedIngredients).toEqual({});
    expect(result.current.checkedSteps).toEqual({});
    expect(result.current.checkedIngredientsCount).toBe(0);
    expect(result.current.ingredientsProgress).toBe(0);
  });

  it('toggles ingredient checked state and recalculates progress correctly', () => {
    const { result } = renderHook(() => useMealChecklist({ totalIngredients: 4 }));

    act(() => {
      result.current.toggleIngredient('ing-1');
    });

    expect(result.current.checkedIngredients['ing-1']).toBe(true);
    expect(result.current.checkedIngredientsCount).toBe(1);
    expect(result.current.ingredientsProgress).toBe(25);

    act(() => {
      result.current.toggleIngredient('ing-2');
    });

    expect(result.current.checkedIngredientsCount).toBe(2);
    expect(result.current.ingredientsProgress).toBe(50);

    act(() => {
      result.current.toggleIngredient('ing-1');
    });

    expect(result.current.checkedIngredients['ing-1']).toBe(false);
    expect(result.current.checkedIngredientsCount).toBe(1);
    expect(result.current.ingredientsProgress).toBe(25);
  });

  it('toggles step checked state correctly', () => {
    const { result } = renderHook(() => useMealChecklist({ totalIngredients: 2 }));

    act(() => {
      result.current.toggleStep(0);
    });

    expect(result.current.checkedSteps[0]).toBe(true);

    act(() => {
      result.current.toggleStep(0);
    });

    expect(result.current.checkedSteps[0]).toBe(false);
  });

  it('resets all checked items', () => {
    const { result } = renderHook(() => useMealChecklist({ totalIngredients: 2 }));

    act(() => {
      result.current.toggleIngredient('ing-1');
      result.current.toggleStep(1);
    });

    expect(result.current.checkedIngredientsCount).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.checkedIngredients).toEqual({});
    expect(result.current.checkedSteps).toEqual({});
    expect(result.current.checkedIngredientsCount).toBe(0);
    expect(result.current.ingredientsProgress).toBe(0);
  });

  it('handles 0 total ingredients gracefully without division by zero', () => {
    const { result } = renderHook(() => useMealChecklist({ totalIngredients: 0 }));

    expect(result.current.ingredientsProgress).toBe(0);
  });
});
