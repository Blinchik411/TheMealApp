import { describe, expect, it } from 'vitest';
import { mealResponseSchema, mealSchema } from './schema';

describe('mealSchema validation', () => {
  it('should successfully parse valid meal object', () => {
    const rawMeal = {
      idMeal: '52772',
      strMeal: 'Teriyaki Chicken Casserole',
      strMealThumb: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
      strCategory: 'Chicken',
      strArea: 'Japanese',
      strInstructions: 'Preheat oven...',
      strIngredient1: 'soy sauce',
      strMeasure1: '3/4 cup',
    };

    const parsed = mealSchema.parse(rawMeal);
    expect(parsed.idMeal).toBe('52772');
    expect(parsed.strMeal).toBe('Teriyaki Chicken Casserole');
    expect(parsed.strIngredient1).toBe('soy sauce');
  });

  it('should throw error when idMeal is missing', () => {
    const invalidMeal = {
      strMeal: 'Missing ID Meal',
    };

    expect(() => mealSchema.parse(invalidMeal)).toThrow();
  });

  it('should allow nullable fields like strArea, strCategory, strInstructions', () => {
    const rawMeal = {
      idMeal: '999',
      strMeal: 'Recipe with null fields',
      strArea: null,
      strCategory: null,
      strInstructions: null,
      strMealThumb: null,
    };

    const parsed = mealSchema.parse(rawMeal);
    expect(parsed.idMeal).toBe('999');
    expect(parsed.strArea).toBeNull();
    expect(parsed.strCategory).toBeNull();
    expect(parsed.strMealThumb).toBe('');
  });

  it('should validate API response wrapper correctly', () => {
    const validResponse = {
      meals: [
        {
          idMeal: '123',
          strMeal: 'Pasta',
        },
      ],
    };

    const parsed = mealResponseSchema.parse(validResponse);
    expect(parsed.meals).toHaveLength(1);
    expect(parsed.meals?.[0].strMeal).toBe('Pasta');
  });
});
