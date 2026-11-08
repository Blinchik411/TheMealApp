import { supabase } from '@/shared/api';
import { mapSupabaseMealToMeal } from '../lib/supabaseMealAdapter';
import type { Language, Meal } from '../model/types';

export interface GetMealsFilterOptions {
  search?: string;
  category?: string;
  area?: string;
  mealType?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  maxTime?: number;
  dietary?: {
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isDairyFree?: boolean;
  };
  limit?: number;
  offset?: number;
  lang?: Language;
}

export function buildMealsFilterQuery(options: GetMealsFilterOptions = {}) {
  const {
    search,
    category,
    area,
    mealType,
    difficulty,
    maxTime,
    dietary,
    limit = 24,
    offset = 0,
  } = options;
  let query = supabase.from('meals').select('*');

  if (search?.trim())
    query = query.or(`name->>ru.ilike.%${search.trim()}%,name->>en.ilike.%${search.trim()}%`);
  if (category?.trim())
    query = query.or(`category->>en.eq.${category.trim()},category->>ru.eq.${category.trim()}`);
  if (area?.trim()) query = query.or(`area->>en.eq.${area.trim()},area->>ru.eq.${area.trim()}`);
  if (mealType?.trim()) query = query.contains('meal_type', [mealType.trim().toLowerCase()]);
  if (difficulty) query = query.eq('difficulty', difficulty);
  if (maxTime && maxTime > 0) query = query.lte('total_time_minutes', maxTime);
  if (dietary?.isVegetarian) query = query.eq('dietary->>isVegetarian', 'true');
  if (dietary?.isVegan) query = query.eq('dietary->>isVegan', 'true');
  if (dietary?.isGlutenFree) query = query.eq('dietary->>isGlutenFree', 'true');
  if (dietary?.isDairyFree) query = query.eq('dietary->>isDairyFree', 'true');

  return query.order('id', { ascending: true }).range(offset, offset + limit - 1);
}

export async function fetchMealByIdRaw(idOrSlug: string, lang: Language): Promise<Meal | null> {
  try {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
      .maybeSingle();

    if (error || !data) return null;
    return mapSupabaseMealToMeal(data, lang);
  } catch (err) {
    console.error('[mealQueryBuilder.fetchMealByIdRaw] error:', err);
    return null;
  }
}

export async function fetchMealsByOrCondition(
  orCondition: string,
  limit: number,
  lang: Language,
): Promise<Meal[]> {
  try {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .or(orCondition)
      .order('id', { ascending: true })
      .limit(limit);

    if (error || !data) return [];
    return data.map((row) => mapSupabaseMealToMeal(row, lang));
  } catch (err) {
    console.error('[mealQueryBuilder.fetchMealsByOrCondition] error:', err);
    return [];
  }
}
