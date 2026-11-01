import { API_ENDPOINTS } from '@/shared/api';
import type { z } from 'zod';
import { mapTheMealDbToMeal } from '../lib/mealAdapter';
import {
  areaResponseSchema,
  categoryResponseSchema,
  theMealDbResponseSchema,
} from '../model/schema';
import type { Meal } from '../model/types';

const REQUEST_TIMEOUT_MS = 8000;
const REVALIDATE_RECIPES = 3600;
const REVALIDATE_META = 86400;

async function fetchTheMealDb<T>(
  url: string,
  schema: z.ZodType<T>,
  revalidate: number,
  errorMessage: string,
): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`${errorMessage} (HTTP ${res.status})`);
  }

  let raw: unknown;
  try {
    raw = await res.json();
  } catch {
    throw new Error(`${errorMessage}: Invalid JSON response`);
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.error(`[MealApi Validation Error] at ${url}:`, parsed.error.format());
    throw new Error(`${errorMessage}: API contract mismatch`);
  }

  return parsed.data;
}

export const mealApi = {
  async getMealById(id: string): Promise<Meal | null> {
    const trimmedId = id?.trim();
    if (!trimmedId) return null;

    const data = await fetchTheMealDb(
      API_ENDPOINTS.getMealById(trimmedId),
      theMealDbResponseSchema,
      REVALIDATE_RECIPES,
      'Failed to load recipe',
    );
    const firstMeal = data.meals?.[0];
    return firstMeal ? mapTheMealDbToMeal(firstMeal) : null;
  },

  async searchByName(name: string): Promise<Meal[]> {
    const trimmed = name?.trim();
    if (!trimmed) return [];

    const data = await fetchTheMealDb(
      API_ENDPOINTS.searchByName(trimmed),
      theMealDbResponseSchema,
      REVALIDATE_RECIPES,
      'Failed to search recipes',
    );
    return (data.meals ?? []).map((m) => mapTheMealDbToMeal(m));
  },

  async searchByLetter(letter: string): Promise<Meal[]> {
    const char = letter?.trim().charAt(0);
    if (!char) return [];

    const data = await fetchTheMealDb(
      API_ENDPOINTS.searchByFirstLetter(char),
      theMealDbResponseSchema,
      REVALIDATE_RECIPES,
      'Failed to load recipes by letter',
    );
    return (data.meals ?? []).map((m) => mapTheMealDbToMeal(m));
  },

  async filterByCategory(category: string): Promise<Meal[]> {
    const trimmed = category?.trim();
    if (!trimmed) return [];

    const data = await fetchTheMealDb(
      API_ENDPOINTS.searchByCategory(trimmed),
      theMealDbResponseSchema,
      REVALIDATE_RECIPES,
      'Failed to filter by category',
    );
    return (data.meals ?? []).map((m) => mapTheMealDbToMeal(m, { fallbackCategory: trimmed }));
  },

  async filterByArea(area: string): Promise<Meal[]> {
    const trimmed = area?.trim();
    if (!trimmed) return [];

    const data = await fetchTheMealDb(
      API_ENDPOINTS.searchByArea(trimmed),
      theMealDbResponseSchema,
      REVALIDATE_RECIPES,
      'Failed to filter by cuisine',
    );
    return (data.meals ?? []).map((m) => mapTheMealDbToMeal(m, { fallbackCuisine: trimmed }));
  },

  async getCategories(): Promise<string[]> {
    const data = await fetchTheMealDb(
      API_ENDPOINTS.getCategoryList(),
      categoryResponseSchema,
      REVALIDATE_META,
      'Failed to load categories',
    );
    const categories =
      data.meals
        ?.map((item) => item.strCategory)
        .filter((cat): cat is string => typeof cat === 'string' && cat.trim() !== '') ?? [];
    return Array.from(new Set(categories)).sort();
  },

  async getAreas(): Promise<string[]> {
    const data = await fetchTheMealDb(
      API_ENDPOINTS.getAreaList(),
      areaResponseSchema,
      REVALIDATE_META,
      'Failed to load cuisines',
    );
    const areas =
      data.meals
        ?.map((item) => item.strArea)
        .filter((area): area is string => typeof area === 'string' && area.trim() !== '') ?? [];
    return Array.from(new Set(areas)).sort();
  },
};
