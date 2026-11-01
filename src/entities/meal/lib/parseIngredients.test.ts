import { describe, expect, it } from 'vitest';
import type { Meal } from '../model/types';
import { parseIngredients } from './parseIngredients';

describe('parseIngredients', () => {
  it('returns ingredients from meal', () => {
    const meal: Meal = {
      id: '52772',
      title: 'Teriyaki Chicken Casserole',
      image: 'https://example.com/thumb.jpg',
      category: 'Chicken',
      cuisine: 'Japanese',
      instructions: 'Preheat oven...',
      ingredients: [
        { id: 'soy sauce-1', name: 'soy sauce', measure: '3/4 cup' },
        { id: 'water-2', name: 'water', measure: '1/2 cup' },
      ],
    };

    const result = parseIngredients(meal);

    expect(result).toEqual([
      { id: 'soy sauce-1', name: 'soy sauce', measure: '3/4 cup' },
      { id: 'water-2', name: 'water', measure: '1/2 cup' },
    ]);
  });

  it('returns empty array when meal has no ingredients', () => {
    const meal: Meal = {
      id: '99999',
      title: 'Empty Meal',
      image: 'https://example.com/thumb.jpg',
      category: 'General',
      cuisine: 'International',
      instructions: '',
      ingredients: [],
    };

    expect(parseIngredients(meal)).toEqual([]);
  });
});
