import { supabase } from '@/shared/api';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://the-meal-app-three.vercel.app';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/ru`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/favorites`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ru/favorites`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  try {
    const { data: meals, error } = await supabase
      .from('meals')
      .select('id, slug, date_modified')
      .order('id', { ascending: true });

    if (error || !meals) {
      return staticRoutes;
    }

    const mealRoutes: MetadataRoute.Sitemap = meals.flatMap((meal) => {
      const slug = meal.slug || meal.id;
      const lastModified = meal.date_modified ? new Date(meal.date_modified) : new Date();
      return [
        {
          url: `${baseUrl}/meal/${slug}`,
          lastModified,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        },
        {
          url: `${baseUrl}/ru/meal/${slug}`,
          lastModified,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        },
      ];
    });

    return [...staticRoutes, ...mealRoutes];
  } catch (err) {
    console.error('Failed to generate meals sitemap:', err);
    return staticRoutes;
  }
}
