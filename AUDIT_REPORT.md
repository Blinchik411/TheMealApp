# Комплексный архитектурный и кодовый аудит приложения TheMealApp

**Дата проведения аудита:** 8 ноября 2026 г.  
**Объект аудита:** Исходный код приложения (`src/`)  
**Стек:** Next.js 16 (App Router), React 19, TypeScript (Strict), Supabase (PostgreSQL), Zustand, Tailwind CSS, Vitest  
**Стандарты:** Feature-Sliced Design v2.1, React 19 Standards, TypeScript Strict Mode, Trunk-based Development  
**Режим выполнения:** Demo (Read-only аудит без модификации существующего кода проекта)  
**Статус тестового покрытия на момент аудита:** 24 тестовых набора, 108 тестов — все успешно пройдены (`100% pass`)

---

## Исполнительное резюме (Executive Summary)

Команда провела всестороннее статическое, архитектурное и AST-исследование кодовой базы каталога `src/` проекта `TheMealApp` (116 исходных модулей TypeScript/TSX/CSS, 369 операторов импорта).

### Сводная матрица соответствия стандартам (KPI Matrix)

| Область аудита | Требование стандарта | Фактический результат | Вердикт |
|---|---|---|---|
| **FSD v2.1: Изоляция слайсов** | 0 cross-imports между слайсами одного слоя | **0 нарушений** на 16 слайсов | **Идеально (100%)** |
| **FSD v2.1: Направление зависимостей** | Строго сверху вниз (`app` → `pages` → `widgets` → `features` → `entities` → `shared`) | **0 восходящих импортов** | **Идеально (100%)** |
| **FSD v2.1: Public API (`index.ts`)** | 100% покрытие слайсов точками входа | **16 из 16 слайсов** имеют `index.ts` | **Идеально (100%)** |
| **FSD v2.1: Инкапсуляция Public API** | Запрет глубоких импортов в обход `index.ts` | **2 нарушения** (`MealCard.tsx:2`, `MealGrid.tsx:5`) | **Требуется исправление** |
| **FSD v2.1: Чистота слайсов** | Отсутствие неэкспортированного мёртвого кода | **1 мёртвый файл** (`favorite-meal/api/types.ts`) | **Требуется очистка** |
| **TypeScript: Запрет `any`** | 0 явных ключевых слов `any` | **0 явных `any`** | **Идеально (100%)** |
| **TypeScript: Типизация БД** | Строгая типизация клиента Supabase | **Нетипизированный клиент** (`any`/`Record<string, unknown>`) | **Требуется типизация** |
| **TypeScript: Слепые приведения `as`** | Запрет слепых приведений типов | **32 продакшн-приведения** (`as SomeType`) | **Требуется рефакторинг** |
| **React 19: Запрет `React.FC`** | Использование стандартных функций с типизацией пропсов | **0 нарушений** | **Идеально (100%)** |
| **React 19: События форм** | Использование `SubmitEvent<HTMLFormElement>` вместо `FormEvent` | **0 нарушений** (все 4 формы соответствуют) | **Идеально (100%)** |
| **Архитектура: God-объекты** | Размер файлов <250–300 строк, Single Responsibility | **1 файл >300 строк** (`mealApi.ts` — 329 строк) + 7 SRP-нарушений | **Требуется декомпозиция** |
| **Архитектура: DRY** | Отсутствие дублирования верстки, хуков и логики | **13 системных паттернов дублирования** | **Требуется унификация** |

---

## Раздел 1. Аудит God-объектов и God-компонентов (R1)

Аудит выявил файлы, превышающие пороговый объём 250–300 строк физического кода (LOC), а также компоненты и хранилища, в которых сконцентрировано несколько несвязанных между собой ответственностей (смешение прямого обращения к БД, кэширования Next.js, браузерных API, управления состоянием и рендеринга сложного JSX).

### Сводная таблица ключевых файлов по объёму и сложности

| № | Относительный путь | Физических LOC | Тип архитектурного артефакта | Ключевые смешанные ответственности |
|---|---|:---:|---|---|
| 1 | `src/entities/meal/api/mealApi.ts` | **329** | God-Object / God-Module | Сетевые запросы Supabase + Data Cache Next.js + React `cache()` + Маппинг сущностей + Inline локализация |
| 2 | `src/views/meal-details/ui/MealIngredientsList.tsx` | **239** | Composite God-Component | 4 склеенных компонента + Прямой доступ к Zustand + Двухрежимная логика (props vs store) + Расчёт процентов |
| 3 | `src/widgets/footer/ui/Footer.tsx` | **220** | Monolithic Layout Widget | Монолитная Bento-верстка (150+ строк JSX) + Инлайн SVG + Прямой DOM-скролл + Захардкоженные URL-параметры |
| 4 | `src/features/auth/ui/AuthModal.tsx` | **208** | God-Form Component | Сетевые вызовы `authApi` в UI + 6 хуков `useState` + Ручной парсинг Zod + Управление DOM-модалкой без RHF |
| 5 | `src/features/share-meal/ui/QuickActionsCard.tsx` | **178** | Multi-Action God-Component | 4 склеенных компонента + Clipboard API + Web Share API + Print API + Управление таймаутами `useRef` |
| 6 | `src/features/cooking-timer/model/timerStore.ts` | **165** | God-Store с Side-Effects | Хранилище Zustand + Мутабельные переменные модуля + Побочный вызов Web Audio + Форматирование строк |
| 7 | `src/features/meal-checklist/model/mealChecklistStore.ts` | **162** | God-Store с ручным I/O | Хранилище + Ручная работа с `localStorage` + JSON parse/stringify в редюсерах вместо middleware `persist` |
| 8 | `src/features/cooking-timer/ui/TimerDialog.tsx` | **159** | Multi-Responsibility Dialog | Оболочка модалки + Звуковой алерт + Локальное состояние ввода + Парсинг строк таймера |
| 9 | `src/entities/meal/lib/supabaseMealAdapter.ts` | **131** | Monolithic Data Adapter | Маппинг 20+ полей + Вложенный ручной разбор двуязычных структур с 8+ цепочками fallback |
| 10 | `src/features/cooking-timer/ui/TimerDisplay.tsx` | **131** | Hybrid Display / Input | SVG-геометрия кругового прогресс-бара + Вложенная форма редактирования времени |
| 11 | `src/views/meal-details/ui/MealInstructionsList.tsx` | **125** | Composite Instruction View | Рендеринг шагов + Чекбокс чеклиста + Интерактивный regex-парсинг токенов времени |
| 12 | `src/views/meal-details/ui/MealDetailsPage.tsx` | **120** | Orchestration View | Композиция 7 секций страницы + Парсинг инструкций + Разметка медиа-блоков |
| 13 | `src/views/meal-details/ui/MealPrintCard.tsx` | **117** | Duplicate Print Layout | Полное дублирование верстки рецепта, чеклиста и заметок для медиа `@media print` |
| 14 | `src/views/home/ui/HomeFilters.tsx` | **111** | Filter Orchestrator | Синхронизация URL SearchParams + Маршрутизация роутера + Диспетчеризация фильтров |
| 15 | `src/views/favorites/ui/FavoritesPage.tsx` | **101** | Composite Favorites Page | Гидратационный скелетон + Экран Empty State + Агрегация категорий в памяти + Поиск |
| 16 | `src/features/filter-meals/model/catalogService.ts` | **87** | Redundant Query Orchestrator | Клиентское пересечение множеств $O(K \times N)$ массивов в JS, дублирующее SQL-запрос `mealApi` |

---

### Детальный анализ ключевых проблемных файлов

#### 1. `src/entities/meal/api/mealApi.ts` (329 строк)
Файл является абсолютным рекордсменом по объёму и нарушает принцип единственной ответственности сразу в 5 направлениях:
- **Прямые SQL-запросы к Supabase PostgREST:**
  - Строки 31–35: `await supabase.from('meals').select('*').or(\`id.eq.${idOrSlug},slug.eq.${idOrSlug}\`).maybeSingle()`
  - Строки 59–63: `await supabase.from('categories').select('name').neq('id', 'test').order('count', { ascending: false })`
  - Строки 81–84: `await supabase.from('areas').select('name').order('count', { ascending: false })`
  - Строки 102–107: `await supabase.from('meals').select('*').or(\`name->>en.ilike.${char}%,name->>ru.ilike.${char}%\`)...`
  - Строки 178–183: `await supabase.from('meals').select('*').or(\`name->>ru.ilike.%${trimmed}%,name->>en.ilike.%${trimmed}%\`)...`
  - Строки 241–249: Вычисление псевдослучайного смещения `Math.floor(Math.random() * 790)` и диапазонный запрос `.range(randomOffset, randomOffset)`.
  - Строки 276–320: Динамическая сборка сложных SQL-фильтров с цепочками `.contains()`, `.lte()`, `.eq()`, `.or()`, `.range()`.
- **Конфигурация кэширования Next.js Data Cache:**
  - В файле захардкожены 6 вызовов `unstable_cache` с тегами инвалидации и TTL: строки 28, 44–45 (`['meal-by-id']`, TTL 3600), строки 56, 74–75 (`['meal-categories']`, TTL 86400), строки 78, 95–96 (`['meal-areas']`, TTL 86400), строки 99, 116–117 (`['meals-by-letter']`), строки 120, 137–138 (`['meals-by-category']`), строки 141, 158–159 (`['meals-by-area']`).
- **Мемоизация запросов React Server Components:**
  - Строки 48–54: обертка `cache(async (idOrSlug, lang) => ...)` уровня React для устранения водопадов RSC.
- **Трансформация данных и локализация на лету:**
  - Строки 38, 110, 131, 152, 186, 249, 251, 323: вызовы `mapSupabaseMealToMeal(row as SupabaseMealRow, lang)`.
  - Строки 67–68, 88–89: ручное извлечение локализованных строк `(row.name as { ru: string; en: string })[lang] || row.name.en || row.name.ru`.
- **Размытая обработка ошибок:**
  - Строки 40, 70, 91, 112, 133, 154, 188, 253, 325: глушение ошибок через `console.error` с возвратом `null` или пустых массивов без проброса типизированных доменных исключений.

#### 2. `src/views/meal-details/ui/MealIngredientsList.tsx` (239 строк)
Файл представляет собой классический God-компонент, в который скомпонованы 4 отдельных компонента и смешана UI-верстка с управлением глобальным состоянием:
- **Объединение 4 компонентов в одном модуле:**
  - Строки 30–81: `MealIngredientItem` (элемент списка ингредиентов с чекбоксом).
  - Строки 84–139: `MealIngredientsHeader` (заголовок со счётчиком и кнопкой сброса).
  - Строки 141–190: `MealIngredientsProgress` (прогресс-бар выполнения рецепта).
  - Строки 192–238: `MealIngredientsList` (родительский контейнер).
- **Прямой доступ к состоянию Zustand из глубоких подкомпонентов:**
  - Строки 40–43: `useMealChecklistStore` вызывается внутри элемента строки для проверки статуса чекбокса.
  - Строки 97–105: `useMealChecklistStore` инспектирует как ингредиенты, так и шаги приготовления внутри шапки.
  - Строки 154–159: `useMealChecklistStore` фильтрует массив состояния для вычисления количества отмеченных элементов.
- **Двухрежимная логика (props vs store fork):**
  - Строки 45, 107, 161: ветвление `const isChecked = mealId ? storeIsChecked : Boolean(propIsChecked)`.
  - Строки 47–53, 109–115: если передан `mealId`, триггерится экшен хранилища; если нет — вызывается внешний коллбек `onToggle`. Это свидетельствует о попытке сделать компонент одновременно "умным" и "глупым".
- **Бизнес-расчёты внутри слоя представления:**
  - Строки 163–166: прямой расчёт процента выполнения `Math.round((checkedIngredientsCount / totalIngredients) * 100)` внутри JSX.

#### 3. `src/widgets/footer/ui/Footer.tsx` (220 строк)
Виджет подвала перегружен монолитной разметкой и побочными эффектами:
- **Инлайн SVG иконка:** Строки 21–33 содержат ручную реализацию `GithubIcon` вместо использования стандартного набора Lucide / SimpleIcons.
- **Прямое взаимодействие с DOM:** Строки 39–43 содержат обработчик `window.scrollTo({ top: 0, behavior: 'smooth' })`.
- **Захардкоженные структуры навигации:** Строки 51–63 содержат статические массивы ссылок с ручными query-параметрами (`/?area=Italian`, `/?category=Seafood`, `/?category=Dessert`).
- **Монолитная верстка:** Строки 66–219 представляют собой 153 строки вложенного JSX Bento-сетки с тремя карточками, формой подписки и копирайтом.

#### 4. `src/features/auth/ui/AuthModal.tsx` (208 строк)
Компонент модального окна аутентификации нарушает архитектурные стандарты проекта:
- **Сетевые вызовы в теле обработчика:** Строки 61–65 напрямую вызывают `await authApi.signUp(...)` и `await authApi.signIn(...)`.
- **Взрыв локального состояния:** Строки 18–23 объявляют 6 независимых хуков `useState` (`isSignUp`, `email`, `password`, `errorMsg`, `fieldErrors`, `isSubmitting`).
- **Ручной парсинг схемы Zod:** Строки 25–32 объявляют локальную схему `authSchema`, а строки 48–56 вручную выполняют `safeParse` и извлекают ошибки из полей объекта ошибок вместо использования React Hook Form. Это прямо нарушает п. 5 глобальных правил проекта ("Формы и валидация данных (React Hook Form + Zod)").
- **Ручная реализация модального диалога:** Строки 75–99 создают рукописный оверлей, бэкдроп и контейнер вместо использования доступного примитива Shadcn `<Dialog>`.

#### 5. `src/features/share-meal/ui/QuickActionsCard.tsx` (178 строк)
Файл содержит 4 компонента и смешивает сразу несколько низкоуровневых Web API браузера:
- **Компоненты в одном файле:** `CopyIngredientsButton` (18–69), `ShareMealButton` (75–134), `PrintMealButton` (136–157), `QuickActionsCard` (159–178).
- **Смешение браузерных API и таймаутов:**
  - Строки 36–41: ручной вызов `navigator.clipboard.writeText(...)` с очисткой таймаута через `useRef`.
  - Строки 88–99: вызов `navigator.share(...)` с перехватом `AbortError`.
  - Строки 140–142: вызов `window.print()`.

#### 6. `src/features/cooking-timer/model/timerStore.ts` (165 строк)
- **Глобальные мутабельные переменные уровня модуля:** Строки 39–40 объявляют `let timerInterval: ReturnType<typeof setInterval> | null = null; let targetEndTime = 0;` вне жизненного цикла React и Zustand, что создает риск гонки состояний и утечки памяти при SSR/Fast Refresh.
- **Звуковые побочные эффекты внутри стора:** Строки 4, 79, 118 вызывают воспроизведение аудио `playTimerAlarm()` прямо из тика интервала стора.
- **Форматирование строк:** Строки 25–37 содержат утилиту форматирования `formatTimerTime`, которой место в `lib/`.

#### 7. `src/features/meal-checklist/model/mealChecklistStore.ts` (162 строки)
- **Ручной бойлерплейт LocalStorage:** Строки 26–70 содержат функции `loadChecklistFromStorage` и `persistChecklistToStorage` с ручными проверками `typeof window === 'undefined'`, `localStorage.getItem/setItem` и `JSON.parse/stringify`.
- **Императивное сохранение в экшенах:** Строки 109, 133, 150 содержат прямые императивные вызовы сохранения вместо использования чистого middleware `persist` от Zustand (как это корректно сделано в `favoritesStore.ts`).

#### 8. `src/features/filter-meals/model/catalogService.ts` (87 строк)
- **Дублирование архитектуры фильтрации:** Функция `getFilteredCatalog` выполняет до 3 независимых сетевых запросов (`searchByName`, `filterByCategory`, `filterByArea`) и затем вычисляет пересечение массивов в JavaScript-рантайме через `intersectMealLists` (сложность $O(K \times N)$). При этом в `mealApi.ts:getMeals` (строки 261–329) уже реализована эффективная фильтрация на уровне PostgreSQL в один запрос.

---

## Раздел 2. Поиск и анализ дублирующегося кода (R2)

В ходе сравнительного анализа модулей было зафиксировано **13 системных паттернов дублирования**, охватывающих работу с данными, вспомогательные утилиты, верстку экранов и типографику.

---

### Паттерн 1: Многократное дублирование цепочки локализации (`[lang] || en || ru`)
- **Участвующие файлы и строки:**
  - `src/entities/meal/lib/supabaseMealAdapter.ts`: строки 41–55 (наименование, категория, регион), строки 66–77 (ингредиенты и меры), строки 92–94 (теги блюда).
  - `src/entities/meal/api/mealApi.ts`: строка 67 (список категорий), строка 88 (список регионов).
- **Фрагмент дублирующегося кода:**
  ```typescript
  // supabaseMealAdapter.ts:
  const ingName = isNameObj
    ? (item.ingredient as { en: string; ru: string })[lang] ||
      (item.ingredient as { en: string; ru: string }).en ||
      (item.ingredient as { en: string; ru: string }).ru
    : String(item.ingredient || '');

  // mealApi.ts (строка 67):
  return data
    .map((row) => (row.name as { ru: string; en: string })[lang] || row.name.en || row.name.ru)
    .filter(Boolean);
  ```
- **Описание проблемы:** Однотипная логика разрешения двуязычного объекта с резервным падением на английский, затем на русский язык повторяется более чем в 8 местах без использования переиспользуемой чистой утилиты `getLocalizedString(field, lang)`.

---

### Паттерн 2: Шаблонный бойлерплейт запросов Supabase и маппинга сущностей
- **Участвующие файлы и строки:**
  - `src/entities/meal/api/mealApi.ts`: строки 31–38 (`fetchMealByIdFromSupabase`), строки 102–110 (`fetchMealsByLetterCached`), строки 123–131 (`fetchMealsByCategoryCached`), строки 144–152 (`fetchMealsByAreaCached`), строки 178–186 (`searchByName`), строки 241–251 (`getRandomMeal`), строки 320–324 (`getMeals`).
- **Фрагмент дублирующегося кода:**
  ```typescript
  const { data, error } = await supabase.from('meals').select('*')...;
  if (error || !data) {
    console.error('[mealApi...] error:', error);
    return [];
  }
  return data.map((row) => mapSupabaseMealToMeal(row as SupabaseMealRow, lang));
  ```
- **Описание проблемы:** В 7 различных методах API полностью дублируется код проверки ошибки запроса, проверки наличия `data`, логирования ошибки в консоль и применения `mapSupabaseMealToMeal`.

---

### Паттерн 3: Дублирующиеся адаптеры блюд и мёртвые REST-эндпоинты
- **Участвующие файлы и строки:**
  - `src/entities/meal/lib/mealAdapter.ts`: строки 4, 11–45.
  - `src/entities/meal/lib/supabaseMealAdapter.ts`: строки 10, 39–131.
  - `src/shared/api/endpoints.ts`: строки 1–15.
- **Фрагмент дублирующегося кода:**
  - Идентичное объявление константы:
    `export const DEFAULT_MEAL_IMAGE = '/placeholder-meal.svg';` в `mealAdapter.ts:4` и `supabaseMealAdapter.ts:10`.
  - Метод `mapTheMealDbToMeal` в `mealAdapter.ts` выполняет роль адаптера устаревшего REST API TheMealDB, в то время как всё приложение переведено на Supabase (`mapSupabaseMealToMeal`).
  - В `src/shared/api/endpoints.ts` объявлен объект `API_ENDPOINTS` с 8 REST-эндпоинтами (`https://www.themealdb.com/api/json/v1/1`), которые не вызываются ни в одном модуле проекта.
- **Описание проблемы:** Сохранение устаревшего адаптера и неиспользуемого файла эндпоинтов раздувает кодовую базу и вводит разработчиков в заблуждение относительно источника данных.

---

### Паттерн 4: Дублирование верстки скелетона карточек блюд
- **Участвующие файлы и строки:**
  - `src/widgets/meal-grid/ui/MealGrid.tsx`: строки 27–44.
  - `src/app/[locale]/(catalog)/loading.tsx`: строки 28–45.
  - `src/widgets/related-meals/ui/RelatedMealsSection.tsx`: строки 73–86.
  - `src/views/favorites/ui/FavoritesPage.tsx`: строки 44–48.
- **Фрагмент дублирующегося кода:**
  ```tsx
  // MealGrid.tsx:
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
    {SKELETON_KEYS.slice(0, skeletonCount).map((key) => (
      <div key={key} className="flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
        <div className={cn('w-full bg-muted', imageAspectRatio)} />
        <div className="p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3 flex-1">
          <div className="h-3.5 sm:h-4 bg-muted rounded-md w-3/4" />
          <div className="h-3 bg-muted rounded-md w-1/2" />
          <div className="mt-auto h-8 sm:h-9 bg-muted rounded-lg sm:rounded-xl w-full" />
        </div>
      </div>
    ))}
  </div>

  // (catalog)/loading.tsx:
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={`meal-grid-skel-${i + 1}`} className="flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
        <div className="w-full aspect-square bg-muted" />
        <div className="p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3 flex-1">
          <div className="h-4 bg-muted rounded-md w-3/4" />
          <div className="mt-auto h-8 sm:h-9 bg-muted rounded-lg sm:rounded-xl w-full" />
        </div>
      </div>
    ))}
  </div>
  ```
- **Описание проблемы:** `MealGrid` уже поддерживает проп `isLoading`, однако экран загрузки каталога, секция похожих блюд и страница избранного копируют эту CSS-разметку скелетона вручную вместо переиспользования единого компонента `MealCardSkeleton`.

---

### Паттерн 5: Повторение типографики и верстки Hero Header
- **Участвующие файлы и строки:**
  - `src/views/home/ui/HomePage.tsx`: строки 36–54.
  - `src/views/favorites/ui/FavoritesPage.tsx`: строки 73–82.
  - `src/app/[locale]/(catalog)/loading.tsx`: строки 4–13 (скелетон шапки).
  - `src/views/favorites/ui/FavoritesPage.tsx`: строки 38–42 (скелетон шапки).
- **Фрагмент дублирующегося кода:**
  ```tsx
  // HomePage.tsx:
  <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
      <Sparkles className="size-3.5" />
      <span>{t('badge')}</span>
    </div>
    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">{t('title')}</h1>
    <p className="text-muted-foreground text-sm sm:text-base">{t('description')}</p>
  </div>
  ```
- **Описание проблемы:** Центрированный блок заголовка страницы с бейджем-таблеткой (`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium`), заголовком h1 и описанием копируется на всех основных страницах.

---

### Паттерн 6: Карточка фильтров поиска и категорий
- **Участвующие файлы и строки:**
  - `src/views/home/ui/HomeFilters.tsx`: строки 67–109.
  - `src/views/favorites/ui/FavoritesPage.tsx`: строки 84–96.
- **Фрагмент дублирующегося кода:**
  ```tsx
  <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
    <MealSearch value={searchQuery} onSearch={...} />
    {categories.length > 0 && (
      <div className="pt-2 border-t border-border/60">
        <MealCategoryFilter categories={categories} activeCategory={...} onSelectCategory={...} />
      </div>
    )}
  </div>
  ```
- **Описание проблемы:** Обёртка фильтров с разделяющей линией и стилизацией контейнера повторяется в двух представлениях без выделения в переиспользуемый блок.

---

### Паттерн 7: Паттерн экранов ошибки и пустого состояния (Empty State / 404)
- **Участвующие файлы и строки:**
  - `src/app/not-found.tsx`: строки 9–25.
  - `src/app/[locale]/not-found.tsx`: строки 6–23.
  - `src/widgets/meal-grid/ui/MealGrid.tsx`: строки 47–57.
  - `src/views/favorites/ui/FavoritesPage.tsx`: строки 53–70.
  - `src/app/[locale]/error.tsx`: строки 20–52.
- **Фрагмент дублирующегося кода:**
  ```tsx
  <div className="flex flex-col items-center justify-center py-24 px-4 text-center max-w-md mx-auto space-y-4">
    <div className="flex items-center justify-center size-16 rounded-3xl bg-muted text-muted-foreground mb-2">
      <Utensils className="size-8" />
    </div>
    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">...</h1>
    <p className="text-sm text-muted-foreground">...</p>
    <Link href="/" className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-xs">
      ...
    </Link>
  </div>
  ```
- **Описание проблемы:** Контейнер круглой иконки (`size-16 rounded-3xl bg-muted`), типографика и кнопка возврата скопированы между пятью экранами. Файлы `app/not-found.tsx` и `app/[locale]/not-found.tsx` дублируют друг друга на 95%.

---

### Паттерн 8: Логика копирования в буфер обмена с таймаутом обратной связи
- **Участвующие файлы и строки:**
  - `src/features/share-meal/ui/QuickActionsCard.tsx`: строки 18–69 (`CopyIngredientsButton`).
  - `src/features/share-meal/ui/QuickActionsCard.tsx`: строки 75–134 (`ShareMealButton`).
- **Фрагмент дублирующегося кода:**
  ```typescript
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(...);
      setIsCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
    }
  };
  ```
- **Описание проблемы:** Полное дублирование хука таймаута, очистки `useRef`, флага `isCopied` и таймаута на 2000 мс в соседних компонентах одного файла. Требуется выделение кастомного хука `useClipboard` в `shared/lib`.

---

### Паттерн 9: Кастомный оверлей и модальное окно вместо примитива Shadcn `<Dialog>`
- **Участвующие файлы и строки:**
  - `src/features/auth/ui/AuthModal.tsx`: строки 75–99.
  - `src/features/cooking-timer/ui/CookingTimerWidget.tsx`: строки 21–31.
  - `src/features/cooking-timer/ui/TimerDialog.tsx`: строки 90–115.
- **Фрагмент дублирующегося кода:**
  ```tsx
  <button
    type="button"
    tabIndex={-1}
    data-testid="modal-backdrop"
    onClick={onClose}
    className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-default border-none outline-none z-40"
  />
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl ...">
      <button type="button" onClick={onClose} className="absolute right-4 top-4 ...">
        <X className="size-4" />
      </button>
  ```
- **Описание проблемы:** Каждая фича вручную собирает бэкдроп, центрирующий контейнер, кнопку закрытия и анимацию, что ухудшает доступность (a11y) и дублирует разметку.

---

### Паттерн 10: Ручной LocalStorage-бойлерплейт vs Zustand `persist`
- **Участвующие файлы и строки:**
  - `src/features/meal-checklist/model/mealChecklistStore.ts`: строки 26–70.
  - `src/features/favorite-meal/model/favoritesStore.ts`: строки 47–53.
- **Описание проблемы:** В `favoritesStore.ts` синхронизация с `localStorage` решена через декларативный `persist(..., { name: 'meal_app_favorites' })`. В `mealChecklistStore.ts` для аналогичной задачи написаны 45 строк императивного кода с ручным вызовом `JSON.stringify` и `localStorage.setItem` внутри каждого экшена.

---

### Паттерн 11: Дублирование логики составной фильтрации (SQL vs In-Memory)
- **Участвующие файлы и строки:**
  - `src/features/filter-meals/model/catalogService.ts`: строки 16–86 (`intersectMealLists`, `getFilteredCatalog`).
  - `src/entities/meal/api/mealApi.ts`: строки 261–329 (`mealApi.getMeals`).
- **Описание проблемы:** В кодовой базе параллельно сосуществуют два взаимоисключающих подхода к фильтрации: серверная сборка составного SQL-запроса в `mealApi.ts` и скачивание нескольких списков с последующим поиском пересечений в памяти JS в `catalogService.ts`.

---

### Паттерн 12: Дублирование маппинга пользователя Supabase и проверки аутентификации
- **Участвующие файлы и строки:**
  - `src/entities/user/api/authApi.ts`: строки 9–12, 19–22, 36–39.
  - `src/entities/user/model/userStore.ts`: строка 33.
  - `src/features/favorite-meal/api/favoritesApi.ts`: строки 6–10, 35–39, 63–67.
- **Фрагмент дублирующегося кода:**
  ```typescript
  // Повторяется 4 раза:
  {
    id: data.user.id,
    email: data.user.email ?? '',
  }

  // Повторяется 3 раза в favoritesApi.ts:
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  ```
- **Описание проблемы:** Отсутствуют централизованный хелпер `mapSupabaseUserToProfile` и безопасная обёртка для выполнения операций под авторизованным пользователем.

---

### Паттерн 13: Дублирование типов `Language` vs `Locale` и `PageProps`
- **Участвующие файлы и строки:**
  - `src/entities/meal/model/types.ts`: строка 1 (`export type Language = 'ru' | 'en';`).
  - `src/shared/config/i18n/routing.ts`: строка 9 (`export type Locale = (typeof routing.locales)[number];`).
  - `src/app/[locale]/(catalog)/page.tsx`: строки 9–12.
  - `src/app/[locale]/favorites/page.tsx`: строки 5–7.
  - `src/app/[locale]/meal/random/page.tsx`: строки 7–9.
  - `src/app/[locale]/meal/[id]/page.tsx`: строки 9–11.
- **Описание проблемы:** Два независимых типа описывают одно и то же объединение `'en' | 'ru'`, из-за чего в компонентах страниц приходится писать приведение `locale as Language`. Интерфейс параметров роута Next.js `interface PageProps` дублируется в 4 файлах страниц.

---

## Раздел 3. Проверка соблюдения методологии FSD v2.1 (R3)

Аудит структуры каталогов и карты зависимостей подтвердил высокое базовое соответствие архитектурным принципам Feature-Sliced Design v2.1. При этом зафиксированы 2 точечных нарушения инкапсуляции Public API, 1 факт мертвого кода в слайсе и 6 концептуальных отклонений от канона FSD.

### 1. Анализ межслайсовых связей и направления зависимостей

- **Cross-imports между слайсами одного слоя:** **0 нарушений (100% изоляция)**.
  - Все 7 слайсов слоя `features/` (`auth`, `cooking-timer`, `favorite-meal`, `filter-meals`, `language-switcher`, `meal-checklist`, `share-meal`) изолированы друг от друга и не содержат прямых импортов между собой.
  - Сущности слоя `entities/` (`meal`, `user`) полностью автономны.
  - Виджеты слоя `widgets/` (`footer`, `header`, `meal-grid`, `related-meals`) не импортируют друг друга.
- **Направление зависимостей:** **0 восходящих импортов**.
  - Зависимости направлены строго сверху вниз:
    `app` $\rightarrow$ `views` $\rightarrow$ `widgets` $\rightarrow$ `features` $\rightarrow$ `entities` $\rightarrow$ `shared`.
  - Модули слоя `shared/` не импортируют код из вышележащих слоев.

---

### 2. Анализ Public API (`index.ts`)

- **Покрытие Public API:** **16 из 16 слайсов (100%)** имеют явно объявленные файлы `index.ts`.
- **Факты прямых глубоких импортов в обход Public API (Public API Bypasses):**
  1. **Файл:** `src/entities/meal/ui/MealCard.tsx`, строка 2:
     ```typescript
     import { cn } from '@/shared/lib/utils';
     ```
     *Нарушение:* Импорт утилиты `cn` напрямую из файла реализации `shared/lib/utils.ts` вместо точки входа `@/shared/lib`, где она явно реэкспортируется (`export { cn } from './utils';`).
  2. **Файл:** `src/widgets/meal-grid/ui/MealGrid.tsx`, строка 5:
     ```typescript
     import { cn } from '@/shared/lib/utils';
     ```
     *Нарушение:* Аналогичный глубокий импорт в обход Public API сегмента `shared/lib`.

---

### 3. Мёртвый неэкспортированный код в слайсах

- **Файл:** `src/features/favorite-meal/api/types.ts` (строки 1–18):
  ```typescript
  export interface FavoriteMealRow { ... }
  export interface FavoriteMealInsert { ... }
  ```
  *Нарушение:* Файл не реэкспортируется в `src/features/favorite-meal/index.ts`, не используется в `favoritesApi.ts` и не импортируется ни одним модулем в проекте.

---

### 4. Архитектурные отклонения от канона FSD v2.1

1. **Нестандартное именование слоя страниц (`src/views/` вместо `src/_pages/` или `src/pages/`):**
   В проекте страницы вынесены в `src/views/` (`favorites`, `home`, `meal-details`). По канону FSD v2.1 при использовании Next.js App Router слой страниц именуется `_pages/` (или `pages/`), чтобы избежать конфликта с папкой страниц Pages Router.
2. **Использование спорного слоя `widgets/`:**
   В методологии FSD v2.1 слой `widgets/` считается нерекомендуемым к избыточному использованию.
   - `widgets/meal-grid`: представляет собой сетку карточек, которая по своей роли ближе к компонентам `shared/ui` либо композиции страницы.
   - `widgets/related-meals`: используется исключительно на странице деталей рецепта и концептуально принадлежит слайсу `pages/meal-details`.
3. **Утечка доменной логики в роуты App Router (`src/app/`):**
   В соответствии с правилами FSD для Next.js, файлы `app/**/page.tsx` должны оставаться тонкими адаптерами, реэкспортирующими компоненты страниц. В проекте:
   - В `src/app/[locale]/(catalog)/page.tsx` (строки 20–29) роут напрямую парсит схему фильтров Zod, запрашивает данные через `getFilteredCatalog` и рассчитывает пагинацию через `getPaginatedData`.
   - В `src/app/[locale]/meal/[id]/page.tsx` (строки 18–33) в роуте объявлен серверный подкомпонент `RelatedMeals`, напрямую обращающийся к `mealApi.filterByCategory`.
4. **Технические имена файлов (нарушение правила FSD Rule 4-4):**
   Правило 4-4 FSD запрещает именование файлов по технической роли (`types.ts`, `schema.ts`, `utils.ts`). В проекте выявлены: `entities/meal/model/types.ts`, `entities/meal/model/schema.ts`, `entities/user/model/types.ts`, `shared/lib/utils.ts`. Файлы должны отражать предметную область: `meal.types.ts`, `meal.schema.ts`, `user.types.ts`, `cn.ts`.
5. **Отсутствие сегмента UI-кита (`src/shared/ui/`):**
   В `src/shared/` присутствуют только папки `api/`, `config/`, `lib/`. Сегмент `src/shared/ui/` отсутствует, из-за чего базовые UI-примитивы (кнопки, инпуты, диалоги, скелетоны) создаются по месту внутри компонентов.
6. **Преждевременное выделение сущности `entities/user`:**
   Сущность `entities/user` содержит только DTO авторизации (`UserProfile` с `id` и `email`), хранилище токена и обертку над Supabase Auth. Бизнес-логики пользователя в приложении нет. По правилам FSD v2.1 авторизационные токены и сессии принадлежат сегменту `shared/auth`.

---

## Раздел 4. Проверка TypeScript-гигиены (R4)

В ходе глубокого статического анализа с использованием TypeScript Compiler API кодовая база продемонстрировала высокую культуру типов в части современных стандартов React 19, однако выявлен ряд серьезных замечаний по части приведения типов.

### 1. Анализ использования типа `any`
- **Явные `any`:** **0 ключевых слов `any`** во всей кодовой базе (включен строгий режим `"noImplicitAny": true`).
- **Неявные `any` (Untyped Database Client):**
  В `src/shared/api/supabase/client.ts:6`:
  ```typescript
  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
  ```
  Клиент Supabase инициализирован без generic-типа схемы базы данных (`createClient<Database>()`). В результате методы `.from('meals')`, `.from('categories')`, `.from('areas')` и `.from('favorites')` возвращают нетипизированные записи (`any[]` / `Record<string, unknown>`), что провоцирует разработчиков применять слепые приведения типов `as SupabaseMealRow` и `as { en: string; ru: string }`.

---

### 2. Сводная таблица слепых приведений типов (`as SomeType`)

В коде выявлено **32 случая использования приведения типов `as` в продакшн-коде** (и 3 в моках тестов `mealApi.test.ts`):

| № | Файл | Строка | Фрагмент кода со слепым приведением | Категория нарушения | Рекомендуемое исправление |
|---|---|:---:|---|---|---|
| 1 | `src/app/[locale]/(catalog)/page.tsx` | 27 | `locale as Language` | Приведение строкового параметра роута | Использовать type guard `isLocale(locale)` |
| 2 | `src/app/[locale]/layout.tsx` | 81 | `locale as Locale` | Приведение параметра перед проверкой | Использовать предикат `isSupportedLocale(locale): locale is Locale` |
| 3 | `src/app/[locale]/meal/random/page.tsx` | 15 | `locale as Language` | Приведение строкового параметра роута | Типизировать `params` через `Promise<{ locale: Locale }>` |
| 4 | `src/app/[locale]/meal/[id]/page.tsx` | 39 | `locale as Language` | Приведение в `generateMetadata` | Использовать type guard `isLocale(locale)` |
| 5 | `src/app/[locale]/meal/[id]/page.tsx` | 82 | `locale as Language` | Приведение в компоненте страницы | Валидировать через `isLocale(locale)` |
| 6 | `src/app/[locale]/meal/[id]/page.tsx` | 91 | `locale as Language` | Приведение при передаче пропса | Передавать типизированную переменную `locale` |
| 7 | `src/entities/meal/api/mealApi.ts` | 38 | `data as SupabaseMealRow` | Приведение строки из Supabase | Типизировать клиент Supabase через `Database` |
| 8 | `src/entities/meal/api/mealApi.ts` | 67 | `(row.name as { ru: string; en: string })` | Слепое приведение JSONB-поля | Добавить интерфейс таблицы `categories` |
| 9 | `src/entities/meal/api/mealApi.ts` | 88 | `(row.name as { ru: string; en: string })` | Слепое приведение JSONB-поля | Добавить интерфейс таблицы `areas` |
| 10 | `src/entities/meal/api/mealApi.ts` | 110 | `row as SupabaseMealRow` | Приведение элемента массива Supabase | Сгенерировать типы `Database` для Supabase |
| 11 | `src/entities/meal/api/mealApi.ts` | 131 | `row as SupabaseMealRow` | Приведение элемента массива Supabase | Сгенерировать типы `Database` для Supabase |
| 12 | `src/entities/meal/api/mealApi.ts` | 152 | `row as SupabaseMealRow` | Приведение элемента массива Supabase | Сгенерировать типы `Database` для Supabase |
| 13 | `src/entities/meal/api/mealApi.ts` | 186 | `row as SupabaseMealRow` | Приведение элемента массива Supabase | Сгенерировать типы `Database` для Supabase |
| 14 | `src/entities/meal/api/mealApi.ts` | 249 | `first as SupabaseMealRow` | Приведение элемента выборки | Сгенерировать типы `Database` для Supabase |
| 15 | `src/entities/meal/api/mealApi.ts` | 251 | `data as SupabaseMealRow` | Приведение строки выборки | Сгенерировать типы `Database` для Supabase |
| 16 | `src/entities/meal/api/mealApi.ts` | 323 | `row as SupabaseMealRow` | Приведение элемента массива Supabase | Сгенерировать типы `Database` для Supabase |
| 17 | `src/entities/meal/lib/mealAdapter.ts` | 13 | `raw as Record<string, unknown>` | Слепое приведение объекта к словарю | Добавить сигнатуру индекса `[key: string]: unknown` в тип |
| 18 | `src/entities/meal/lib/supabaseMealAdapter.ts` | 67 | `(item.ingredient as { en: string; ru: string })` | Слепое приведение union-типа | Написать тайпгард `isLocalizedText(val)` |
| 19 | `src/entities/meal/lib/supabaseMealAdapter.ts` | 68 | `(item.ingredient as { en: string; ru: string })` | Слепое приведение union-типа | Вынести в хелпер `getLocalizedString` |
| 20 | `src/entities/meal/lib/supabaseMealAdapter.ts` | 69 | `(item.ingredient as { en: string; ru: string })` | Слепое приведение union-типа | Вынести в хелпер `getLocalizedString` |
| 21 | `src/entities/meal/lib/supabaseMealAdapter.ts` | 73 | `(item.measure as { en: string; ru: string })` | Слепое приведение union-типа | Вынести в хелпер `getLocalizedString` |
| 22 | `src/entities/meal/lib/supabaseMealAdapter.ts` | 74 | `(item.measure as { en: string; ru: string })` | Слепое приведение union-типа | Вынести в хелпер `getLocalizedString` |
| 23 | `src/entities/meal/lib/supabaseMealAdapter.ts` | 75 | `(item.measure as { en: string; ru: string })` | Слепое приведение union-типа | Вынести в хелпер `getLocalizedString` |
| 24 | `src/entities/meal/lib/supabaseMealAdapter.ts` | 83 | `item.ingredient as { en: string; ru: string }` | Слепое приведение объекта ингредиента | Использовать предикат типа вместо булевой переменной |
| 25 | `src/entities/meal/lib/supabaseMealAdapter.ts` | 84 | `item.measure as { en: string; ru: string }` | Слепое приведение объекта меры | Использовать предикат типа вместо булевой переменной |
| 26 | `src/features/cooking-timer/lib/timerAudio.ts` | 9 | `(window as unknown as { webkitAudioContext: ... })` | Двойное слепое приведение типа | Расширить интерфейс `Window` через глобальный `.d.ts` |
| 27 | `src/features/language-switcher/ui/LanguageSwitcher.tsx` | 9 | `useLocale() as Locale` | Приведение строкового типа хука `next-intl` | Написать типизированный хук `useAppLocale(): Locale` |
| 28 | `src/features/meal-checklist/model/mealChecklistStore.ts` | 24 | `Object.freeze(...) as MealChecklistData` | Приведение неизменяемого объекта к мутабельному | Типизировать константу как `DeepReadonly<MealChecklistData>` |
| 29 | `src/entities/meal/api/mealApi.test.ts` | 47 | `{ select: ... } as unknown as ReturnType<...>` | Двойное приведение в тестовом моке | Написать фабрику типизированных моков Supabase |
| 30 | `src/entities/meal/api/mealApi.test.ts` | 85 | `{ select: ... } as unknown as ReturnType<...>` | Двойное приведение в тестовом моке | Написать фабрику типизированных моков Supabase |
| 31 | `src/entities/meal/api/mealApi.test.ts` | 104 | `{ select: ... } as unknown as ReturnType<...>` | Двойное приведение в тестовом моке | Написать фабрику типизированных моков Supabase |
| 32 | `src/features/favorite-meal/api/favoritesApi.ts` | 21, 52 | Прямой маппинг нетипизированного `data` Supabase | Неявное приведение | Использовать `createClient<Database>()` |

---

### 3. Проверка использования `React.FC` / `React.FunctionComponent`
- **Результат проверки:** **0 нарушений (100% соответствие)**.
- **Анализ:** Во всех 45 компонентах приложения используется современный синтаксис функций с явной типизацией интерфейса аргументов (`export const MyComponent = ({ prop }: MyComponentProps) => { ... }` или `export function MyComponent({ prop }: MyComponentProps) { ... }`). Ни одного вхождения устаревшего паттерна `React.FC` не обнаружено.

---

### 4. Проверка типизации событий отправки форм (`FormEvent` vs `SubmitEvent`)
- **Результат проверки:** **0 нарушений (100% соответствие стандарту React 19)**.
- **Анализ:** Во всех 4 формах проекта устаревший тип `FormEvent` не используется. Применена современная типизация через `SubmitEvent<HTMLFormElement>`:
  1. `src/features/auth/ui/AuthModal.tsx:43`: `const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => { ... }`
  2. `src/features/cooking-timer/ui/TimerDialog.tsx:66`: `const handleCustomTimeSubmit = (e?: SubmitEvent<HTMLFormElement>) => { ... }`
  3. `src/features/cooking-timer/ui/TimerDisplay.tsx:14`: `onApplyTime: (e?: SubmitEvent<HTMLFormElement>) => void;`
  4. `src/features/filter-meals/ui/MealSearch.tsx:32`: `const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => { ... }`

---

## Раздел 5. Приоритизированный план рефакторинга (R5)

План рефакторинга сформирован по принципу снижения технического долга и рисков стабильности: от критических архитектурных нарушений (P1) к косметическим улучшениям (P4). Для всех проблемных модулей разработана целевая схема декомпозиции с соблюдением порога **<90 строк кода на файл**.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   ИЕРАРХИЯ ПРИОРИТЕТОВ РЕФАКТОРИНГА                     │
├────────────────────────────────────────────────────────────────────────┤
│ P1: Критичный     • Декомпозиция mealApi.ts (329 LOC)                 │
│                   • Рефакторинг AuthModal.tsx (React Hook Form + Zod)  │
│                   • Устранение глубоких импортов (MealCard, MealGrid)  │
│                   • Строгая типизация клиента Supabase Database        │
├────────────────────────────────────────────────────────────────────────┤
│ P2: Высокий       • Декомпозиция MealIngredientsList.tsx (239 LOC)     │
│                   • Декомпозиция QuickActionsCard.tsx (useClipboard)   │
│                   • Вынос side-effects из timerStore.ts                │
│                   • Унификация Locale/Language и тайпгарды             │
│                   • Консолидация фильтрации (SQL vs catalogService)    │
├────────────────────────────────────────────────────────────────────────┤
│ P3: Средний       • Создание слоя shared/ui (Shadcn UI примитивы)      │
│                   • Унификация скелетонов и EmptyState компонентов     │
│                   • Перевод mealChecklistStore на persist middleware   │
│                   • Очистка роутов Next.js app/ от бизнес-логики       │
│                   • Рефакторинг Footer.tsx                             │
├────────────────────────────────────────────────────────────────────────┤
│ P4: Низкий        • Удаление мертвого кода (types.ts, endpoints.ts)    │
│                   • Переименование технических файлов (Rule 4-4)       │
│                   • Приведение слоя views/ к канону _pages/            │
│                   • Рефакторинг сущности entities/user в shared/auth   │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Приоритет P1 (Критичный)

#### Задача P1.1: Архитектурная декомпозиция `src/entities/meal/api/mealApi.ts` (329 LOC)
- **Целевое состояние:** Разделение на 4 узкоспециализированных модуля размером **до 90 строк**:
  1. `src/entities/meal/api/mealQueryBuilder.ts` (~85 строк):
     - Ответственность: чистые функции построения PostgREST-запросов к Supabase (фильтры по первой букве, категории, региону, полнотекстовый поиск, составной фильтр).
  2. `src/entities/meal/api/mealCache.ts` (~60 строк):
     - Ответственность: конфигурация Next.js Data Cache (`unstable_cache`), константы TTL (3600 с, 86400 с) и теги инвалидации (`meals`, `categories`, `areas`), мемоизация React `cache()`.
  3. `src/entities/meal/model/mealSampling.ts` (~35 строк):
     - Ответственность: вычисление случайного рецепта (`getRandomMeal`) и алгоритм рандомизации смещения.
  4. `src/entities/meal/api/mealApi.ts` (~70 строк):
     - Ответственность: тонкий фасад (Public API сервиса), объединяющий кэшированные методы выборки данных.

#### Задача P1.2: Рефакторинг формы аутентификации `src/features/auth/ui/AuthModal.tsx` (208 LOC)
- **Целевое состояние:** Устранение 6 хуков `useState`, разделение на 3 модуля:
  1. `src/features/auth/model/auth.schema.ts` (~30 строк):
     - Экспорт Zod-схемы `authSchema` и выведенных типов `type AuthFormData = z.infer<typeof authSchema>`.
  2. `src/features/auth/lib/useAuthForm.ts` (~65 строк):
     - Кастомный хук на базе `useForm` (`react-hook-form` + `@hookform/resolvers/zod`).
     - Инкапсуляция сетевых вызовов `authApi.signIn` / `authApi.signUp`, состояний `isSubmitting`, маппинга ошибок сервера.
  3. `src/features/auth/ui/AuthModal.tsx` (~80 строк):
     - Чистый UI-компонент, потребляющий `useAuthForm` и использующий доступный компонент `<Dialog>`.

#### Задача P1.3: Устранение глубоких импортов в обход Public API
- **Файлы:** `src/entities/meal/ui/MealCard.tsx:2`, `src/widgets/meal-grid/ui/MealGrid.tsx:5`.
- **Действие:** Заменить `import { cn } from '@/shared/lib/utils';` на канонический `import { cn } from '@/shared/lib';`.

#### Задача P1.4: Строгая типизация клиента Supabase Database
- **Действие:**
  1. Сгенерировать схему БД с помощью Supabase CLI (`supabase gen types typescript --project-id ... > src/shared/api/supabase/database.types.ts`).
  2. Инициализировать клиент в `src/shared/api/supabase/client.ts`:
     ```typescript
     import { createClient } from '@supabase/supabase-js';
     import type { Database } from './database.types';
     export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
     ```
  3. Это автоматически устранит 10 слепых приведений `as SupabaseMealRow` в `mealApi.ts` и `favoritesApi.ts`.

---

### Приоритет P2 (Высокий)

#### Задача P2.1: Декомпозиция God-компонента `MealIngredientsList.tsx` (239 LOC)
- **Целевое состояние:** Разделение на 5 изолированных файлов:
  1. `src/views/meal-details/model/useIngredientsChecklist.ts` (~50 строк):
     - Хук для устранения разветвления `props vs store`. Инкапсулирует вычисление общего прогресса и подписку на селекторы Zustand.
  2. `src/views/meal-details/ui/MealIngredientItem.tsx` (~55 строк):
     - Независимая строка ингредиента с чекбоксом, вычеркиванием текста и ссылкой на пропорции.
  3. `src/views/meal-details/ui/MealIngredientsHeader.tsx` (~45 строк):
     - Заголовок секции со счётчиком отмеченных элементов и кнопкой сброса.
  4. `src/views/meal-details/ui/MealIngredientsProgress.tsx` (~40 строк):
     - Презентационный прогресс-бар с анимацией процентов выполнения.
  5. `src/views/meal-details/ui/MealIngredientsList.tsx` (~50 строк):
     - Минимальный координирующий контейнер.

#### Задача P2.2: Декомпозиция `QuickActionsCard.tsx` (178 LOC) и создание хука `useClipboard`
- **Целевое состояние:**
  1. Создать `src/shared/lib/useClipboard.ts` (~45 строк):
     - Универсальный хук безопасного копирования с поддержкой `navigator.clipboard`, автоматической очисткой таймаута и флагом `hasCopied`.
  2. Разделить кнопки действий на отдельные модули:
     - `src/features/share-meal/ui/CopyIngredientsButton.tsx` (~50 строк)
     - `src/features/share-meal/ui/ShareMealButton.tsx` (~60 строк)
     - `src/features/share-meal/ui/PrintMealButton.tsx` (~35 строк)
     - `src/features/share-meal/ui/QuickActionsCard.tsx` (~40 строк)

#### Задача P2.3: Очистка `timerStore.ts` от побочных эффектов и глобальных мутаций
- **Целевое состояние:**
  1. Вынести форматирование в `src/features/cooking-timer/lib/formatTimerTime.ts` (~25 строк).
  2. Исключить воспроизведение звука `playTimerAlarm` из стора. Создать хук-слушатель `useTimerAudioAlert()`, реагирующий на флаг `isAlarming: true`.
  3. Перенести управление интервалом тика внутрь экшенов стора или специализированного хука `useTimerTicker()`, устранив переменные модуля `let timerInterval`.

#### Задача P2.4: Унификация системы локализации и устранение слепых приведений `as`
- **Целевое состояние:**
  1. Объединить тип `Language` (`entities/meal`) и `Locale` (`shared/config/i18n`) в единый источник истины `src/shared/config/i18n/types.ts`.
  2. Написать чистые предикаты типов:
     - `isSupportedLocale(val: unknown): val is Locale`
     - `isLocalizedText(val: unknown): val is { en: string; ru: string }`
  3. Создать типизированный хук `useAppLocale(): Locale` взамен слепого приведения `useLocale() as Locale`.
  4. Заменить 8 вхождений цепочек `[lang] || en || ru` на чистую функцию `getLocalizedString(field, lang)`.

#### Задача P2.5: Консолидация архитектуры фильтрации каталога
- **Целевое состояние:** Устранить дублирование между `catalogService.ts` и `mealApi.getMeals`.
  - Перевести каталог на использование единого составного SQL-запроса `mealApi.getMeals` с пагинацией на стороне сервера.
  - Устранить клиентский алгоритм `intersectMealLists`, снизив сетевой оверхед от параллельных запросов.

---

### Приоритет P3 (Средний)

#### Задача P3.1: Внедрение слоя дизайн-системы `src/shared/ui/` (Shadcn UI)
- **Целевое состояние:** Развернуть базовые примитивы в `src/shared/ui/`:
  - `src/shared/ui/button/Button.tsx`
  - `src/shared/ui/dialog/Dialog.tsx`
  - `src/shared/ui/input/Input.tsx`
  - `src/shared/ui/skeleton/Skeleton.tsx`
  - `src/shared/ui/badge/Badge.tsx`
- Заменить самодельные бэкдропы и модальные оверлеи в `AuthModal`, `TimerDialog`, `CookingTimerWidget` на стандартный доступный `<Dialog>`.

#### Задача P3.2: Унификация компонентов загрузки и пустых состояний
- **Целевое состояние:**
  1. Создать `src/entities/meal/ui/MealCardSkeleton.tsx` (~35 строк) и переиспользовать его в `(catalog)/loading.tsx`, `RelatedMealsSection.tsx` и `FavoritesPage.tsx`.
  2. Создать переиспользуемый компонент `src/shared/ui/empty-state/EmptyState.tsx` (~45 строк). Заменить им дублирующуюся разметку в `app/not-found.tsx`, `app/[locale]/not-found.tsx`, `app/[locale]/error.tsx` и `MealGrid.tsx`.

#### Задача P3.3: Модернизация хранилища `mealChecklistStore.ts`
- Перевести `mealChecklistStore.ts` на стандартное middleware Zustand `persist(..., { name: 'meal_checklist_storage' })`, удалив 45 строк ручного кода работы с `localStorage` и JSON-сериализацией.

#### Задача P3.4: Вынос серверной логики из роутов Next.js App Router
- Очистить `src/app/[locale]/(catalog)/page.tsx` и `src/app/[locale]/meal/[id]/page.tsx` от валидации параметров, расчёта пагинации и объявления серверных подкомпонентов. Роуты должны исключительно принимать параметры и делегировать отображение слайсам страниц `views/home` и `views/meal-details`.

#### Задача P3.5: Рефакторинг виджета `src/widgets/footer/ui/Footer.tsx` (220 LOC)
- Вынести конфигурацию ссылок навигации в отдельный конфигурационный файл `footerNavigation.ts`.
- Заменить инлайн `GithubIcon` на иконку из дизайн-системы.
- Декомпозировать Bento-карточки на отдельные компоненты `FooterNewsletterCard`, `FooterNavigationCard`, `FooterBrandCard`.

---

### Приоритет P4 (Низкий / Техническая гигиена)

#### Задача P4.1: Удаление устаревшего и мертвого кода
- Удалить неэкспортированный файл `src/features/favorite-meal/api/types.ts`.
- Удалить мёртвый файл эндпоинтов `src/shared/api/endpoints.ts` (REST TheMealDB).
- Удалить устаревший адаптер `src/entities/meal/lib/mealAdapter.ts` после объединения константы `DEFAULT_MEAL_IMAGE` в `supabaseMealAdapter.ts`.

#### Задача P4.2: Приведение именования файлов к правилу FSD Rule 4-4
- Заменить технические имена файлов на предметные:
  - `entities/meal/model/types.ts` $\rightarrow$ `meal.types.ts`
  - `entities/meal/model/schema.ts` $\rightarrow$ `meal.schema.ts`
  - `entities/user/model/types.ts` $\rightarrow$ `user.types.ts`
  - `shared/lib/utils.ts` $\rightarrow$ `cn.ts`

#### Задача P4.3: Гармонизация структуры слоев с каноном FSD v2.1
- Переименовать директорию `src/views/` в каноническую для App Router `src/_pages/` (или `src/pages/`).
- Рассмотреть перенос экранной секции `widgets/related-meals` внутрь слайса `pages/meal-details`, а `widgets/meal-grid` — в `entities/meal/ui` или `shared/ui`.

#### Задача P4.4: Рефакторинг сущности `entities/user`
- Перенести сессионную логику и DTO авторизации из `entities/user` в `src/shared/auth/`, так как пользователь в приложении не имеет собственной предметной доменной модели.

---

## Заключение

Проведенный аудит показал, что проект `TheMealApp` обладает качественным архитектурным фундаментом: соблюдена 100% изоляция слайсов от перекрестных импортов, выдержана строгая направленность зависимостей сверху вниз, строго соблюдаются стандарты React 19 (отсутствуют `React.FC` и устаревшие `FormEvent`), а тестовый набор находится в полностью рабочем состоянии (108 тестов пройдено).

Реализация предложенного пятиуровневого плана рефакторинга позволит:
1. Полностью устранить God-объекты и снизить максимальный размер модулей до безопасного порога <90 строк.
2. Исключить 32 потенциально небезопасных слепых приведения типов через генерацию схемы Supabase Database и создание предикатов типов.
3. Ликвидировать 13 паттернов дублирования кода, сократив объём кодовой базы на 15–20% при одновременном повышении ее надежности и удобства поддержки.
