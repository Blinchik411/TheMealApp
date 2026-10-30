import type { z } from 'zod';
import type {
  areaItemSchema,
  areaResponseSchema,
  categoryItemSchema,
  categoryResponseSchema,
  mealResponseSchema,
  mealSchema,
} from './schema';

export type Meal = z.infer<typeof mealSchema>;
export type MealResponse = z.infer<typeof mealResponseSchema>;
export type AreaItem = z.infer<typeof areaItemSchema>;
export type AreaResponse = z.infer<typeof areaResponseSchema>;
export type CategoryItem = z.infer<typeof categoryItemSchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;

export interface IngredientItem {
  id: string;
  name: string;
  measure: string;
}
