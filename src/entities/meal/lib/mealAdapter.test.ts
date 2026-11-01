import { describe, expect, it } from 'vitest';
import type { TheMealDbRawMeal } from '../model/schema';
import { mapTheMealDbToMeal } from './mealAdapter';

describe('mapTheMealDbToMeal', () => {
  it('корректно преобразует полный объект рецепта с ингредиентами', () => {
    const raw: TheMealDbRawMeal = {
      idMeal: '52772',
      strMeal: 'Teriyaki Chicken Casserole',
      strMealThumb: 'https://example.com/thumb.jpg',
      strCategory: 'Chicken',
      strArea: 'Japanese',
      strInstructions: 'Boil water. Add ingredients.',
      strTags: 'Meat,Casserole',
      strYoutube: 'https://youtube.com/watch?v=123',
      strIngredient1: 'soy sauce',
      strMeasure1: '3/4 cup',
      strIngredient2: 'water',
      strMeasure2: '1/2 cup',
    };

    const meal = mapTheMealDbToMeal(raw);

    expect(meal.id).toBe('52772');
    expect(meal.title).toBe('Teriyaki Chicken Casserole');
    expect(meal.category).toBe('Chicken');
    expect(meal.cuisine).toBe('Japanese');
    expect(meal.tags).toEqual(['Meat', 'Casserole']);
    expect(meal.ingredients).toHaveLength(2);
    expect(meal.ingredients[0]).toEqual({
      id: 'soy sauce-1',
      name: 'soy sauce',
      measure: '3/4 cup',
    });
  });

  it('использует fallbackCategory и fallbackCuisine для урезанных объектов (фильтрация)', () => {
    const rawMinimal: TheMealDbRawMeal = {
      idMeal: '52959',
      strMeal: 'Baked salmon',
      strMealThumb: 'https://example.com/salmon.jpg',
    };

    const meal = mapTheMealDbToMeal(rawMinimal, {
      fallbackCategory: 'Seafood',
      fallbackCuisine: 'Italian',
    });

    expect(meal.id).toBe('52959');
    expect(meal.title).toBe('Baked salmon');
    expect(meal.category).toBe('Seafood');
    expect(meal.cuisine).toBe('Italian');
    expect(meal.ingredients).toEqual([]);
    expect(meal.tags).toEqual([]);
  });

  it('использует дефолтные General и International, а также заглушку для фото, если нет данных и fallback', () => {
    const rawMinimal: TheMealDbRawMeal = {
      idMeal: '100',
      strMeal: 'Mystery Dish',
      strMealThumb: '',
    };

    const meal = mapTheMealDbToMeal(rawMinimal);

    expect(meal.category).toBe('General');
    expect(meal.cuisine).toBe('International');
    expect(meal.image).toBe('/placeholder-meal.svg');
  });
});
