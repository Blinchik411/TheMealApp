import { z } from 'zod';

const stringParam = (maxLength: number) =>
  z
    .preprocess(
      (val) => (Array.isArray(val) ? val[0] : val),
      z.string().trim().max(maxLength).optional(),
    )
    .transform((val) => (val && val.length > 0 ? val : undefined));

export const catalogFilterSchema = z.object({
  search: stringParam(100),
  category: stringParam(50),
  area: stringParam(50),
  page: z.coerce.number().int().positive().default(1).catch(1),
});

export type CatalogFilterParams = z.infer<typeof catalogFilterSchema>;
