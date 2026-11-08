'use client';

import { Link } from '@/shared/config/i18n';
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  ChefHat,
  Compass,
  ExternalLink,
  Globe2,
  Heart,
  Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface FooterProps {
  className?: string;
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function Footer({ className = '' }: FooterProps) {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigationLinks = [
    { label: t('recipeCatalog'), href: '/', icon: BookOpen },
    { label: t('randomRecipe'), href: '/meal/random', icon: Compass },
    { label: t('favoriteMeals'), href: '/favorites', icon: Heart },
  ];

  const popularCuisines = [
    { label: t('italian'), href: '/?area=Italian' },
    { label: t('japanese'), href: '/?area=Japanese' },
    { label: t('mexican'), href: '/?area=Mexican' },
    { label: t('french'), href: '/?area=French' },
  ];

  const popularCategories = [
    { label: t('seafood'), href: '/?category=Seafood' },
    { label: t('dessert'), href: '/?category=Dessert' },
    { label: t('vegetarian'), href: '/?category=Vegetarian' },
    { label: t('breakfast'), href: '/?category=Breakfast' },
  ];

  return (
    <footer
      className={`w-full border-t border-border/80 bg-background/80 backdrop-blur-md mt-auto print:hidden ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1: Brand & Identity */}
          <div className="rounded-2xl border border-border/70 bg-card/60 p-6 flex flex-col justify-between shadow-2xs hover:border-primary/30 transition-colors">
            <div className="space-y-3">
              <Link
                href="/"
                className="text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
              >
                TheMealApp
              </Link>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {t('tagline')}
              </p>
            </div>
            <div className="pt-6">
              <a
                href="https://www.themealdb.com/api.php"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                <span>{t('poweredBy')}</span>
                <ExternalLink
                  className="size-3 text-muted-foreground group-hover:text-foreground"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>

          {/* Bento Card 2: Quick Links & Cuisines */}
          <div className="rounded-2xl border border-border/70 bg-card/60 p-6 flex flex-col justify-between shadow-2xs hover:border-primary/30 transition-colors">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                <Globe2 className="size-3.5 text-primary" aria-hidden="true" />
                <span>{t('cuisines')}</span>
              </h3>
              <nav aria-label="Bento cuisines" className="flex flex-wrap gap-2 mb-6">
                {popularCuisines.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-muted/60 hover:bg-primary/10 hover:text-primary transition-all border border-border/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                <Compass className="size-3.5 text-primary" aria-hidden="true" />
                <span>{t('explore')}</span>
              </h3>
              <nav aria-label="Bento explore" className="space-y-1">
                {navigationLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group text-xs sm:text-sm text-muted-foreground hover:text-foreground flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="flex items-center gap-2">
                        <Icon
                          className="size-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors"
                          aria-hidden="true"
                        />
                        <span>{item.label}</span>
                      </span>
                      <ArrowRight
                        className="size-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                        aria-hidden="true"
                      />
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bento Card 3: Categories & Action */}
          <div className="rounded-2xl border border-border/70 bg-card/60 p-6 flex flex-col justify-between shadow-2xs hover:border-primary/30 transition-colors">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
                <span>{t('categories')}</span>
              </h3>
              <nav aria-label="Bento categories" className="grid grid-cols-2 gap-2">
                {popularCategories.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-background hover:shadow-2xs text-xs font-medium text-foreground transition-all flex items-center justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span>{item.label}</span>
                    <span
                      className="size-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-border/50 mt-6">
              <span className="text-xs text-muted-foreground italic">
                &ldquo;{t('culinaryQuote')}&rdquo;
              </span>
              <button
                type="button"
                onClick={handleScrollToTop}
                aria-label={t('backToTop')}
                className="group/btn size-9 rounded-xl bg-muted/80 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ArrowUp
                  className="size-4 transition-transform group-hover/btn:-translate-y-0.5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Sub-footer */}
        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>{t('rights', { year: currentYear })}</p>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-muted-foreground/80 font-medium">
              <ChefHat className="size-3.5 text-primary" aria-hidden="true" />
              <span>{t('happyCooking')}</span>
            </span>

            <div className="h-3 w-px bg-border hidden sm:block" />

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <GithubIcon className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
