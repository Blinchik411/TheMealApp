import { type Language, type Meal, mealApi } from '@/entities/meal';
import type { CatalogFilterParams } from './catalog.schema';

const DEFAULT_INITIAL_LETTER = 'b';

export interface CatalogResult {
  meals: Meal[];
  categories: string[];
  areas: string[];
  error?: string;
}

/**
 * Пересечение списков блюд по id: O(K * N), где K — кол-во фильтров, N — размер наименьшего списка
 */
function intersectMealLists(lists: Meal[][]): Meal[] {
  if (lists.length === 0) return [];
  if (lists.length === 1) return lists[0] ?? [];

  // Сортируем списки по возрастанию длины для минимизации проверок
  const sortedLists = [...lists].sort((a, b) => a.length - b.length);
  const smallestList = sortedLists[0] ?? [];
  const otherListsSets = sortedLists.slice(1).map((list) => new Set(list.map((m) => m.id)));

  return smallestList.filter((meal) => otherListsSets.every((idSet) => idSet.has(meal.id)));
}

/**
 * Сервис многокритериальной фильтрации рецептов (Compound Filtering)
 */
export async function getFilteredCatalog(
  filters: CatalogFilterParams,
  lang: Language = 'en',
): Promise<CatalogResult> {
  const { search, category, area } = filters;

  // 1. Отказоустойчивая параллельная загрузка метаданных (Promise.allSettled)
  const [categoriesResult, areasResult] = await Promise.allSettled([
    mealApi.getCategories(lang),
    mealApi.getAreas(lang),
  ]);

  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  const areas = areasResult.status === 'fulfilled' ? areasResult.value : [];

  // 2. Формируем массив параллельных запросов только для активных критериев
  const activeQueries: Promise<Meal[]>[] = [];

  if (search) {
    activeQueries.push(mealApi.searchByName(search, lang));
  }
  if (category) {
    activeQueries.push(mealApi.filterByCategory(category, lang));
  }
  if (area) {
    activeQueries.push(mealApi.filterByArea(area, lang));
  }

  // 3. Выборка и пересечение
  try {
    let meals: Meal[] = [];

    if (activeQueries.length === 0) {
      meals = await mealApi.searchByLetter(DEFAULT_INITIAL_LETTER, lang);
    } else if (activeQueries.length === 1) {
      const [singleQuery] = activeQueries;
      meals = singleQuery ? await singleQuery : [];
    } else {
      const queryResults = await Promise.all(activeQueries);
      meals = intersectMealLists(queryResults);
    }

    return {
      meals,
      categories,
      areas,
    };
  } catch (err) {
    return {
      meals: [],
      categories,
      areas,
      error: err instanceof Error ? err.message : 'Failed to load recipes',
    };
  }
}
