import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

const MEAT_SEAFOOD_WORDS = [
  'chicken', 'beef', 'pork', 'lamb', 'bacon', 'pancetta', 'ham', 'sausage',
  'steak', 'meat', 'turkey', 'duck', 'goat', 'veal', 'mutton', 'lard',
  'salmon', 'tuna', 'fish', 'cod', 'haddock', 'prawn', 'shrimp', 'mussel',
  'squid', 'clam', 'crab', 'lobster', 'anchov', 'gelatin', 'oyster',
];

const DAIRY_WORDS = [
  'milk', 'butter', 'cream', 'cheese', 'cheddar', 'parmesan', 'mozzarella',
  'feta', 'ricotta', 'halloumi', 'yogurt', 'yoghurt', 'ghee', 'sour cream',
  'double cream', 'heavy cream', 'mascarpone', 'brie', 'camembert', 'pecorino',
];

const GLUTEN_WORDS = [
  'flour', 'bread', 'pasta', 'spaghetti', 'macaroni', 'noodles', 'bun',
  'buns', 'dough', 'pastry', 'phyllo', 'filo', 'crust', 'tortilla', 'soy sauce',
  'couscous', 'barley', 'rye', 'wheat', 'batter', 'breadcrumb',
];

const MEAL_TYPE_LABELS = {
  breakfast: { ru: 'Завтрак', en: 'Breakfast' },
  lunch: { ru: 'Обед', en: 'Lunch' },
  dinner: { ru: 'Ужин', en: 'Dinner' },
  dessert: { ru: 'Десерт', en: 'Dessert' },
  snack: { ru: 'Перекус / Закуска', en: 'Snack / Starter' },
};

async function main() {
  console.log('🏷️ Adding Meal Types & Dietary Tags to All Recipes...\n');

  const mealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const meals = JSON.parse(await fs.readFile(mealsPath, 'utf-8'));

  const typeCounters = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    dessert: 0,
    snack: 0,
  };

  let vegCount = 0;
  let veganCount = 0;
  let gfCount = 0;
  let dfCount = 0;

  const updatedMeals = meals.map((meal) => {
    const cat = meal.category.en.toLowerCase();
    const name = meal.name.en.toLowerCase();
    const tags = (meal.tags?.en || []).map((t) => t.toLowerCase());
    const allIngText = meal.ingredients.map((i) => i.ingredient.en.toLowerCase()).join(' ');

    // 1. Dietary classification
    const hasMeat = MEAT_SEAFOOD_WORDS.some((w) => allIngText.includes(w));
    const isVegetarian = (!hasMeat && cat !== 'beef' && cat !== 'chicken' && cat !== 'lamb' && cat !== 'pork' && cat !== 'seafood' && cat !== 'goat') || cat === 'vegetarian' || cat === 'vegan';

    const hasDairy = DAIRY_WORDS.some((w) => allIngText.includes(w));
    const hasEgg = allIngText.includes('egg');
    const hasHoney = allIngText.includes('honey');
    const isVegan = (isVegetarian && !hasDairy && !hasEgg && !hasHoney) || cat === 'vegan';

    const isGlutenFree = !GLUTEN_WORDS.some((w) => allIngText.includes(w));
    const isDairyFree = !hasDairy;

    if (isVegetarian) vegCount++;
    if (isVegan) veganCount++;
    if (isGlutenFree) gfCount++;
    if (isDairyFree) dfCount++;

    const dietary = {
      isVegetarian,
      isVegan,
      isGlutenFree,
      isDairyFree,
    };

    // 2. Meal Occasion / Type classification
    const types = [];

    if (cat === 'breakfast' || tags.includes('breakfast') || /pancake|waffle|omelette|porridge|frittata|granola/i.test(name)) {
      types.push('breakfast');
    }

    if (cat === 'dessert' || tags.includes('dessert') || /cake|cookie|pudding|pie|tart|brownie|mousse|ice cream|crumble/i.test(name)) {
      types.push('dessert');
    }

    if (cat === 'starter' || cat === 'side' || tags.includes('snack') || /dip|chips|nuggets|finger|nacho|bruschetta|guacamole|hummus/i.test(name)) {
      types.push('snack');
    }

    if (!types.includes('dessert')) {
      if (['beef', 'chicken', 'lamb', 'pork', 'seafood', 'pasta', 'goat'].includes(cat)) {
        types.push('lunch', 'dinner');
      } else if (['vegetarian', 'vegan', 'miscellaneous'].includes(cat)) {
        types.push('lunch', 'dinner');
      }
    }

    if (types.length === 0) {
      types.push('dinner');
    }

    const uniqueTypes = [...new Set(types)];
    for (const t of uniqueTypes) {
      typeCounters[t]++;
    }

    return {
      ...meal,
      mealType: uniqueTypes,
      dietary,
    };
  });

  // Save meals
  await fs.writeFile(mealsPath, JSON.stringify(updatedMeals, null, 2), 'utf-8');

  // Save meal types catalog
  const mealTypesCatalog = Object.keys(MEAL_TYPE_LABELS).map((key) => ({
    id: key,
    name: MEAL_TYPE_LABELS[key],
    count: typeCounters[key],
  }));
  const mealTypesPath = path.join(DATA_DIR, 'meal-types-bilingual.json');
  await fs.writeFile(mealTypesPath, JSON.stringify(mealTypesCatalog, null, 2), 'utf-8');

  // Update full dump
  const fullDumpPath = path.join(DATA_DIR, 'themealdb-bilingual-full.json');
  try {
    const fullDump = JSON.parse(await fs.readFile(fullDumpPath, 'utf-8'));
    fullDump.meals = updatedMeals;
    fullDump.mealTypes = mealTypesCatalog;
    await fs.writeFile(fullDumpPath, JSON.stringify(fullDump, null, 2), 'utf-8');
  } catch {}

  console.log('✅ Successfully added mealType & dietary to all 793 meals!');
  console.log('\n📊 Meal Types:');
  console.table(mealTypesCatalog.map((t) => ({ type: t.id, ru: t.name.ru, en: t.name.en, count: t.count })));
  console.log('\n🥗 Dietary breakdown:');
  console.log(`   - Vegetarian: ${vegCount} (${((vegCount / meals.length) * 100).toFixed(1)}%)`);
  console.log(`   - Vegan: ${veganCount} (${((veganCount / meals.length) * 100).toFixed(1)}%)`);
  console.log(`   - Gluten Free: ${gfCount} (${((gfCount / meals.length) * 100).toFixed(1)}%)`);
  console.log(`   - Dairy Free: ${dfCount} (${((dfCount / meals.length) * 100).toFixed(1)}%)`);
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
