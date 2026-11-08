import { supabase } from '@/shared/api';
import { mapSupabaseMealToMeal } from '../lib/supabaseMealAdapter';
import type { Language, Meal } from '../model/types';

export const MEAL_SAMPLING_MAX_OFFSET = 790;

export function getRandomMealOffset(maxOffset = MEAL_SAMPLING_MAX_OFFSET): number {
  return Math.floor(Math.random() * maxOffset);
}

export async function getRandomMeal(lang: Language = 'en'): Promise<Meal | null> {
  try {
    const randomOffset = getRandomMealOffset();
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .range(randomOffset, randomOffset)
      .maybeSingle();

    if (error || !data) {
      const { data: first } = await supabase.from('meals').select('*').limit(1).maybeSingle();
      return first ? mapSupabaseMealToMeal(first, lang) : null;
    }
    return mapSupabaseMealToMeal(data, lang);
  } catch (err) {
    console.error('[mealSampling.getRandomMeal] error:', err);
    return null;
  }
}
