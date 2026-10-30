import { API_ENDPOINTS } from '@/shared/api/endpoints';
import { areaResponseSchema, categoryResponseSchema, mealResponseSchema } from '../model/schema';
import type { Meal } from '../model/types';

export const mealApi = {
  async getMealById(id: string): Promise<Meal | null> {
    const res = await fetch(API_ENDPOINTS.getMealById(id), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Failed to load recipe');
    const raw: unknown = await res.json();
    const parsed = mealResponseSchema.parse(raw);
    return parsed.meals?.[0] ?? null;
  },

  async searchByName(name: string): Promise<Meal[]> {
    const res = await fetch(API_ENDPOINTS.searchByName(name));
    if (!res.ok) throw new Error('Failed to search recipes');
    const raw: unknown = await res.json();
    const parsed = mealResponseSchema.parse(raw);
    return parsed.meals ?? [];
  },

  async searchByLetter(letter: string): Promise<Meal[]> {
    const res = await fetch(API_ENDPOINTS.searchByFirstLetter(letter));
    if (!res.ok) throw new Error('Failed to load recipes');
    const raw: unknown = await res.json();
    const parsed = mealResponseSchema.parse(raw);
    return parsed.meals ?? [];
  },

  async filterByCategory(category: string): Promise<Meal[]> {
    const res = await fetch(API_ENDPOINTS.searchByCategory(category));
    if (!res.ok) throw new Error('Failed to filter by category');
    const raw: unknown = await res.json();
    const parsed = mealResponseSchema.parse(raw);
    return parsed.meals ?? [];
  },

  async filterByArea(area: string): Promise<Meal[]> {
    const res = await fetch(API_ENDPOINTS.searchByArea(area));
    if (!res.ok) throw new Error('Failed to filter by cuisine');
    const raw: unknown = await res.json();
    const parsed = mealResponseSchema.parse(raw);
    return parsed.meals ?? [];
  },

  async getCategories(): Promise<string[]> {
    const res = await fetch(API_ENDPOINTS.getCategoryList(), {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error('Failed to load categories');
    const raw: unknown = await res.json();
    const parsed = categoryResponseSchema.parse(raw);
    const categories = parsed.meals?.map((item) => item.strCategory).filter(Boolean) ?? [];
    return Array.from(new Set(categories)).sort();
  },

  async getAreas(): Promise<string[]> {
    const res = await fetch(API_ENDPOINTS.getAreaList(), {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error('Failed to load cuisines');
    const raw: unknown = await res.json();
    const parsed = areaResponseSchema.parse(raw);
    const areas = parsed.meals?.map((item) => item.strArea).filter(Boolean) ?? [];
    return Array.from(new Set(areas)).sort();
  },
};
