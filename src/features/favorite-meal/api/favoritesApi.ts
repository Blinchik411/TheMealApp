import type { Meal } from '@/entities/meal';
import { supabase } from '@/shared/api/supabase';

export const favoritesApi = {
  async getFavorites(): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('meal_id, meal_title, meal_thumb, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch favorites from Supabase:', error.message);
      throw error;
    }

    return (data ?? []).map((row) => ({
      idMeal: row.meal_id,
      strMeal: row.meal_title,
      strMealThumb: row.meal_thumb,
    }));
  },

  async addFavorite(meal: Meal): Promise<void> {
    const { error } = await supabase.from('favorites').upsert(
      {
        meal_id: meal.idMeal,
        meal_title: meal.strMeal,
        meal_thumb: meal.strMealThumb,
      },
      { onConflict: 'meal_id' },
    );

    if (error) {
      console.error('Failed to save favorite to Supabase:', error.message);
      throw error;
    }
  },

  async removeFavorite(mealId: string): Promise<void> {
    const { error } = await supabase.from('favorites').delete().eq('meal_id', mealId);

    if (error) {
      console.error('Failed to remove favorite from Supabase:', error.message);
      throw error;
    }
  },
};
