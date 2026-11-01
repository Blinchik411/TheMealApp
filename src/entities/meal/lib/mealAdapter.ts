import type { TheMealDbRawMeal } from '../model/schema';
import type { IngredientItem, Meal } from '../model/types';

export interface MealAdapterOptions {
  fallbackCategory?: string;
  fallbackCuisine?: string;
}

export function mapTheMealDbToMeal(raw: TheMealDbRawMeal, options?: MealAdapterOptions): Meal {
  const ingredients: IngredientItem[] = [];
  const rawRecord = raw as Record<string, unknown>;

  for (let i = 1; i <= 20; i++) {
    const name = rawRecord[`strIngredient${i}`];
    const measure = rawRecord[`strMeasure${i}`];

    if (typeof name === 'string' && name.trim() !== '') {
      ingredients.push({
        id: `${name.trim()}-${i}`,
        name: name.trim(),
        measure: typeof measure === 'string' ? measure.trim() : '',
      });
    }
  }

  return {
    id: raw.idMeal,
    title: raw.strMeal,
    image: raw.strMealThumb ?? '',
    category: raw.strCategory?.trim() || options?.fallbackCategory || 'General',
    cuisine: raw.strArea?.trim() || options?.fallbackCuisine || 'International',
    instructions: raw.strInstructions ?? '',
    tags: raw.strTags
      ? raw.strTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    youtubeUrl: raw.strYoutube ?? undefined,
    ingredients,
  };
}
