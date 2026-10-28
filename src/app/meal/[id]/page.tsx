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
    if (!meal) return { title: 'Recipe Not Found — TheMealApp' };
    return {
      title: `${meal.strMeal} — Recipe on TheMealApp`,
      description: meal.strInstructions?.slice(0, 160) ?? `How to prepare ${meal.strMeal}`,
    };
  } catch {
    return { title: 'Recipe — TheMealApp' };
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
