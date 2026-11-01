import { ChefHat, Dices, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';

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

interface FooterLink {
  label: string;
  href: string;
}

const NAVIGATION_LINKS: FooterLink[] = [
  { label: 'Recipe Catalog', href: '/' },
  { label: 'Random Recipe', href: '/meal/random' },
  { label: 'Favorite Meals', href: '/favorites' },
];

const POPULAR_CUISINES: FooterLink[] = [
  { label: 'Italian', href: '/?area=Italian' },
  { label: 'Japanese', href: '/?area=Japanese' },
  { label: 'Mexican', href: '/?area=Mexican' },
  { label: 'French', href: '/?area=French' },
];

const POPULAR_CATEGORIES: FooterLink[] = [
  { label: 'Seafood', href: '/?category=Seafood' },
  { label: 'Dessert', href: '/?category=Dessert' },
  { label: 'Vegetarian', href: '/?category=Vegetarian' },
  { label: 'Breakfast', href: '/?category=Breakfast' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-card/60 backdrop-blur-sm mt-auto print:hidden">
      {/* Decorative / interactive CTA banner */}
      <div className="border-b border-border/60 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-muted/50 via-muted/30 to-background border border-border">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Sparkles className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Don&apos;t know what to cook today?
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Get instant culinary inspiration with a single click.
                </p>
              </div>
            </div>

            <Link
              href="/meal/random"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:bg-primary/90 transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Dices className="size-4" aria-hidden="true" />
              <span>Surprise Me</span>
            </Link>
          </div>
        </div>
      </div>

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
              Discover delicious recipes from around the globe with step-by-step instructions,
              ingredients, and video guides.
            </p>
            <div className="pt-1">
              <a
                href="https://www.themealdb.com/api.php"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                <span>Powered by TheMealDB</span>
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
              Explore
            </h3>
            <ul className="space-y-2.5">
              {NAVIGATION_LINKS.map((item) => (
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
              World Cuisines
            </h3>
            <ul className="space-y-2.5">
              {POPULAR_CUISINES.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    {item.label} Cuisine
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
              Popular Categories
            </h3>
            <ul className="space-y-2.5">
              {POPULAR_CATEGORIES.map((item) => (
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
          <p>© {currentYear} TheMealApp. Built for food lovers and home cooks.</p>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-muted-foreground/70">
              <ChefHat className="size-3.5 text-primary" aria-hidden="true" />
              <span>Happy Cooking</span>
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
