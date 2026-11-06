import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const DELAY_MS = 250; // Respect TheMealDB rate limits (< 60 req / 10s)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(endpoint) {
  const url = `${BASE_URL}/${endpoint}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      return data;
    } catch (err) {
      if (attempt === 3) throw err;
      console.warn(`[WARN] Retry ${attempt}/3 for ${endpoint} after error:`, err.message);
      await sleep(1500 * attempt);
    }
  }
}

// Transform raw flat meal object into a clean structured entity
function normalizeMeal(raw) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = raw[`strIngredient${i}`]?.trim();
    const measure = raw[`strMeasure${i}`]?.trim() || '';
    if (ingredient && ingredient.length > 0) {
      ingredients.push({
        ingredient,
        measure,
      });
    }
  }

  const tags = raw.strTags
    ? raw.strTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return {
    id: raw.idMeal,
    name: raw.strMeal?.trim() || '',
    drinkAlternate: raw.strDrinkAlternate?.trim() || null,
    category: raw.strCategory?.trim() || '',
    area: raw.strArea?.trim() || '',
    instructions: raw.strInstructions?.trim() || '',
    imageUrl: raw.strMealThumb?.trim() || '',
    tags,
    youtubeUrl: raw.strYoutube?.trim() || null,
    ingredients,
    sourceUrl: raw.strSource?.trim() || null,
    imageSource: raw.strImageSource?.trim() || null,
    creativeCommonsConfirmed: raw.strCreativeCommonsConfirmed?.trim() || null,
    dateModified: raw.dateModified || null,
  };
}

async function main() {
  console.log('🚀 Starting TheMealDB Parser...');
  await fs.mkdir(DATA_DIR, { recursive: true });

  // 1. Fetch categories
  console.log('📦 1/4 Fetching Categories...');
  const catData = await fetchJson('categories.php');
  const categories = (catData.categories || []).map((c) => ({
    id: c.idCategory,
    name: c.strCategory,
    imageUrl: c.strCategoryThumb,
    description: c.strCategoryDescription,
  }));
  console.log(`   Found ${categories.length} categories.`);
  await sleep(DELAY_MS);

  // 2. Fetch areas
  console.log('🌍 2/4 Fetching Areas (Cuisines)...');
  const areaData = await fetchJson('list.php?a=list');
  const areas = (areaData.meals || []).map((a) => a.strArea).filter(Boolean);
  console.log(`   Found ${areas.length} areas.`);
  await sleep(DELAY_MS);

  // 3. Fetch all base ingredients
  console.log('🧂 3/4 Fetching Ingredients Catalog...');
  const ingData = await fetchJson('list.php?i=list');
  const ingredientsCatalog = (ingData.meals || []).map((i) => ({
    id: i.idIngredient,
    name: i.strIngredient,
    description: i.strDescription || null,
    type: i.strType || null,
  }));
  console.log(`   Found ${ingredientsCatalog.length} ingredients in catalog.`);
  await sleep(DELAY_MS);

  // 4. Fetch all meals
  console.log('🍲 4/4 Fetching Meals...');
  const mealsMap = new Map();

  // 4a. Fetch by letter
  const letters = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
  for (const letter of letters) {
    process.stdout.write(`   Fetching letter '${letter}'... `);
    const data = await fetchJson(`search.php?f=${letter}`);
    const meals = data?.meals || [];
    for (const raw of meals) {
      if (raw.idMeal && !mealsMap.has(raw.idMeal)) {
        mealsMap.set(raw.idMeal, normalizeMeal(raw));
      }
    }
    console.log(`(${meals.length} meals, total so far: ${mealsMap.size})`);
    await sleep(DELAY_MS);
  }

  // 4b. Cross-check with categories to catch any meals not caught by initial letters
  console.log('🔍 Cross-checking with all categories for any missing meals...');
  const missingMealIds = [];
  for (const cat of categories) {
    const data = await fetchJson(`filter.php?c=${encodeURIComponent(cat.name)}`);
    const list = data?.meals || [];
    for (const item of list) {
      if (!mealsMap.has(item.idMeal) && !missingMealIds.includes(item.idMeal)) {
        missingMealIds.push(item.idMeal);
      }
    }
    await sleep(DELAY_MS);
  }

  if (missingMealIds.length > 0) {
    console.log(`   Found ${missingMealIds.length} missing meals. Fetching details...`);
    for (const id of missingMealIds) {
      const data = await fetchJson(`lookup.php?i=${id}`);
      if (data?.meals?.[0]) {
        mealsMap.set(id, normalizeMeal(data.meals[0]));
      }
      await sleep(DELAY_MS);
    }
  } else {
    console.log('   All meals from categories are already captured!');
  }

  const allMeals = Array.from(mealsMap.values());
  // Sort by name for clean deterministic order
  allMeals.sort((a, b) => a.name.localeCompare(b.name));

  // Collect all unique ingredients actually used in recipes
  const usedIngredients = new Set();
  for (const meal of allMeals) {
    for (const item of meal.ingredients) {
      usedIngredients.add(item.ingredient);
    }
  }

  console.log('\n📊 Summary Statistics:');
  console.log(`   - Total Meals: ${allMeals.length}`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Areas: ${areas.length}`);
  console.log(`   - Catalog Ingredients: ${ingredientsCatalog.length}`);
  console.log(`   - Actually Used Ingredients: ${usedIngredients.size}`);

  // Save to disk
  const fullDump = {
    metadata: {
      source: 'TheMealDB',
      exportedAt: new Date().toISOString(),
      counts: {
        meals: allMeals.length,
        categories: categories.length,
        areas: areas.length,
        catalogIngredients: ingredientsCatalog.length,
        usedIngredients: usedIngredients.size,
      },
    },
    categories,
    areas,
    ingredientsCatalog,
    meals: allMeals,
  };

  const fullDumpPath = path.join(DATA_DIR, 'themealdb-full.json');
  const mealsOnlyPath = path.join(DATA_DIR, 'meals.json');

  await fs.writeFile(fullDumpPath, JSON.stringify(fullDump, null, 2), 'utf-8');
  await fs.writeFile(mealsOnlyPath, JSON.stringify(allMeals, null, 2), 'utf-8');

  const stat = await fs.stat(fullDumpPath);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);

  console.log(`\n✅ Saved parsed data:`);
  console.log(`   - Full dump: ${fullDumpPath} (${sizeMb} MB)`);
  console.log(`   - Meals list: ${mealsOnlyPath}`);
}

main().catch((err) => {
  console.error('\n❌ Parser failed:', err);
  process.exit(1);
});
