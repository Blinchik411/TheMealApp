import type { IngredientItem, Meal } from '../model/types';

export const parseIngredients = (meal: Meal): IngredientItem[] => {
  const ingredients: IngredientItem[] = [];

  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (typeof name === 'string' && name.trim() !== '') {
      ingredients.push({
        id: `${name.trim()}-${i}`,
        name: name.trim(),
        measure: typeof measure === 'string' ? measure.trim() : '',
      });
    }
  }

  return ingredients;
};
