import { z } from 'zod';

export const catalogFilterSchema = z.object({
  search: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  category: z
    .string()
    .trim()
    .max(50)
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  area: z
    .string()
    .trim()
    .max(50)
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  page: z.coerce.number().int().positive().default(1).catch(1),
});

export type CatalogFilterParams = z.infer<typeof catalogFilterSchema>;
