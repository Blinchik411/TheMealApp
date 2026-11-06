import { supabase } from '@/shared/api';
import { type SupabaseMealRow, mapSupabaseMealToMeal } from '../lib/supabaseMealAdapter';
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

export const mealApi = {
  /**
   * Получить рецепт по ID или по Slug
   */
  async getMealById(idOrSlug: string, lang: Language = 'ru'): Promise<Meal | null> {
    const trimmed = idOrSlug?.trim();
    if (!trimmed) return null;

    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .or(`id.eq.${trimmed},slug.eq.${trimmed}`)
        .maybeSingle();

      if (error || !data) return null;
      return mapSupabaseMealToMeal(data as SupabaseMealRow, lang);
    } catch (err) {
      console.error('[mealApi.getMealById] error:', err);
      return null;
    }
  },

  /**
   * Поиск по названию (на русском и английском)
   */
  async searchByName(name: string, lang: Language = 'ru'): Promise<Meal[]> {
    const trimmed = name?.trim();
    if (!trimmed) return [];

    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .or(`name->>ru.ilike.%${trimmed}%,name->>en.ilike.%${trimmed}%`)
        .order('id', { ascending: true })
        .limit(50);

      if (error || !data) return [];
      return data.map((row) => mapSupabaseMealToMeal(row as SupabaseMealRow, lang));
    } catch (err) {
      console.error('[mealApi.searchByName] error:', err);
      return [];
    }
  },

  /**
   * Поиск по первой букве названия
   */
  async searchByLetter(letter: string, lang: Language = 'ru'): Promise<Meal[]> {
    const char = letter?.trim().charAt(0);
    if (!char) return [];

    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .or(`name->>en.ilike.${char}%,name->>ru.ilike.${char}%`)
        .order('id', { ascending: true })
        .limit(50);

      if (error || !data) return [];
      return data.map((row) => mapSupabaseMealToMeal(row as SupabaseMealRow, lang));
    } catch (err) {
      console.error('[mealApi.searchByLetter] error:', err);
      return [];
    }
  },

  /**
   * Фильтрация по категории (поддерживает EN и RU название или slug)
   */
  async filterByCategory(category: string, lang: Language = 'ru'): Promise<Meal[]> {
    const trimmed = category?.trim();
    if (!trimmed) return [];

    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .or(`category->>en.eq.${trimmed},category->>ru.eq.${trimmed}`)
        .order('id', { ascending: true })
        .limit(100);

      if (error || !data) return [];
      return data.map((row) => mapSupabaseMealToMeal(row as SupabaseMealRow, lang));
    } catch (err) {
      console.error('[mealApi.filterByCategory] error:', err);
      return [];
    }
  },

  /**
   * Фильтрация по кухне/региону (поддерживает EN и RU название или slug)
   */
  async filterByArea(area: string, lang: Language = 'ru'): Promise<Meal[]> {
    const trimmed = area?.trim();
    if (!trimmed) return [];

    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .or(`area->>en.eq.${trimmed},area->>ru.eq.${trimmed}`)
        .order('id', { ascending: true })
        .limit(100);

      if (error || !data) return [];
      return data.map((row) => mapSupabaseMealToMeal(row as SupabaseMealRow, lang));
    } catch (err) {
      console.error('[mealApi.filterByArea] error:', err);
      return [];
    }
  },

  /**
   * Список категорий
   */
  async getCategories(lang: Language = 'ru'): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .neq('id', 'test')
        .order('count', { ascending: false });

      if (error || !data) return [];
      return data
        .map((row) => (row.name as { ru: string; en: string })[lang] || row.name.ru || row.name.en)
        .filter(Boolean);
    } catch (err) {
      console.error('[mealApi.getCategories] error:', err);
      return [];
    }
  },

  /**
   * Список активных кухонь
   */
  async getAreas(lang: Language = 'ru'): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('name')
        .order('count', { ascending: false });

      if (error || !data) return [];
      return data
        .map((row) => (row.name as { ru: string; en: string })[lang] || row.name.ru || row.name.en)
        .filter(Boolean);
    } catch (err) {
      console.error('[mealApi.getAreas] error:', err);
      return [];
    }
  },

  /**
   * Случайный рецепт
   */
  async getRandomMeal(lang: Language = 'ru'): Promise<Meal | null> {
    try {
      // Pick a random offset between 0 and 792
      const randomOffset = Math.floor(Math.random() * 790);
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .range(randomOffset, randomOffset)
        .maybeSingle();

      if (error || !data) {
        const { data: first } = await supabase.from('meals').select('*').limit(1).maybeSingle();
        return first ? mapSupabaseMealToMeal(first as SupabaseMealRow, lang) : null;
      }
      return mapSupabaseMealToMeal(data as SupabaseMealRow, lang);
    } catch (err) {
      console.error('[mealApi.getRandomMeal] error:', err);
      return null;
    }
  },

  /**
   * Продвинутая составная фильтрация одним SQL-запросом в PostgreSQL
   */
  async getMeals(options: GetMealsFilterOptions = {}): Promise<Meal[]> {
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
      lang = 'ru',
    } = options;

    try {
      let query = supabase.from('meals').select('*');

      if (search?.trim()) {
        const s = search.trim();
        query = query.or(`name->>ru.ilike.%${s}%,name->>en.ilike.%${s}%`);
      }

      if (category?.trim()) {
        const c = category.trim();
        query = query.or(`category->>en.eq.${c},category->>ru.eq.${c}`);
      }

      if (area?.trim()) {
        const a = area.trim();
        query = query.or(`area->>en.eq.${a},area->>ru.eq.${a}`);
      }

      if (mealType?.trim()) {
        query = query.contains('meal_type', [mealType.trim().toLowerCase()]);
      }

      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      if (maxTime && maxTime > 0) {
        query = query.lte('total_time_minutes', maxTime);
      }

      if (dietary?.isVegetarian) {
        query = query.eq('dietary->>isVegetarian', 'true');
      }
      if (dietary?.isVegan) {
        query = query.eq('dietary->>isVegan', 'true');
      }
      if (dietary?.isGlutenFree) {
        query = query.eq('dietary->>isGlutenFree', 'true');
      }
      if (dietary?.isDairyFree) {
        query = query.eq('dietary->>isDairyFree', 'true');
      }

      query = query.order('id', { ascending: true }).range(offset, offset + limit - 1);

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map((row) => mapSupabaseMealToMeal(row as SupabaseMealRow, lang));
    } catch (err) {
      console.error('[mealApi.getMeals] error:', err);
      return [];
    }
  },
};
