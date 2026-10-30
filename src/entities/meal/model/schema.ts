import { z } from 'zod';

export const mealSchema = z
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

export const mealResponseSchema = z.object({
  meals: z.array(mealSchema).nullable(),
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
