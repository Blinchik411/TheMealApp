import { type Language, type Meal, mealApi } from '@/entities/meal';
import { MealDetailsPage } from '@/views/meal-details';
import { RelatedMealsSection, RelatedMealsSkeleton } from '@/widgets/related-meals';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

interface RelatedMealsProps {
  meal: Meal;
  locale: Language;
}

async function RelatedMeals({ meal, locale }: RelatedMealsProps) {
  let relatedMeals: Meal[] = [];
  try {
    if (meal.category && meal.category !== 'General') {
      const categoryMeals = await mealApi.filterByCategory(meal.category, locale);
      relatedMeals = categoryMeals.filter((m) => m.id !== meal.id).slice(0, 4);
    } else if (meal.cuisine && meal.cuisine !== 'International') {
      const areaMeals = await mealApi.filterByArea(meal.cuisine, locale);
      relatedMeals = areaMeals.filter((m) => m.id !== meal.id).slice(0, 4);
    }
  } catch (error) {
    console.error('Failed to load related recipes:', error);
  }

  return <RelatedMealsSection relatedMeals={relatedMeals} category={meal.category} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const isRu = locale === 'ru';
  try {
    const meal = await mealApi.getMealById(id, locale as Language);
    if (!meal) return { title: isRu ? 'Рецепт не найден' : 'Recipe Not Found' };

    const titleSuffix = isRu ? 'Рецепт' : 'Recipe';
    const title = `${meal.title} — ${titleSuffix}`;
    const description =
      meal.instructions?.slice(0, 160) ??
      (isRu ? `Как приготовить ${meal.title}` : `How to prepare ${meal.title}`);
    const images = meal.image ? [{ url: meal.image, alt: meal.title }] : [];

    return {
      title,
      description,
      alternates: {
        canonical: isRu ? `/ru/meal/${id}` : `/meal/${id}`,
        languages: {
          'en-US': `/meal/${id}`,
          'ru-RU': `/ru/meal/${id}`,
        },
      },
      openGraph: {
        title,
        description,
        images,
        type: 'article',
        locale: isRu ? 'ru_RU' : 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: meal.image ? [meal.image] : [],
      },
    };
  } catch {
    return { title: isRu ? 'Рецепт' : 'Recipe' };
  }
}

export default async function Page({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const meal = await mealApi.getMealById(id, locale as Language);

  if (!meal) {
    notFound();
  }

  return (
    <MealDetailsPage meal={meal}>
      <Suspense key="related-meals-suspense" fallback={<RelatedMealsSkeleton />}>
        <RelatedMeals meal={meal} locale={locale as Language} />
      </Suspense>
    </MealDetailsPage>
  );
}
