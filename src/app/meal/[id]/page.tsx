import { mealApi } from '@/entities/meal';
import { MealDetailsPage } from '@/views/meal-details';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const meal = await mealApi.getMealById(id);
    if (!meal) return { title: 'Recipe Not Found' };

    const title = `${meal.title} — Recipe`;
    const description = meal.instructions?.slice(0, 160) ?? `How to prepare ${meal.title}`;
    const images = meal.image ? [{ url: meal.image, alt: meal.title }] : [];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images,
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: meal.image ? [meal.image] : [],
      },
    };
  } catch {
    return { title: 'Recipe' };
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const meal = await mealApi.getMealById(id);

  if (!meal) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-muted-foreground">Loading recipe...</div>
      }
    >
      <MealDetailsPage meal={meal} />
    </Suspense>
  );
}
