'use client';

import { type Meal, parseIngredients } from '@/entities/meal';
import { FavoriteButton } from '@/features/favorite-meal';
import { parseInstructions } from '@/shared/lib/parseInstructions';
import { ArrowLeft, Check, CheckCircle2, Globe, Tag, Video } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';

interface MealDetailsPageProps {
  meal: Meal;
}

export const MealDetailsPage: React.FC<MealDetailsPageProps> = ({ meal }) => {
  const searchParams = useSearchParams();
  const backTo = searchParams.get('from') === 'favorites' ? '/favorites' : '/';
  const backLabel =
    searchParams.get('from') === 'favorites' ? 'Back to favorites' : 'Back to catalog';

  const ingredients = parseIngredients(meal);
  const instructions = parseInstructions(meal.strInstructions);

  // Checkbox state for ingredients & steps
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const youtubeEmbedUrl = meal.strYoutube ? meal.strYoutube.replace('watch?v=', 'embed/') : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Кнопка "Назад" */}
      <div>
        <Link
          href={backTo}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          <span>{backLabel}</span>
        </Link>
      </div>

      {/* Заголовок рецепта и кнопка в избранное */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {meal.strCategory && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                <Tag className="size-3" />
                {meal.strCategory}
              </span>
            )}
            {meal.strArea && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                <Globe className="size-3" />
                {meal.strArea}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {meal.strMeal}
          </h1>
        </div>

        <div className="shrink-0">
          <FavoriteButton meal={meal} showText={true} />
        </div>
      </div>

      {/* Основной блок: фото и ингредиенты */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Картинка блюда с Next.js Image */}
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden border border-border shadow-sm bg-muted">
          <Image
            src={meal.strMealThumb}
            alt={meal.strMeal}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Список ингредиентов */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Ingredients ({ingredients.length})
            </h2>
            <span className="text-xs text-muted-foreground">Click to check off</span>
          </div>

          <ul className="space-y-2">
            {ingredients.map((item) => {
              const isChecked = Boolean(checkedIngredients[item.id]);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggleIngredient(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      isChecked
                        ? 'bg-muted/40 border-border/40 opacity-60 line-through'
                        : 'bg-card border-border hover:bg-accent hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2
                        className={`size-4 ${
                          isChecked ? 'text-primary fill-primary/20' : 'text-muted-foreground'
                        }`}
                      />
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                    </div>
                    {item.measure && (
                      <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {item.measure}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Step-by-step instructions */}
      {instructions.length > 0 && (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Step-by-step Recipe
            </h2>
            <span className="text-xs text-muted-foreground">Click to check off</span>
          </div>

          <ol className="space-y-3">
            {instructions.map((step, index) => {
              const isChecked = Boolean(checkedSteps[index]);
              return (
                <li key={`step-${index + 1}`}>
                  <button
                    type="button"
                    onClick={() => toggleStep(index)}
                    className={`w-full flex items-start gap-4 p-3.5 rounded-2xl border transition-all cursor-pointer select-none text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      isChecked
                        ? 'bg-muted/40 border-border/40'
                        : 'bg-card border-border/40 hover:bg-accent/60 hover:border-primary/30'
                    }`}
                  >
                    <span
                      className={`shrink-0 flex items-center justify-center size-8 rounded-full font-bold text-sm transition-all duration-200 ${
                        isChecked
                          ? 'bg-primary text-primary-foreground shadow-xs scale-105'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {isChecked ? <Check className="size-4.5 stroke-[3]" /> : index + 1}
                    </span>
                    <p
                      className={`pt-1 text-sm sm:text-base leading-relaxed transition-all ${
                        isChecked
                          ? 'line-through opacity-50 text-muted-foreground'
                          : 'text-foreground/90'
                      }`}
                    >
                      {step}
                    </p>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Видео рецепта с YouTube (если есть) */}
      {youtubeEmbedUrl && (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
            <Video className="size-6 text-red-500" />
            <span>Cooking Video</span>
          </div>
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border">
            <iframe
              src={youtubeEmbedUrl}
              title={`Cooking video for ${meal.strMeal}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          </div>
        </div>
      )}
    </div>
  );
};
