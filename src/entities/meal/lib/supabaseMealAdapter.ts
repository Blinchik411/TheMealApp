import type { LocalizedText, Tables } from '@/shared/api';
import type {
  IngredientItem,
  Language,
  Meal,
  MealDietary,
  MealNutrition,
  MealStep,
} from '../model/types';

export const DEFAULT_MEAL_IMAGE = '/placeholder-meal.svg';

export type SupabaseMealRow = Tables<'meals'>;

function isLocalizedText(val: unknown): val is LocalizedText {
  return typeof val === 'object' && val !== null && 'en' in val && 'ru' in val;
}

function resolveLocalized(
  val: LocalizedText | string | null | undefined,
  lang: Language,
  fallback = '',
): string {
  if (!val) return fallback;
  if (isLocalizedText(val)) {
    return val[lang] || val.en || val.ru || fallback;
  }
  return String(val);
}

export function mapSupabaseMealToMeal(row: SupabaseMealRow, lang: Language = 'en'): Meal {
  // Localized or fallback fields
  const title = resolveLocalized(row.name, lang, 'Untitled');
  const category = resolveLocalized(row.category, lang, 'General');
  const cuisine = resolveLocalized(row.area, lang, 'International');
  const instructionsText = resolveLocalized(row.instructions, lang, '');

  // Normalized ingredients
  const ingredients: IngredientItem[] = (row.ingredients || []).map((item, idx) => {
    const ingName = resolveLocalized(item.ingredient, lang, '');
    const ingMeasure = resolveLocalized(item.measure, lang, '');
    const nameObj = isLocalizedText(item.ingredient) ? item.ingredient : undefined;
    const measureObj = isLocalizedText(item.measure) ? item.measure : undefined;

    return {
      id: `${row.id}-ing-${idx + 1}`,
      name: ingName,
      measure: ingMeasure,
      imageUrl: item.imageUrl,
      nameObj,
      measureObj,
    };
  });

  // Localized tags
  let tags: string[] = [];
  if (Array.isArray(row.tags)) {
    tags = row.tags;
  } else if (isLocalizedText(row.tags)) {
    tags = row.tags[lang] || row.tags.ru || row.tags.en || [];
  }

  return {
    id: row.id,
    slug: row.slug || row.id,
    title,
    name: isLocalizedText(row.name) ? row.name : { en: title, ru: title },
    image: row.image_url?.trim() ? row.image_url.trim() : DEFAULT_MEAL_IMAGE,
    category,
    categoryObj: isLocalizedText(row.category) ? row.category : { en: category, ru: category },
    cuisine,
    areaObj: isLocalizedText(row.area) ? row.area : { en: cuisine, ru: cuisine },
    instructions: instructionsText,
    instructionsObj: isLocalizedText(row.instructions)
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
