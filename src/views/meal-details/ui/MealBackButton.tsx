'use client';

import { Link } from '@/shared/config/i18n';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

export const MealBackButton = () => {
  const t = useTranslations('MealDetails');
  const searchParams = useSearchParams();
  const backTo = searchParams.get('from') === 'favorites' ? '/favorites' : '/';
  const backLabel =
    searchParams.get('from') === 'favorites' ? t('backToFavorites') : t('backToCatalog');

  return (
    <div className="print:hidden">
      <Link
        href={backTo}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        <span>{backLabel}</span>
      </Link>
    </div>
  );
};
