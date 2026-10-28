export interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions?: string;
  strCategory?: string;
  strArea?: string;
  strTags?: string | null;
  strYoutube?: string | null;
  [key: string]: string | null | undefined;
}

export interface MealResponse {
  meals: Meal[] | null;
}

export interface AreaItem {
  strArea: string;
}

export interface AreaResponse {
  meals: AreaItem[] | null;
}

export interface CategoryItem {
  strCategory: string;
}

export interface CategoryResponse {
  meals: CategoryItem[] | null;
}

export interface IngredientItem {
  id: string;
  name: string;
  measure: string;
}
