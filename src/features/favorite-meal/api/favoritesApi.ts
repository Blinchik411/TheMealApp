import type { Meal } from '@/entities/meal';
import { supabase } from '@/shared/api';

export const favoritesApi = {
  async getFavorites(): Promise<Meal[] | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('favorites')
      .select('meal_id, meal_title, meal_thumb, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch favorites from Supabase:', error.message);
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.meal_id,
      title: row.meal_title,
      image: row.meal_thumb,
      category: 'Favorite',
      cuisine: 'International',
      instructions: '',
      ingredients: [],
    }));
  },

  async addFavorite(meal: Meal): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Guest mode: recipe is saved in localStorage by Zustand persist
      return;
    }

    const { error } = await supabase.from('favorites').upsert(
      {
        user_id: user.id,
        meal_id: meal.id,
        meal_title: meal.title,
        meal_thumb: meal.image,
      },
      { onConflict: 'user_id,meal_id' },
    );

    if (error) {
      console.error('Failed to save favorite to Supabase:', error.message);
      throw error;
    }
  },

  async removeFavorite(mealId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('meal_id', mealId);

    if (error) {
      console.error('Failed to remove favorite from Supabase:', error.message);
      throw error;
    }
  },
};
