import { describe, expect, it } from 'vitest';
import type { Meal } from '../model/types';
import { parseIngredients } from './parseIngredients';

describe('parseIngredients', () => {
  it('parses valid ingredients and measures up to 20 slots', () => {
    const meal: Meal = {
      idMeal: '52772',
      strMeal: 'Teriyaki Chicken Casserole',
      strMealThumb: 'https://example.com/thumb.jpg',
      strIngredient1: 'soy sauce',
      strMeasure1: '3/4 cup',
      strIngredient2: 'water',
      strMeasure2: '1/2 cup',
      strIngredient3: 'brown sugar',
      strMeasure3: '1/4 cup',
    };

    const result = parseIngredients(meal);

    expect(result).toEqual([
      { id: 'soy sauce-1', name: 'soy sauce', measure: '3/4 cup' },
      { id: 'water-2', name: 'water', measure: '1/2 cup' },
      { id: 'brown sugar-3', name: 'brown sugar', measure: '1/4 cup' },
    ]);
  });

  it('trims whitespace and ignores empty string or whitespace-only ingredients', () => {
    const meal: Meal = {
      idMeal: '52772',
      strMeal: 'Test Meal',
      strMealThumb: 'https://example.com/thumb.jpg',
      strIngredient1: '  Chicken Breast  ',
      strMeasure1: ' 2 pieces ',
      strIngredient2: '',
      strMeasure2: '1 tsp',
      strIngredient3: '   ',
      strMeasure3: 'to taste',
      strIngredient4: 'Salt',
      strMeasure4: null,
    };

    const result = parseIngredients(meal);

    expect(result).toEqual([
      { id: 'Chicken Breast-1', name: 'Chicken Breast', measure: '2 pieces' },
      { id: 'Salt-4', name: 'Salt', measure: '' },
    ]);
  });

  it('returns empty array when meal has no ingredients', () => {
    const meal: Meal = {
      idMeal: '99999',
      strMeal: 'Empty Meal',
      strMealThumb: 'https://example.com/thumb.jpg',
    };

    expect(parseIngredients(meal)).toEqual([]);
  });
});
