'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export const MealBackButton = () => {
  const searchParams = useSearchParams();
  const backTo = searchParams.get('from') === 'favorites' ? '/favorites' : '/';
  const backLabel =
    searchParams.get('from') === 'favorites' ? 'Back to favorites' : 'Back to catalog';

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
