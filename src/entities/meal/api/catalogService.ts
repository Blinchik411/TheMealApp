import type { CatalogFilterParams } from '../model/catalog.schema';
import type { Meal } from '../model/types';
import { mealApi } from './mealApi';

const DEFAULT_INITIAL_LETTER = 'b';

export interface CatalogResult {
  meals: Meal[];
  categories: string[];
  areas: string[];
  error?: string;
}

/**
 * Пересечение списков блюд по idMeal: O(K * N), где K — кол-во фильтров, N — размер наименьшего списка
 */
function intersectMealLists(lists: Meal[][]): Meal[] {
  if (lists.length === 0) return [];
  if (lists.length === 1) return lists[0] ?? [];

  // Сортируем списки по возрастанию длины для минимизации проверок
  const sortedLists = [...lists].sort((a, b) => a.length - b.length);
  const smallestList = sortedLists[0] ?? [];
  const otherListsSets = sortedLists.slice(1).map((list) => new Set(list.map((m) => m.idMeal)));

  return smallestList.filter((meal) => otherListsSets.every((idSet) => idSet.has(meal.idMeal)));
}

/**
 * Сервис многокритериальной фильтрации рецептов (Compound Filtering)
 */
export async function getFilteredCatalog(filters: CatalogFilterParams): Promise<CatalogResult> {
  const { search, category, area } = filters;

  // 1. Отказоустойчивая параллельная загрузка метаданных (Promise.allSettled)
  // Падение справочников не должно ломать рендер каталога рецептов
  const [categoriesResult, areasResult] = await Promise.allSettled([
    mealApi.getCategories(),
    mealApi.getAreas(),
  ]);

  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  const areas = areasResult.status === 'fulfilled' ? areasResult.value : [];

  // 2. Формируем массив параллельных запросов только для активных критериев
  const activeQueries: Promise<Meal[]>[] = [];

  if (search) {
    activeQueries.push(mealApi.searchByName(search));
  }
  if (category) {
    activeQueries.push(mealApi.filterByCategory(category));
  }
  if (area) {
    activeQueries.push(mealApi.filterByArea(area));
  }

  // 3. Выборка и пересечение
  try {
    let meals: Meal[] = [];

    if (activeQueries.length === 0) {
      // Критерии не заданы — отдаем базовый каталог
      meals = await mealApi.searchByLetter(DEFAULT_INITIAL_LETTER);
    } else if (activeQueries.length === 1) {
      // Ровно 1 критерий — прямой ответ без оверхеда на пересечение
      const [singleQuery] = activeQueries;
      meals = singleQuery ? await singleQuery : [];
    } else {
      // 2 или 3 критерия — параллельный опрос и математическое пересечение по ID
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
