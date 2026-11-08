'use client';

import type { IngredientItem } from '@/entities/meal';
import { Check, ClipboardList, Printer, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo, useEffect, useRef, useState } from 'react';

export interface QuickActionsCardProps {
  mealTitle: string;
  ingredients: IngredientItem[];
}

interface CopyIngredientsButtonProps {
  mealTitle: string;
  ingredients: IngredientItem[];
}

export const CopyIngredientsButton = memo(
  ({ mealTitle, ingredients }: CopyIngredientsButtonProps) => {
    const t = useTranslations('MealDetails');
    const [isIngredientsCopied, setIsIngredientsCopied] = useState(false);
    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      return () => {
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      };
    }, []);

    const handleCopyIngredients = async () => {
      const lines = [
        t('ingredientsFor', { title: mealTitle }),
        ...ingredients.map((item) => `• ${item.name}: ${item.measure?.trim() || t('toTaste')}`),
      ];
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(lines.join('\n'));
          setIsIngredientsCopied(true);
          if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
          copyTimeoutRef.current = setTimeout(() => setIsIngredientsCopied(false), 2000);
        }
      } catch (err) {
        console.error('Failed to copy ingredients', err);
      }
    };

    return (
      <button
        type="button"
        onClick={handleCopyIngredients}
        className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-xl border border-border bg-background hover:bg-muted/60 text-xs font-medium text-foreground transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]"
        title={t('copyList')}
      >
        {isIngredientsCopied ? (
          <>
            <Check className="size-4 text-emerald-500 stroke-[2.5]" />
            <span className="text-emerald-600 font-semibold truncate">{t('copied')}</span>
          </>
        ) : (
          <>
            <ClipboardList className="size-4 text-primary shrink-0" />
            <span className="truncate">{t('copyList')}</span>
          </>
        )}
      </button>
    );
  },
);
CopyIngredientsButton.displayName = 'CopyIngredientsButton';

interface ShareMealButtonProps {
  mealTitle: string;
}

export const ShareMealButton = memo(({ mealTitle }: ShareMealButtonProps) => {
  const t = useTranslations('MealDetails');
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const shareTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    };
  }, []);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: mealTitle,
          text: t('shareText', { title: mealTitle }),
          url,
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setIsLinkCopied(true);
        if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
        shareTimeoutRef.current = setTimeout(() => setIsLinkCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-xl border border-border bg-background hover:bg-muted/60 text-xs font-medium text-foreground transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]"
      title={t('share')}
    >
      {isLinkCopied ? (
        <>
          <Check className="size-4 text-emerald-500 stroke-[2.5]" />
          <span className="text-emerald-600 font-semibold truncate">{t('copied')}</span>
        </>
      ) : (
        <>
          <Share2 className="size-4 text-primary shrink-0" />
          <span className="truncate">{t('share')}</span>
        </>
      )}
    </button>
  );
});
ShareMealButton.displayName = 'ShareMealButton';

export const PrintMealButton = memo(() => {
  const t = useTranslations('MealDetails');

  const handlePrint = () => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-xl border border-border bg-background hover:bg-muted/60 text-xs font-medium text-foreground transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]"
      title={t('print')}
    >
      <Printer className="size-4 text-primary shrink-0" />
      <span className="truncate">{t('print')}</span>
    </button>
  );
});
PrintMealButton.displayName = 'PrintMealButton';

export const QuickActionsCard = memo(({ mealTitle, ingredients }: QuickActionsCardProps) => {
  const t = useTranslations('MealDetails');

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3.5 print:hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('quickActions')}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <CopyIngredientsButton mealTitle={mealTitle} ingredients={ingredients} />
        <ShareMealButton mealTitle={mealTitle} />
        <PrintMealButton />
      </div>
    </div>
  );
});
QuickActionsCard.displayName = 'QuickActionsCard';
