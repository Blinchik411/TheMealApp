import { mealApi } from '@/entities/meal';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RandomMealPage() {
  const meal = await mealApi.getRandomMeal();

  if (meal) {
    redirect(`/meal/${meal.id}`);
  }

  redirect('/');
}
