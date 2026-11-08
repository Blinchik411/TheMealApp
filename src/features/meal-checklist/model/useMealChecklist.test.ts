import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMealChecklistStore } from './mealChecklistStore';
import { useMealChecklist } from './useMealChecklist';

describe('useMealChecklist', () => {
  beforeEach(() => {
    localStorage.clear();
    useMealChecklistStore.getState().resetAll();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useMealChecklistStore.getState().resetAll();
  });

  it('initializes with empty states and 0 progress', () => {
    const { result } = renderHook(() => useMealChecklist({ totalIngredients: 4 }));

    expect(result.current.checkedIngredients).toEqual({});
    expect(result.current.checkedSteps).toEqual({});
    expect(result.current.checkedIngredientsCount).toBe(0);
    expect(result.current.ingredientsProgress).toBe(0);
    expect(result.current.hasProgress).toBe(false);
  });

  it('toggles ingredient checked state and recalculates progress correctly', () => {
    const { result } = renderHook(() => useMealChecklist({ totalIngredients: 4 }));

    act(() => {
      result.current.toggleIngredient('ing-1');
    });

    expect(result.current.checkedIngredients['ing-1']).toBe(true);
    expect(result.current.checkedIngredientsCount).toBe(1);
    expect(result.current.ingredientsProgress).toBe(25);
    expect(result.current.hasProgress).toBe(true);

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
    expect(result.current.hasProgress).toBe(true);

    act(() => {
      result.current.toggleStep(0);
    });

    expect(result.current.checkedSteps[0]).toBe(false);
  });

  it('loads saved checklist state from localStorage', () => {
    localStorage.setItem(
      'meal-checklist-52772',
      JSON.stringify({
        ingredients: { 'ing-1': true },
        steps: { 0: true },
      }),
    );

    const { result } = renderHook(() => useMealChecklist({ mealId: '52772', totalIngredients: 2 }));

    expect(result.current.checkedIngredients).toEqual({ 'ing-1': true });
    expect(result.current.checkedSteps).toEqual({ 0: true });
    expect(result.current.checkedIngredientsCount).toBe(1);
    expect(result.current.ingredientsProgress).toBe(50);
    expect(result.current.hasProgress).toBe(true);
  });

  it('persists checked items to localStorage automatically', () => {
    const { result } = renderHook(() => useMealChecklist({ mealId: '52772', totalIngredients: 2 }));

    act(() => {
      result.current.toggleIngredient('ing-1');
    });

    const stored = JSON.parse(localStorage.getItem('meal-checklist-52772') || '{}');
    expect(stored.ingredients).toEqual({ 'ing-1': true });

    act(() => {
      result.current.toggleStep(1);
    });

    const updatedStored = JSON.parse(localStorage.getItem('meal-checklist-52772') || '{}');
    expect(updatedStored.steps).toEqual({ 1: true });
  });

  it('clears localStorage when reset is called', () => {
    localStorage.setItem(
      'meal-checklist-52772',
      JSON.stringify({
        ingredients: { 'ing-1': true },
        steps: { 0: true },
      }),
    );

    const { result } = renderHook(() => useMealChecklist({ mealId: '52772', totalIngredients: 2 }));

    act(() => {
      result.current.reset();
    });

    expect(result.current.checkedIngredients).toEqual({});
    expect(result.current.checkedSteps).toEqual({});
    expect(result.current.hasProgress).toBe(false);
    expect(localStorage.getItem('meal-checklist-52772')).toBeNull();
  });

  it('handles corrupted JSON in localStorage gracefully without throwing', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('meal-checklist-52772', 'not-valid-json');

    const { result } = renderHook(() => useMealChecklist({ mealId: '52772', totalIngredients: 2 }));

    expect(result.current.checkedIngredients).toEqual({});
    expect(result.current.checkedSteps).toEqual({});
    expect(result.current.hasProgress).toBe(false);
  });

  it('handles 0 total ingredients gracefully without division by zero', () => {
    const { result } = renderHook(() => useMealChecklist({ totalIngredients: 0 }));

    expect(result.current.ingredientsProgress).toBe(0);
  });
});
