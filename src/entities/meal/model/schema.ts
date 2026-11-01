import { z } from 'zod';

export const theMealDbRawMealSchema = z
  .object({
    idMeal: z.string({ error: 'ID блюда обязателен' }),
    strMeal: z.string({ error: 'Название блюда обязательно' }),
    strMealThumb: z
      .string()
      .nullable()
      .optional()
      .transform((val) => val ?? ''),
    strInstructions: z.string().nullable().optional(),
    strCategory: z.string().nullable().optional(),
    strArea: z.string().nullable().optional(),
    strTags: z.string().nullable().optional(),
    strYoutube: z.string().nullable().optional(),
  })
  .passthrough();

export type TheMealDbRawMeal = z.infer<typeof theMealDbRawMealSchema>;

export const theMealDbResponseSchema = z.object({
  meals: z.array(theMealDbRawMealSchema).nullable(),
});

export const areaItemSchema = z.object({
  strArea: z.string().nullable().optional(),
});

export const areaResponseSchema = z.object({
  meals: z.array(areaItemSchema).nullable(),
});

export const categoryItemSchema = z.object({
  strCategory: z.string().nullable().optional(),
});

export const categoryResponseSchema = z.object({
  meals: z.array(categoryItemSchema).nullable(),
});

export const ingredientItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  measure: z.string(),
});

export const mealSchema = z.object({
  id: z.string({ error: 'ID блюда обязателен' }),
  title: z.string({ error: 'Название блюда обязательно' }),
  image: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val ?? ''),
  category: z.string().default('General'),
  cuisine: z.string().default('International'),
  instructions: z.string().default(''),
  tags: z.array(z.string()).optional(),
  youtubeUrl: z.string().optional(),
  ingredients: z.array(ingredientItemSchema).default([]),
});
