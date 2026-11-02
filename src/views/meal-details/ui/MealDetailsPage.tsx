'use client';

import { type Meal, MealCard, parseInstructions } from '@/entities/meal';
import { FavoriteButton } from '@/features/favorite-meal';
import { getYouTubeEmbedUrl } from '@/shared/lib';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  Globe,
  Printer,
  Share2,
  Tag,
  Utensils,
  Video,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { MealPrintCard } from './MealPrintCard';

interface MealDetailsPageProps {
  meal: Meal;
  relatedMeals?: Meal[];
}

export const MealDetailsPage = ({ meal, relatedMeals }: MealDetailsPageProps) => {
  const searchParams = useSearchParams();
  const backTo = searchParams.get('from') === 'favorites' ? '/favorites' : '/';
  const backLabel =
    searchParams.get('from') === 'favorites' ? 'Back to favorites' : 'Back to catalog';

  const ingredients = meal.ingredients ?? [];
  const instructions = parseInstructions(meal.instructions);

  // Checkbox state for ingredients & steps
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  // Quick action feedback states
  const [isIngredientsCopied, setIsIngredientsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const checkedIngredientsCount = Object.values(checkedIngredients).filter(Boolean).length;
  const ingredientsProgress =
    ingredients.length > 0 ? Math.round((checkedIngredientsCount / ingredients.length) * 100) : 0;

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

  const handleCopyIngredients = async () => {
    const lines = [
      `🛒 Ingredients for "${meal.title}":`,
      ...ingredients.map((item) => `• ${item.name}: ${item.measure?.trim() || 'To taste'}`),
    ];
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(lines.join('\n'));
        setIsIngredientsCopied(true);
        setTimeout(() => setIsIngredientsCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy ingredients', err);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: meal.title,
          text: `Check out this recipe for ${meal.title} on TheMealApp!`,
          url,
        });
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(meal.youtubeUrl);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. ЭКРАННЫЙ РЕЖИМ: Отображается в браузере, полностью скрыт при печати   */}
      {/* ========================================================================= */}
      <div className="max-w-5xl mx-auto space-y-8 pb-16 print:hidden">
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
              {meal.category && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  <Tag className="size-3" />
                  {meal.category}
                </span>
              )}
              {meal.cuisine && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                  <Globe className="size-3" />
                  {meal.cuisine}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {meal.title}
            </h1>
          </div>

          <div className="shrink-0 print:hidden">
            <FavoriteButton meal={meal} showText={true} size="md" />
          </div>
        </div>

        {/* Основной блок: фото, быстрые действия и ингредиенты */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Левая колонка: Картинка и блок быстрых действий */}
          <div className="space-y-4 md:sticky md:top-24">
            <div className="relative w-full aspect-[4/3] md:aspect-square max-h-[300px] sm:max-h-[360px] md:max-h-none rounded-2xl sm:rounded-3xl overflow-hidden border border-border shadow-sm bg-muted">
              <Image
                src={meal.image}
                alt={meal.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Quick Actions Card */}
            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3.5 print:hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Actions
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {ingredients.length} items
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleCopyIngredients}
                  className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-xl border border-border bg-background hover:bg-muted/60 text-xs font-medium text-foreground transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]"
                  title="Copy shopping list to clipboard"
                >
                  {isIngredientsCopied ? (
                    <>
                      <Check className="size-4 text-emerald-500 stroke-[2.5]" />
                      <span className="text-emerald-600 font-semibold truncate">Copied!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardList className="size-4 text-primary shrink-0" />
                      <span className="truncate">Copy list</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-xl border border-border bg-background hover:bg-muted/60 text-xs font-medium text-foreground transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]"
                  title="Share this recipe"
                >
                  {isLinkCopied ? (
                    <>
                      <Check className="size-4 text-emerald-500 stroke-[2.5]" />
                      <span className="text-emerald-600 font-semibold truncate">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="size-4 text-primary shrink-0" />
                      <span className="truncate">Share</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-xl border border-border bg-background hover:bg-muted/60 text-xs font-medium text-foreground transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]"
                  title="Print recipe"
                >
                  <Printer className="size-4 text-primary shrink-0" />
                  <span className="truncate">Print</span>
                </button>
              </div>

              {ingredients.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Prepared items</span>
                    <span className="font-semibold text-foreground">
                      {checkedIngredientsCount} of {ingredients.length} ({ingredientsProgress}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${ingredientsProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
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
                      <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {item.measure?.trim() || 'To taste'}
                      </span>
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
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 print:hidden">
            <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <Video className="size-6 text-red-500" />
              <span>Cooking Video</span>
            </div>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border">
              <iframe
                src={youtubeEmbedUrl}
                title={`Cooking video for ${meal.title}`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 size-full border-0"
              />
            </div>
          </div>
        )}

        {/* Похожие рецепты (Related Recipes) */}
        {relatedMeals && relatedMeals.length > 0 && (
          <section className="pt-8 border-t border-border/60 space-y-6 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary mb-1.5">
                  <Utensils className="size-3" />
                  <span>Related Recipes</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  More in {meal.category}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  You might also enjoy these popular dishes
                </p>
              </div>

              {meal.category && meal.category !== 'General' && (
                <Link
                  href={`/?category=${encodeURIComponent(meal.category)}`}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline group"
                >
                  <span>View all {meal.category}</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedMeals.map((relatedMeal) => (
                <MealCard
                  key={relatedMeal.id}
                  meal={relatedMeal}
                  from="details"
                  actionSlot={<FavoriteButton meal={relatedMeal} />}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Вынесенный компонент печатной карточки для распечатки A4 */}
      <MealPrintCard meal={meal} ingredients={ingredients} instructions={instructions} />
    </>
  );
};
