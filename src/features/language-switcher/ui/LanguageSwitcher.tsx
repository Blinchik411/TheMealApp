'use client';

import { type Locale, usePathname, useRouter } from '@/shared/config/i18n';
import { Languages } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useTransition } from 'react';

export const LanguageSwitcher = () => {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (nextLocale: Locale) => {
    if (nextLocale === currentLocale) return;

    startTransition(() => {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const target = search ? `${pathname}${search}` : pathname;
      router.replace(target, { locale: nextLocale });
    });
  };

  return (
    <div
      className="inline-flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border/50 text-xs font-semibold"
      aria-label="Language selection"
    >
      <Languages className="size-3.5 text-muted-foreground ml-1.5 mr-0.5 hidden sm:inline" />
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleLocaleChange('en')}
        aria-pressed={currentLocale === 'en'}
        aria-label="Switch to English"
        className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
          currentLocale === 'en'
            ? 'bg-background text-foreground shadow-2xs font-bold'
            : 'text-muted-foreground hover:text-foreground'
        } ${isPending ? 'opacity-70 cursor-wait' : ''}`}
      >
        EN
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleLocaleChange('ru')}
        aria-pressed={currentLocale === 'ru'}
        aria-label="Переключить на русский язык"
        className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
          currentLocale === 'ru'
            ? 'bg-background text-foreground shadow-2xs font-bold'
            : 'text-muted-foreground hover:text-foreground'
        } ${isPending ? 'opacity-70 cursor-wait' : ''}`}
      >
        RU
      </button>
    </div>
  );
};
