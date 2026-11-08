import { mealApi } from '@/entities/meal';
import { redirect } from '@/shared/config/i18n';
import { setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function RandomMealPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const meal = await mealApi.getRandomMeal();

  if (meal) {
    redirect({ href: `/meal/${meal.id}`, locale });
  }

  redirect({ href: '/', locale });
}
