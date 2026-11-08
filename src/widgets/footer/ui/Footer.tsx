import { Link } from '@/shared/config/i18n';
import { ChefHat, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

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

export function Footer() {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { label: t('recipeCatalog'), href: '/' },
    { label: t('randomRecipe'), href: '/meal/random' },
    { label: t('favoriteMeals'), href: '/favorites' },
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
    <footer className="w-full border-t border-border bg-card/60 backdrop-blur-sm mt-auto print:hidden">
      {/* Main navigation grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          {/* Column 1: Brand & About */}
          <div className="space-y-4">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg inline-block"
            >
              TheMealApp
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t('tagline')}
            </p>
            <div className="pt-1">
              <a
                href="https://www.themealdb.com/api.php"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                <span>{t('poweredBy')}</span>
                <ExternalLink
                  className="size-3 text-muted-foreground group-hover:text-foreground transition-colors"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
              {t('explore')}
            </h3>
            <ul className="space-y-2.5">
              {navigationLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: World Cuisines */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
              {t('cuisines')}
            </h3>
            <ul className="space-y-2.5">
              {popularCuisines.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
              {t('categories')}
            </h3>
            <ul className="space-y-2.5">
              {popularCategories.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Sub-footer */}
      <div className="border-t border-border/80 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>{t('rights', { year: currentYear })}</p>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-muted-foreground/70">
              <ChefHat className="size-3.5 text-primary" aria-hidden="true" />
              <span>{t('happyCooking')}</span>
            </span>

            <div className="h-3 w-px bg-border hidden sm:block" />

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <GithubIcon className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
