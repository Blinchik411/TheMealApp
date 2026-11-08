import { mapSupabaseMealToMeal } from '../lib/supabaseMealAdapter';
import type { Language, Meal } from '../model/types';
import {
  fetchAreasCached,
  fetchCategoriesCached,
  fetchMealsByAreaCached,
  fetchMealsByCategoryCached,
  fetchMealsByLetterCached,
  getMealByIdMemoized,
} from './mealCache';
import {
  type GetMealsFilterOptions,
  buildMealsFilterQuery,
  fetchMealsByOrCondition,
} from './mealQueryBuilder';
import { getRandomMeal } from './mealSampling';

export type { GetMealsFilterOptions } from './mealQueryBuilder';

export const mealApi = {
  async getMealById(idOrSlug: string, lang: Language = 'en'): Promise<Meal | null> {
    return getMealByIdMemoized(idOrSlug, lang);
  },

  async searchByName(name: string, lang: Language = 'en'): Promise<Meal[]> {
    const trimmed = name?.trim();
    if (!trimmed) return [];
    return fetchMealsByOrCondition(
      `name->>ru.ilike.%${trimmed}%,name->>en.ilike.%${trimmed}%`,
      50,
      lang,
    );
  },

  async searchByLetter(letter: string, lang: Language = 'en'): Promise<Meal[]> {
    const char = letter?.trim().charAt(0);
    if (!char) return [];
    return fetchMealsByLetterCached(char, lang);
  },

  async filterByCategory(category: string, lang: Language = 'en'): Promise<Meal[]> {
    const trimmed = category?.trim();
    if (!trimmed) return [];
    return fetchMealsByCategoryCached(trimmed, lang);
  },

  async filterByArea(area: string, lang: Language = 'en'): Promise<Meal[]> {
    const trimmed = area?.trim();
    if (!trimmed) return [];
    return fetchMealsByAreaCached(trimmed, lang);
  },

  async getCategories(lang: Language = 'en'): Promise<string[]> {
    return fetchCategoriesCached(lang);
  },

  async getAreas(lang: Language = 'en'): Promise<string[]> {
    return fetchAreasCached(lang);
  },

  async getRandomMeal(lang: Language = 'en'): Promise<Meal | null> {
    return getRandomMeal(lang);
  },

  async getMeals(options: GetMealsFilterOptions = {}): Promise<Meal[]> {
    try {
      const query = buildMealsFilterQuery(options);
      const { data, error } = await query;
      if (error || !data) return [];
      return data.map((row) => mapSupabaseMealToMeal(row, options.lang ?? 'en'));
    } catch (err) {
      console.error('[mealApi.getMeals] error:', err);
      return [];
    }
  },
};
