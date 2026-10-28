export interface FavoriteMealRow {
  id: number;
  created_at: string;
  meal_id: string;
  meal_title: string;
  meal_thumb: string;
}

export interface FavoriteMealInsert {
  meal_id: string;
  meal_title: string;
  meal_thumb: string;
}
