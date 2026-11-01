import { describe, expect, it } from 'vitest';
import { mealSchema, theMealDbRawMealSchema, theMealDbResponseSchema } from './schema';

describe('mealSchema validation', () => {
  it('should successfully parse valid domain meal object', () => {
    const validMeal = {
      id: '52772',
      title: 'Teriyaki Chicken Casserole',
      image: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
      category: 'Chicken',
      cuisine: 'Japanese',
      instructions: 'Preheat oven...',
      ingredients: [{ id: '1', name: 'soy sauce', measure: '3/4 cup' }],
    };

    const parsed = mealSchema.parse(validMeal);
    expect(parsed.id).toBe('52772');
    expect(parsed.title).toBe('Teriyaki Chicken Casserole');
    expect(parsed.ingredients[0]?.name).toBe('soy sauce');
  });

  it('should validate theMealDb raw response wrapper correctly', () => {
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

    const parsed = theMealDbRawMealSchema.parse(rawMeal);
    expect(parsed.idMeal).toBe('52772');
    expect(parsed.strMeal).toBe('Teriyaki Chicken Casserole');

    const validResponse = { meals: [rawMeal] };
    const parsedResponse = theMealDbResponseSchema.parse(validResponse);
    expect(parsedResponse.meals).toHaveLength(1);
  });
});
