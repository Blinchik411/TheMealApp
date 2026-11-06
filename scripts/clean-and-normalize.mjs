import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

// Standardized mapping of cuisine names to consistent culinary adjectives
const CANONICAL_AREAS = {
  // Normalize countries to adjectives
  'United States': { en: 'American', ru: 'Американская' },
  France: { en: 'French', ru: 'Французская' },
  India: { en: 'Indian', ru: 'Индийская' },
  Netherlands: { en: 'Dutch', ru: 'Голландская' },
  Norway: { en: 'Norwegian', ru: 'Норвежская' },
  Argentina: { en: 'Argentinian', ru: 'Аргентинская' },
  Venezuela: { en: 'Venezuelan', ru: 'Венесуэльская' },
  Slovakia: { en: 'Slovak', ru: 'Словацкая' },
  Australian: { en: 'Australian', ru: 'Австралийская' },
  Algerian: { en: 'Algerian', ru: 'Алжирская' },
  'Saudi Arabian': { en: 'Saudi Arabian', ru: 'Саудовская' },
  Uruguayan: { en: 'Uruguayan', ru: 'Уругвайская' },
  Syrian: { en: 'Syrian', ru: 'Сирийская' },

  // Standard adjectives
  British: { en: 'British', ru: 'Британская' },
  Spanish: { en: 'Spanish', ru: 'Испанская' },
  Turkish: { en: 'Turkish', ru: 'Турецкая' },
  Chinese: { en: 'Chinese', ru: 'Китайская' },
  Vietnamese: { en: 'Vietnamese', ru: 'Вьетнамская' },
  Polish: { en: 'Polish', ru: 'Польская' },
  Jamaican: { en: 'Jamaican', ru: 'Ямайская' },
  Thai: { en: 'Thai', ru: 'Тайская' },
  Canadian: { en: 'Canadian', ru: 'Канадская' },
  Italian: { en: 'Italian', ru: 'Итальянская' },
  Japanese: { en: 'Japanese', ru: 'Японская' },
  Malaysian: { en: 'Malaysian', ru: 'Малайзийская' },
  Filipino: { en: 'Filipino', ru: 'Филиппинская' },
  Irish: { en: 'Irish', ru: 'Ирландская' },
  Croatian: { en: 'Croatian', ru: 'Хорватская' },
  Tunisian: { en: 'Tunisian', ru: 'Тунисская' },
  Greek: { en: 'Greek', ru: 'Греческая' },
  Egyptian: { en: 'Egyptian', ru: 'Египетская' },
  Portuguese: { en: 'Portuguese', ru: 'Португальская' },
  Russian: { en: 'Russian', ru: 'Русская' },
  Ukrainian: { en: 'Ukrainian', ru: 'Украинская' },
  Mexican: { en: 'Mexican', ru: 'Мексиканская' },
  Moroccan: { en: 'Moroccan', ru: 'Марокканская' },
  Kenyan: { en: 'Kenyan', ru: 'Кенийская' },
  Default: { en: 'International', ru: 'Международная' },
};

// Patterns to detect country from recipe name / text for the 190 empty-area meals
const AREA_PATTERNS = [
  { match: /colombian|arepa|almoj/i, en: 'Colombian', ru: 'Колумбийская' },
  { match: /brazil|acaraje|moqueca|brigadeiro/i, en: 'Brazilian', ru: 'Бразильская' },
  { match: /cambodian|amok trey/i, en: 'Cambodian', ru: 'Камбоджийская' },
  { match: /antigua/i, en: 'Antiguan', ru: 'Антигуанская' },
  { match: /dutch|arnhemse/i, en: 'Dutch', ru: 'Голландская' },
  { match: /albanian|arra t/i, en: 'Albanian', ru: 'Албанская' },
  { match: /laos|laotian/i, en: 'Laotian', ru: 'Лаосская' },
  { match: /peruvian|ceviche/i, en: 'Peruvian', ru: 'Перуанская' },
  { match: /georgian|khachapuri|khinkali/i, en: 'Georgian', ru: 'Грузинская' },
  { match: /german|schnitzel|strudel/i, en: 'German', ru: 'Немецкая' },
  { match: /korean|kimchi|bulgogi|bibimbap/i, en: 'Korean', ru: 'Корейская' },
  { match: /hungarian|goulash/i, en: 'Hungarian', ru: 'Венгерская' },
  { match: /swedish|meatballs/i, en: 'Swedish', ru: 'Шведская' },
  { match: /lebanese|hummus|tabbouleh|falafel/i, en: 'Lebanese', ru: 'Ливанская' },
  { match: /italian|carbonara|risotto|bolognese|pasta/i, en: 'Italian', ru: 'Итальянская' },
  { match: /french|croissant|quiche|bourguignon|ratatouille/i, en: 'French', ru: 'Французская' },
  { match: /mexican|taco|burrito|enchilada|guacamole/i, en: 'Mexican', ru: 'Мексиканская' },
  { match: /japanese|sushi|ramen|teriyaki|miso/i, en: 'Japanese', ru: 'Японская' },
  { match: /indian|curry|tikka|masala|naan/i, en: 'Indian', ru: 'Индийская' },
];

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function resolveArea(rawArea, mealName, instructions) {
  const areaKey = typeof rawArea === 'object' && rawArea !== null ? rawArea.en : rawArea;

  // 1. If existing canonical area
  if (areaKey && CANONICAL_AREAS[areaKey]) {
    return CANONICAL_AREAS[areaKey];
  }

  // 2. Try matching patterns
  const fullText = `${mealName} ${instructions}`;
  for (const p of AREA_PATTERNS) {
    if (p.match.test(fullText)) {
      return { en: p.en, ru: p.ru };
    }
  }

  // 3. Fallback to International
  return CANONICAL_AREAS.Default;
}

async function main() {
  console.log('🧹 Starting Data Cleaning & Normalization...\n');

  const mealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const categoriesPath = path.join(DATA_DIR, 'categories-bilingual.json');

  const rawMeals = JSON.parse(await fs.readFile(mealsPath, 'utf-8'));
  const rawCategories = JSON.parse(await fs.readFile(categoriesPath, 'utf-8'));

  const areaCounters = new Map();
  const categoryCounters = new Map();
  const slugsSet = new Set();

  let emptyAreaFixed = 0;
  let breadOmeletteFixed = false;

  const cleanedMeals = rawMeals.map((meal) => {
    // 1. Normalize Area
    const origAreaEn = typeof meal.area === 'object' ? meal.area?.en : meal.area;
    const resolvedArea = resolveArea(origAreaEn, meal.name.en, meal.instructions.en);

    if (!origAreaEn || origAreaEn.trim() === '') {
      emptyAreaFixed++;
    }

    const areaKey = resolvedArea.en;
    areaCounters.set(areaKey, {
      name: resolvedArea,
      count: (areaCounters.get(areaKey)?.count || 0) + 1,
    });

    // 2. Count categories
    const catEn = meal.category.en;
    categoryCounters.set(catEn, (categoryCounters.get(catEn) || 0) + 1);

    // 3. Generate Unique Slug
    let baseSlug = generateSlug(meal.name.en);
    let finalSlug = baseSlug;
    let counter = 1;
    while (slugsSet.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter++}`;
    }
    slugsSet.add(finalSlug);

    // 4. Fix Bread Omelette (#53076)
    let instructions = meal.instructions;
    if (meal.id === '53076' && meal.instructions.en.toLowerCase().includes('make and enjoy')) {
      breadOmeletteFixed = true;
      instructions = {
        en: '1. Beat the eggs with a pinch of salt and black pepper in a shallow bowl.\n2. Heat a little butter or oil in a non-stick frying pan over medium heat.\n3. Dip each slice of bread into the beaten egg mixture, coating both sides.\n4. Place the bread into the hot pan and pour the remaining egg mixture over it.\n5. Cook for 2-3 minutes until golden brown on the bottom, then flip and cook the other side for another 1-2 minutes until golden and cooked through.\n6. Serve warm with your favorite sauce or fresh vegetables.',
        ru: '1. Взбейте яйца со щепоткой соли и черного перца в неглубокой миске.\n2. Разогрейте немного сливочного или растительного масла в антипригарной сковороде на среднем огне.\n3. Обмакните каждый ломтик хлеба во взбитую яичную смесь с обеих сторон.\n4. Выложите хлеб на горячую сковороду и вылейте сверху оставшуюся яичную смесь.\n5. Жарьте 2–3 минуты до золотистой корочки снизу, затем переверните и готовьте другую сторону еще 1–2 минуты до готовности.\n6. Подавайте горячим с любимым соусом или свежими овощами.',
      };
    }

    // 5. Clean ingredients casing
    const cleanedIngredients = meal.ingredients.map((item) => ({
      ingredient: {
        en: capitalizeFirst(item.ingredient.en.trim()),
        ru: capitalizeFirst(item.ingredient.ru.trim()),
      },
      measure: {
        en: item.measure.en.trim(),
        ru: item.measure.ru.trim(),
      },
    }));

    return {
      id: meal.id,
      slug: finalSlug,
      name: meal.name,
      category: meal.category,
      area: resolvedArea,
      instructions,
      imageUrl: meal.imageUrl,
      tags: meal.tags,
      youtubeUrl: meal.youtubeUrl,
      ingredients: cleanedIngredients,
      sourceUrl: meal.sourceUrl,
      dateModified: meal.dateModified,
    };
  });

  // 6. Build Active Areas Catalog
  const activeAreas = Array.from(areaCounters.values())
    .map((item) => ({
      slug: generateSlug(item.name.en),
      name: item.name,
      count: item.count,
    }))
    .sort((a, b) => b.count - a.count);

  // 7. Build Active Categories Catalog with counts
  const activeCategories = rawCategories.map((c) => ({
    id: c.id,
    slug: generateSlug(c.name.en),
    name: c.name,
    imageUrl: c.imageUrl,
    description: c.description,
    count: categoryCounters.get(c.name.en) || 0,
  }));
  activeCategories.sort((a, b) => b.count - a.count);

  // Save all clean files
  const cleanMealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const activeAreasPath = path.join(DATA_DIR, 'areas-bilingual.json');
  const cleanCategoriesPath = path.join(DATA_DIR, 'categories-bilingual.json');

  await fs.writeFile(cleanMealsPath, JSON.stringify(cleanedMeals, null, 2), 'utf-8');
  await fs.writeFile(activeAreasPath, JSON.stringify(activeAreas, null, 2), 'utf-8');
  await fs.writeFile(cleanCategoriesPath, JSON.stringify(activeCategories, null, 2), 'utf-8');

  console.log('✅ Data Cleaning Summary:');
  console.log(`   - Total Clean Meals: ${cleanedMeals.length}`);
  console.log(`   - Fixed empty/unassigned areas: ${emptyAreaFixed}`);
  console.log(`   - Active cuisines with >=1 recipe: ${activeAreas.length} (out of 195 empty original countries)`);
  console.log(`   - Bread Omelette recipe updated: ${breadOmeletteFixed ? 'Yes' : 'No'}`);
  console.log(`   - All slugs generated uniquely: ${slugsSet.size === cleanedMeals.length}`);
  console.log(`\n📁 Files saved:`);
  console.log(`   - ${cleanMealsPath}`);
  console.log(`   - ${activeAreasPath}`);
  console.log(`   - ${cleanCategoriesPath}`);
}

main().catch((err) => {
  console.error('❌ Cleaning failed:', err);
  process.exit(1);
});
