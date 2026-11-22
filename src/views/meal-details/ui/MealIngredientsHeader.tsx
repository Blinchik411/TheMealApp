'use client';

import { RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';

export interface MealIngredientsHeaderProps {
  totalCount: number;
  hasProgress: boolean;
  onReset: () => void;
}

export const MealIngredientsHeader = memo(function MealIngredientsHeader({
  totalCount,
  hasProgress,
  onReset,
}: MealIngredientsHeaderProps) {
  const t = useTranslations('MealDetails');

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold tracking-tight text-foreground">
        {t('ingredients')} ({totalCount})
      </h2>
      {hasProgress ? (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors cursor-pointer py-0.5 px-1.5 -mr-1.5 rounded-lg hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
          title={t('resetProgress')}
        >
          <RotateCcw className="size-3.5" />
          <span>{t('resetProgress')}</span>
        </button>
      ) : (
        <span className="text-xs text-muted-foreground">{t('clickToCheckOff')}</span>
      )}
    </div>
  );
});

MealIngredientsHeader.displayName = 'MealIngredientsHeader';
