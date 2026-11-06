import type {
  IngredientItem,
  Language,
  Meal,
  MealDietary,
  MealNutrition,
  MealStep,
} from '../model/types';

export const DEFAULT_MEAL_IMAGE = '/placeholder-meal.svg';

export interface SupabaseMealRow {
  id: string;
  slug: string;
  name: { en: string; ru: string };
  category: { en: string; ru: string };
  area: { en: string; ru: string };
  meal_type: string[];
  dietary: MealDietary;
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  total_time_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  nutrition: MealNutrition;
  image_url: string;
  youtube_url: string | null;
  source_url: string | null;
  tags: { en: string[]; ru: string[] } | string[];
  ingredients: Array<{
    ingredient: { en: string; ru: string } | string;
    measure: { en: string; ru: string } | string;
    imageUrl?: string;
  }>;
  steps: MealStep[];
  instructions: { en: string; ru: string } | string;
}

export function mapSupabaseMealToMeal(row: SupabaseMealRow, lang: Language = 'ru'): Meal {
  // Localized or fallback fields
  const title =
    typeof row.name === 'object' && row.name !== null
      ? row.name[lang] || row.name.ru || row.name.en || 'Без названия'
      : String(row.name || 'Без названия');

  const category =
    typeof row.category === 'object' && row.category !== null
      ? row.category[lang] || row.category.ru || row.category.en || 'Разное'
      : String(row.category || 'Разное');

  const cuisine =
    typeof row.area === 'object' && row.area !== null
      ? row.area[lang] || row.area.ru || row.area.en || 'Международная'
      : String(row.area || 'Международная');

  const instructionsText =
    typeof row.instructions === 'object' && row.instructions !== null
      ? row.instructions[lang] || row.instructions.ru || row.instructions.en || ''
      : String(row.instructions || '');

  // Normalized ingredients
  const ingredients: IngredientItem[] = (row.ingredients || []).map((item, idx) => {
    const isNameObj = typeof item.ingredient === 'object' && item.ingredient !== null;
    const isMeasureObj = typeof item.measure === 'object' && item.measure !== null;

    const ingName = isNameObj
      ? (item.ingredient as { en: string; ru: string })[lang] ||
        (item.ingredient as { en: string; ru: string }).ru ||
        (item.ingredient as { en: string; ru: string }).en
      : String(item.ingredient || '');

    const ingMeasure = isMeasureObj
      ? (item.measure as { en: string; ru: string })[lang] ||
        (item.measure as { en: string; ru: string }).ru ||
        (item.measure as { en: string; ru: string }).en
      : String(item.measure || '');

    return {
      id: `${row.id}-ing-${idx + 1}`,
      name: ingName,
      measure: ingMeasure,
      imageUrl: item.imageUrl,
      nameObj: isNameObj ? (item.ingredient as { en: string; ru: string }) : undefined,
      measureObj: isMeasureObj ? (item.measure as { en: string; ru: string }) : undefined,
    };
  });

  // Localized tags
  let tags: string[] = [];
  if (Array.isArray(row.tags)) {
    tags = row.tags;
  } else if (typeof row.tags === 'object' && row.tags !== null) {
    tags = row.tags[lang] || row.tags.ru || row.tags.en || [];
  }

  return {
    id: row.id,
    slug: row.slug || row.id,
    title,
    name: typeof row.name === 'object' ? row.name : { en: title, ru: title },
    image: row.image_url?.trim() ? row.image_url.trim() : DEFAULT_MEAL_IMAGE,
    category,
    categoryObj: typeof row.category === 'object' ? row.category : { en: category, ru: category },
    cuisine,
    areaObj: typeof row.area === 'object' ? row.area : { en: cuisine, ru: cuisine },
    instructions: instructionsText,
    instructionsObj:
      typeof row.instructions === 'object'
        ? row.instructions
        : { en: instructionsText, ru: instructionsText },
    servings: row.servings || 4,
    prepTimeMinutes: row.prep_time_minutes || 10,
    cookTimeMinutes: row.cook_time_minutes || 20,
    totalTimeMinutes:
      row.total_time_minutes || (row.prep_time_minutes || 10) + (row.cook_time_minutes || 20),
    difficulty: row.difficulty || 'easy',
    nutrition: row.nutrition || { calories: 500, protein: 25, fat: 20, carbs: 45 },
    dietary: row.dietary || {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isDairyFree: false,
    },
    mealType: row.meal_type || ['lunch', 'dinner'],
    steps: row.steps || [],
    tags,
    youtubeUrl: row.youtube_url || undefined,
    sourceUrl: row.source_url || undefined,
    ingredients,
  };
}
