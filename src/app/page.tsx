import { type Meal, mealApi } from '@/entities/meal';
import { getPaginatedData } from '@/shared/lib/paginationList';
import { HomePage } from '@/views/home';

const ITEMS_PER_PAGE = 8;
const DEFAULT_INITIAL_LETTER = 'b';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    area?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { search, area, category, page } = await searchParams;

  const searchQuery = search ?? '';
  const selectedArea = area ?? '';
  const selectedCategory = category ?? '';
  const pageParam = Number(page ?? '1');
  const currentPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  let meals: Meal[] = [];
  let error: string | null = null;
  let categories: string[] = [];
  let areas: string[] = [];

  try {
    const [cats, ars, fetchedMeals] = await Promise.all([
      mealApi.getCategories(),
      mealApi.getAreas(),
      searchQuery
        ? mealApi.searchByName(searchQuery)
        : selectedCategory
          ? mealApi.filterByCategory(selectedCategory)
          : selectedArea
            ? mealApi.filterByArea(selectedArea)
            : mealApi.searchByLetter(DEFAULT_INITIAL_LETTER),
    ]);

    categories = cats;
    areas = ars;
    meals = fetchedMeals;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load recipes';
  }

  const { paginatedItems, totalPages } = getPaginatedData(meals, currentPage, ITEMS_PER_PAGE);

  return (
    <HomePage
      meals={paginatedItems}
      categories={categories}
      areas={areas}
      currentPage={currentPage}
      totalPages={totalPages}
      searchQuery={searchQuery}
      selectedCategory={selectedCategory}
      selectedArea={selectedArea}
      error={error}
    />
  );
}
