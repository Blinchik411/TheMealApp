'use client';

import type { IngredientItem } from '@/entities/meal';
import { Check, ClipboardList, Printer, Share2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface QuickActionsCardProps {
  mealTitle: string;
  ingredients: IngredientItem[];
}

export const QuickActionsCard = ({ mealTitle, ingredients }: QuickActionsCardProps) => {
  const [isIngredientsCopied, setIsIngredientsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    };
  }, []);

  const handleCopyIngredients = async () => {
    const lines = [
      `🛒 Ingredients for "${mealTitle}":`,
      ...ingredients.map((item) => `• ${item.name}: ${item.measure?.trim() || 'По вкусу'}`),
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

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: mealTitle,
          text: `Check out this recipe for ${mealTitle} on TheMealApp!`,
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

  const handlePrint = () => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3.5 print:hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
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
    </div>
  );
};
