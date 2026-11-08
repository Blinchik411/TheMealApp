import { catalogFilterSchema, getFilteredCatalog } from '@/features/filter-meals';
import { getPaginatedData } from '@/shared/lib';
import { HomePage } from '@/views/home';
import { setRequestLocale } from 'next-intl/server';

const ITEMS_PER_PAGE = 12;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const rawParams = await searchParams;

  const filters = catalogFilterSchema.parse({
    search: typeof rawParams.search === 'string' ? rawParams.search : undefined,
    category: typeof rawParams.category === 'string' ? rawParams.category : undefined,
    area: typeof rawParams.area === 'string' ? rawParams.area : undefined,
    page: typeof rawParams.page === 'string' ? rawParams.page : undefined,
  });

  const { meals, categories, areas, error } = await getFilteredCatalog(filters);

  const { paginatedItems, totalPages } = getPaginatedData(meals, filters.page, ITEMS_PER_PAGE);

  return (
    <HomePage
      meals={paginatedItems}
      categories={categories}
      areas={areas}
      currentPage={filters.page}
      totalPages={totalPages}
      searchQuery={filters.search ?? ''}
      selectedArea={filters.area ?? ''}
      selectedCategory={filters.category ?? ''}
      error={error}
    />
  );
}
