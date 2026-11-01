import type { IngredientItem, Meal } from '../model/types';

export const parseIngredients = (meal: Meal): IngredientItem[] => {
  return meal.ingredients ?? [];
};
