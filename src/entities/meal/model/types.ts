export type Language = 'ru' | 'en';

export interface IngredientItem {
  id: string;
  name: string;
  measure: string;
  imageUrl?: string;
  nameObj?: {
    en: string;
    ru: string;
  };
  measureObj?: {
    en: string;
    ru: string;
  };
}

export interface MealStep {
  stepNumber: number;
  instruction: {
    en: string;
    ru: string;
  };
  timerMinutes: number | null;
}

export interface MealNutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface MealDietary {
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
}

export interface Meal {
  id: string;
  title: string;
  image: string;
  category: string;
  cuisine: string;
  instructions: string;
  ingredients: IngredientItem[];
  slug?: string;
  name?: {
    en: string;
    ru: string;
  };
  categoryObj?: {
    en: string;
    ru: string;
  };
  areaObj?: {
    en: string;
    ru: string;
  };
  instructionsObj?: {
    en: string;
    ru: string;
  };
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  totalTimeMinutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  nutrition?: MealNutrition;
  dietary?: MealDietary;
  mealType?: string[];
  steps?: MealStep[];
  tags?: string[];
  youtubeUrl?: string;
  sourceUrl?: string;
}
