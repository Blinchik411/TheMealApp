import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function translateText(text) {
  if (!text || !text.trim()) return text;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=${encodeURIComponent(text)}`;

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      if (!data || !Array.isArray(data[0])) {
        throw new Error('Unexpected translation response format');
      }
      return data[0].map((s) => s[0]).join('');
    } catch (err) {
      if (attempt === 4) {
        console.warn(`[WARN] Translation failed after 4 attempts for text preview: "${text.slice(0, 30)}..." -`, err.message);
        return text;
      }
      await sleep(1000 * attempt);
    }
  }
}

// Batch translate short phrases joined by newline
async function batchTranslateList(items, batchSize = 35) {
  const result = new Map();
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    const combined = chunk.join('\n');
    const translatedCombined = await translateText(combined);
    const translatedLines = (translatedCombined || '').split('\n');

    chunk.forEach((orig, idx) => {
      const trans = (translatedLines[idx] || orig).trim();
      result.set(orig, trans);
    });

    process.stdout.write(`   Translated ${Math.min(i + batchSize, items.length)}/${items.length} phrases...\r`);
    await sleep(150);
  }
  console.log(`   Translated ${items.length}/${items.length} phrases!                  `);
  return result;
}

const KNOWN_AREAS = {
  American: 'Американская',
  British: 'Британская',
  Canadian: 'Канадская',
  Chinese: 'Китайская',
  Croatian: 'Хорватская',
  Dutch: 'Голландская',
  Egyptian: 'Египетская',
  Filipino: 'Филиппинская',
  French: 'Французская',
  Greek: 'Греческая',
  Indian: 'Индийская',
  Irish: 'Ирландская',
  Italian: 'Итальянская',
  Jamaican: 'Ямайская',
  Japanese: 'Японская',
  Kenyan: 'Кенийская',
  Malaysian: 'Малайзийская',
  Mexican: 'Мексиканская',
  Moroccan: 'Марокканская',
  Polish: 'Польская',
  Portuguese: 'Португальская',
  Russian: 'Русская',
  Spanish: 'Испанская',
  Thai: 'Тайская',
  Tunisian: 'Тунисская',
  Turkish: 'Турецкая',
  Ukrainian: 'Украинская',
  Unknown: 'Другая',
  Vietnamese: 'Вьетнамская',
};

const KNOWN_CATEGORIES = {
  Beef: 'Говядина',
  Chicken: 'Курица',
  Dessert: 'Десерты',
  Lamb: 'Баранина',
  Miscellaneous: 'Разное',
  Pasta: 'Паста',
  Pork: 'Свинина',
  Seafood: 'Морепродукты',
  Side: 'Гарниры',
  Starter: 'Закуски',
  Vegan: 'Веганское',
  Vegetarian: 'Вегетарианское',
  Breakfast: 'Завтраки',
  Goat: 'Козлятина',
};

async function main() {
  console.log('🌐 Starting TheMealDB Bilingual Translation (EN -> RU)...');

  const fullDataPath = path.join(DATA_DIR, 'themealdb-full.json');
  let rawFull;
  try {
    const rawContent = await fs.readFile(fullDataPath, 'utf-8');
    rawFull = JSON.parse(rawContent);
  } catch {
    console.error('❌ Data files not found. Run "pnpm parse:meals" first.');
    process.exit(1);
  }

  const { categories, meals } = rawFull;

  // 1. Dictionaries
  const dictPath = path.join(DATA_DIR, 'dictionary-ru.json');
  let dict = { ingredients: {}, measures: {}, categories: {}, areas: {} };
  try {
    const dictContent = await fs.readFile(dictPath, 'utf-8');
    dict = JSON.parse(dictContent);
    console.log('📖 Loaded existing translations dictionary.');
  } catch {
    console.log('📖 Generating new translations dictionary...');
  }

  // 1a. Areas in batch
  console.log('\n🌍 Translating Areas / Cuisines...');
  const missingAreas = (rawFull.areas || []).filter((a) => !dict.areas[a] && !KNOWN_AREAS[a]);
  for (const [en, ru] of Object.entries(KNOWN_AREAS)) {
    if (!dict.areas[en]) dict.areas[en] = ru;
  }
  if (missingAreas.length > 0) {
    const areaMap = await batchTranslateList(missingAreas, 40);
    for (const [en, ru] of areaMap) dict.areas[en] = ru;
  }
  console.log(`   Areas ready: ${Object.keys(dict.areas).length}`);

  // 1b. Categories
  console.log('📦 Translating Categories...');
  for (const cat of categories) {
    if (!dict.categories[cat.name]) {
      const ruName = KNOWN_CATEGORIES[cat.name] || (await translateText(cat.name));
      const ruDesc = cat.description ? await translateText(cat.description) : '';
      dict.categories[cat.name] = { name: ruName, description: ruDesc };
      await sleep(100);
    }
  }

  // 1c. Unique Ingredients
  const uniqueIngredients = Array.from(
    new Set(meals.flatMap((m) => m.ingredients.map((i) => i.ingredient)).filter(Boolean))
  );
  const missingIngredients = uniqueIngredients.filter((ing) => !dict.ingredients[ing]);
  if (missingIngredients.length > 0) {
    console.log(`🧂 Translating ${missingIngredients.length} unique ingredients...`);
    const ingMap = await batchTranslateList(missingIngredients, 35);
    for (const [en, ru] of ingMap) {
      dict.ingredients[en] = ru;
    }
  } else {
    console.log('🧂 All ingredients already translated.');
  }

  // 1d. Unique Measures
  const uniqueMeasures = Array.from(
    new Set(meals.flatMap((m) => m.ingredients.map((i) => i.measure)).filter(Boolean))
  );
  const missingMeasures = uniqueMeasures.filter((m) => !dict.measures[m]);
  if (missingMeasures.length > 0) {
    console.log(`📏 Translating ${missingMeasures.length} unique measures...`);
    const measureMap = await batchTranslateList(missingMeasures, 35);
    for (const [en, ru] of measureMap) {
      dict.measures[en] = ru;
    }
  } else {
    console.log('📏 All measures already translated.');
  }

  // Save updated dictionary
  await fs.writeFile(dictPath, JSON.stringify(dict, null, 2), 'utf-8');
  console.log('✅ Dictionary saved to data/dictionary-ru.json');

  // 2. Translate Meals (Names, Instructions, Tags)
  console.log('\n🍲 Translating Meals (793 total)...');
  const bilingualMealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const translatedMealsMap = new Map();

  try {
    const existing = JSON.parse(await fs.readFile(bilingualMealsPath, 'utf-8'));
    for (const m of existing) {
      translatedMealsMap.set(m.id, m);
    }
    console.log(`🔄 Checkpoint found: ${translatedMealsMap.size} meals already translated.`);
  } catch {
    console.log('✨ Starting fresh meals translation.');
  }

  const mealsNeedingTranslation = meals.filter((m) => !translatedMealsMap.has(m.id));
  console.log(`📋 Need to process: ${mealsNeedingTranslation.length} meals.`);

  // Batch translate names
  const nameBatch = mealsNeedingTranslation.map((m) => m.name);
  console.log('🏷️  Batch translating meal names...');
  const mealNamesMap = await batchTranslateList(nameBatch, 35);

  const CONCURRENCY = 6;
  let completedCount = translatedMealsMap.size;
  const totalCount = meals.length;

  async function processMeal(meal) {
    const nameRu = mealNamesMap.get(meal.name) || meal.name;
    const instructionsRu = await translateText(meal.instructions);

    // Tags
    let tagsRu = [];
    if (meal.tags && meal.tags.length > 0) {
      tagsRu = await Promise.all(meal.tags.map((t) => translateText(t)));
    }

    // Ingredients
    const bilingualIngredients = meal.ingredients.map((item) => ({
      ingredient: {
        en: item.ingredient,
        ru: dict.ingredients[item.ingredient] || item.ingredient,
      },
      measure: {
        en: item.measure,
        ru: dict.measures[item.measure] || item.measure,
      },
    }));

    const categoryRu = dict.categories[meal.category]?.name || meal.category;
    const areaRu = dict.areas[meal.area] || meal.area;

    const bilingualMeal = {
      id: meal.id,
      name: {
        en: meal.name,
        ru: nameRu,
      },
      category: {
        en: meal.category,
        ru: categoryRu,
      },
      area: {
        en: meal.area,
        ru: areaRu,
      },
      instructions: {
        en: meal.instructions,
        ru: instructionsRu,
      },
      imageUrl: meal.imageUrl,
      tags: {
        en: meal.tags,
        ru: tagsRu,
      },
      youtubeUrl: meal.youtubeUrl,
      ingredients: bilingualIngredients,
      sourceUrl: meal.sourceUrl,
      imageSource: meal.imageSource,
      dateModified: meal.dateModified,
    };

    translatedMealsMap.set(meal.id, bilingualMeal);
    completedCount++;

    if (completedCount % 10 === 0 || completedCount === totalCount) {
      process.stdout.write(`   Progress: ${completedCount}/${totalCount} meals (${((completedCount / totalCount) * 100).toFixed(1)}%)\r`);
    }

    if (completedCount % 25 === 0 || completedCount === totalCount) {
      const currentList = Array.from(translatedMealsMap.values());
      currentList.sort((a, b) => a.name.en.localeCompare(b.name.en));
      await fs.writeFile(bilingualMealsPath, JSON.stringify(currentList, null, 2), 'utf-8');
    }
  }

  let index = 0;
  async function worker() {
    while (index < mealsNeedingTranslation.length) {
      const meal = mealsNeedingTranslation[index++];
      if (!meal) break;
      await processMeal(meal);
      await sleep(50);
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  const finalList = Array.from(translatedMealsMap.values());
  finalList.sort((a, b) => a.name.en.localeCompare(b.name.en));

  // Save final meals
  await fs.writeFile(bilingualMealsPath, JSON.stringify(finalList, null, 2), 'utf-8');

  // Categories bilingual
  const bilingualCategories = categories.map((c) => ({
    id: c.id,
    name: {
      en: c.name,
      ru: dict.categories[c.name]?.name || c.name,
    },
    imageUrl: c.imageUrl,
    description: {
      en: c.description,
      ru: dict.categories[c.name]?.description || c.description,
    },
  }));
  const bilingualCategoriesPath = path.join(DATA_DIR, 'categories-bilingual.json');
  await fs.writeFile(bilingualCategoriesPath, JSON.stringify(bilingualCategories, null, 2), 'utf-8');

  // Complete dump
  const bilingualFullDump = {
    metadata: {
      source: 'TheMealDB',
      exportedAt: new Date().toISOString(),
      languages: ['en', 'ru'],
      counts: {
        meals: finalList.length,
        categories: bilingualCategories.length,
        ingredients: Object.keys(dict.ingredients).length,
      },
    },
    categories: bilingualCategories,
    meals: finalList,
  };
  const bilingualFullPath = path.join(DATA_DIR, 'themealdb-bilingual-full.json');
  await fs.writeFile(bilingualFullPath, JSON.stringify(bilingualFullDump, null, 2), 'utf-8');

  console.log(`\n\n🎉 Successfully completed bilingual translation!`);
  console.log(`   - Bilingual meals: ${bilingualMealsPath}`);
  console.log(`   - Bilingual categories: ${bilingualCategoriesPath}`);
  console.log(`   - Bilingual full dump: ${bilingualFullPath}`);
}

main().catch((err) => {
  console.error('\n❌ Translation failed:', err);
  process.exit(1);
});
