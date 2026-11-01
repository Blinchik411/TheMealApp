export interface IngredientItem {
  id: string;
  name: string;
  measure: string;
}

export interface Meal {
  id: string;
  title: string;
  image: string;
  category: string;
  cuisine: string;
  instructions: string;
  tags?: string[];
  youtubeUrl?: string;
  ingredients: IngredientItem[];
}
