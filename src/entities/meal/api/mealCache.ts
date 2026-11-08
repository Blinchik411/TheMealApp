import { supabase } from '@/shared/api';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import type { Language, Meal } from '../model/types';
import { fetchMealByIdRaw, fetchMealsByOrCondition } from './mealQueryBuilder';

export const CACHE_TAGS = { MEALS: 'meals', CATEGORIES: 'categories', AREAS: 'areas' } as const;
export const CACHE_TTL = { HOUR: 3600, DAY: 86400 } as const;

export async function fetchCategoriesRaw(lang: Language = 'en'): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .neq('id', 'test')
      .order('count', { ascending: false });
    if (error || !data) return [];
    return data.map((row) => row.name[lang] || row.name.en || row.name.ru).filter(Boolean);
  } catch (err) {
    console.error('[mealCache.fetchCategories] error:', err);
    return [];
  }
}

export async function fetchAreasRaw(lang: Language = 'en'): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('areas')
      .select('name')
      .order('count', { ascending: false });
    if (error || !data) return [];
    return data.map((row) => row.name[lang] || row.name.en || row.name.ru).filter(Boolean);
  } catch (err) {
    console.error('[mealCache.fetchAreas] error:', err);
    return [];
  }
}

export const fetchMealByIdCached = unstable_cache(fetchMealByIdRaw, ['meal-by-id'], {
  revalidate: CACHE_TTL.HOUR,
  tags: [CACHE_TAGS.MEALS],
});

export const getMealByIdMemoized = cache(
  async (idOrSlug: string, lang: Language = 'en'): Promise<Meal | null> => {
    const trimmed = idOrSlug?.trim();
    if (!trimmed) return null;
    return fetchMealByIdCached(trimmed, lang);
  },
);

export const fetchCategoriesCached = unstable_cache(
  (lang: Language = 'en') => fetchCategoriesRaw(lang),
  ['meal-categories'],
  { revalidate: CACHE_TTL.DAY, tags: [CACHE_TAGS.CATEGORIES] },
);

export const fetchAreasCached = unstable_cache(
  (lang: Language = 'en') => fetchAreasRaw(lang),
  ['meal-areas'],
  { revalidate: CACHE_TTL.DAY, tags: [CACHE_TAGS.AREAS] },
);

export const fetchMealsByLetterCached = unstable_cache(
  (char: string, lang: Language) =>
    fetchMealsByOrCondition(`name->>en.ilike.${char}%,name->>ru.ilike.${char}%`, 50, lang),
  ['meals-by-letter'],
  { revalidate: CACHE_TTL.HOUR, tags: [CACHE_TAGS.MEALS] },
);

export const fetchMealsByCategoryCached = unstable_cache(
  (category: string, lang: Language) =>
    fetchMealsByOrCondition(`category->>en.eq.${category},category->>ru.eq.${category}`, 30, lang),
  ['meals-by-category'],
  { revalidate: CACHE_TTL.HOUR, tags: [CACHE_TAGS.MEALS] },
);

export const fetchMealsByAreaCached = unstable_cache(
  (area: string, lang: Language) =>
    fetchMealsByOrCondition(`area->>en.eq.${area},area->>ru.eq.${area}`, 30, lang),
  ['meals-by-area'],
  { revalidate: CACHE_TTL.HOUR, tags: [CACHE_TAGS.MEALS] },
);
