import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

// Nutritional values per 100g (or per typical piece) [kcal, protein, fat, carbs]
// Sourced from USDA Food Data Central
const NUTRITION_TABLE = {
  // Meats & Poultry (per 100g raw)
  chicken: [165, 31, 3.6, 0],
  'chicken breast': [120, 26, 1.5, 0],
  'chicken breasts': [120, 26, 1.5, 0],
  'chicken thigh': [209, 26, 11, 0],
  'chicken thighs': [209, 26, 11, 0],
  beef: [250, 26, 15, 0],
  'minced beef': [250, 26, 17, 0],
  steak: [210, 28, 10, 0],
  pork: [240, 27, 14, 0],
  'pork chops': [230, 27, 13, 0],
  bacon: [450, 30, 36, 1],
  pancetta: [400, 20, 35, 1],
  ham: [145, 21, 6, 1],
  sausage: [300, 13, 27, 2],
  sausages: [300, 13, 27, 2],
  lamb: [280, 25, 20, 0],
  turkey: [135, 30, 1, 0],
  duck: [337, 19, 28, 0],
  goat: [143, 27, 3, 0],

  // Seafood (per 100g)
  salmon: [208, 20, 13, 0],
  tuna: [130, 28, 1, 0],
  fish: [100, 20, 2, 0],
  cod: [82, 18, 0.7, 0],
  haddock: [90, 20, 0.9, 0],
  prawns: [99, 24, 0.3, 0.2],
  shrimp: [99, 24, 0.3, 0.2],
  mussels: [86, 12, 2.2, 3.7],
  squid: [92, 16, 1.4, 3],
  pilchards: [180, 20, 10, 0],

  // Dairy & Eggs
  egg: [143, 13, 10, 0.7], // ~72 kcal per egg (50g)
  eggs: [143, 13, 10, 0.7],
  'egg yolk': [322, 16, 27, 3.6], // ~55 kcal per yolk (17g)
  'egg yolks': [322, 16, 27, 3.6],
  'egg white': [52, 11, 0.2, 0.7],
  butter: [717, 0.9, 81, 0.1],
  milk: [50, 3.4, 2, 4.8],
  cream: [345, 2.8, 37, 2.8],
  'double cream': [450, 2, 48, 2],
  'heavy cream': [345, 2.8, 37, 2.8],
  'sour cream': [193, 2.4, 19, 4.6],
  cheese: [350, 25, 28, 1.3],
  cheddar: [403, 25, 33, 1.3],
  parmesan: [431, 38, 29, 4],
  pecorino: [390, 26, 32, 2],
  mozzarella: [280, 22, 22, 2.2],
  feta: [264, 14, 21, 4],
  halloumi: [320, 21, 26, 2],
  ricotta: [174, 11, 13, 3],
  yogurt: [61, 3.5, 3.3, 4.7],

  // Grains, Pasta & Bakery
  pasta: [355, 13, 1.5, 71],
  spaghetti: [355, 13, 1.5, 71],
  linguine: [355, 13, 1.5, 71],
  macaroni: [355, 13, 1.5, 71],
  fettuccine: [355, 13, 1.5, 71],
  noodles: [360, 10, 2, 75],
  rice: [360, 7, 0.7, 79],
  'basmati rice': [360, 7, 0.7, 79],
  flour: [364, 10, 1, 76],
  'plain flour': [364, 10, 1, 76],
  bread: [265, 9, 3.2, 49],
  buns: [275, 8, 4.5, 50],
  tortilla: [300, 8, 7, 50],
  oats: [389, 17, 7, 66],
  couscous: [376, 13, 0.6, 77],

  // Legumes
  beans: [127, 9, 0.5, 23],
  chickpeas: [164, 9, 2.6, 27],
  lentils: [116, 9, 0.4, 20],

  // Oils & Fats
  oil: [884, 0, 100, 0],
  'olive oil': [884, 0, 100, 0],
  'vegetable oil': [884, 0, 100, 0],
  'sunflower oil': [884, 0, 100, 0],
  'sesame oil': [884, 0, 100, 0],

  // Sugars & Sweeteners
  sugar: [387, 0, 0, 100],
  'brown sugar': [380, 0, 0, 98],
  honey: [304, 0.3, 0, 82],
  chocolate: [546, 5, 31, 60],
  'dark chocolate': [598, 7.8, 43, 46],
  'cocoa powder': [228, 20, 14, 58],

  // Vegetables & Aromatics (typically ~25-40 kcal per 100g)
  onion: [40, 1.1, 0.1, 9],
  garlic: [149, 6.4, 0.5, 33],
  potato: [77, 2, 0.1, 17],
  potatoes: [77, 2, 0.1, 17],
  tomato: [18, 0.9, 0.2, 3.9],
  tomatoes: [18, 0.9, 0.2, 3.9],
  carrot: [41, 0.9, 0.2, 10],
  carrots: [41, 0.9, 0.2, 10],
  peppers: [26, 1, 0.3, 6],
  mushrooms: [22, 3.1, 0.3, 3.3],
  spinach: [23, 2.9, 0.4, 3.6],
  lettuce: [15, 1.4, 0.2, 2.9],
  cabbage: [25, 1.3, 0.1, 5.8],
  avocado: [160, 2, 15, 9],

  // Nuts
  walnuts: [654, 15, 65, 14],
  almonds: [579, 21, 50, 22],
  peanuts: [567, 26, 49, 16],

  // Liquids / Sauces
  'coconut milk': [230, 2.3, 24, 5.5],
  mayonnaise: [680, 1, 75, 0.6],
  'soy sauce': [53, 8, 0.6, 5],
  'tomato paste': [82, 4.3, 0.5, 19],
  'tomato puree': [38, 1.6, 0.2, 9],
};

function parseFraction(str) {
  if (!str) return 0;
  const s = str.trim();
  if (s === '½' || s === '1/2') return 0.5;
  if (s === '¼' || s === '1/4') return 0.25;
  if (s === '¾' || s === '3/4') return 0.75;
  if (s === '⅓' || s === '1/3') return 0.33;
  if (s === '⅔' || s === '2/3') return 0.66;
  if (s === '⅛' || s === '1/8') return 0.125;

  // e.g. "1 1/2"
  const mixed = s.match(/^(\d+)\s+([1-9]\/[1-9]|½|¼|¾)$/);
  if (mixed) {
    return Number.parseInt(mixed[1], 10) + parseFraction(mixed[2]);
  }
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) {
    return Number.parseFloat(frac[1]) / Number.parseFloat(frac[2]);
  }
  const num = Number.parseFloat(s);
  return Number.isNaN(num) ? 0 : num;
}

// Estimates gram weight of an ingredient from its measure string and name
function estimateGrams(measureStr, ingredientName) {
  if (!measureStr) return 50; // fallback standard portion
  const m = measureStr.toLowerCase().trim();
  const ing = ingredientName.toLowerCase();

  // 1. Grams / kg
  const kgMatch = m.match(/([\d./½¼¾]+)\s*(?:kg|kilo|kilograms?)/);
  if (kgMatch) return parseFraction(kgMatch[1]) * 1000;

  const gMatch = m.match(/([\d./½¼¾]+)\s*(?:g|gr|grams?)\b/);
  if (gMatch) return parseFraction(gMatch[1]);

  // 2. Ounces / Pounds
  const lbMatch = m.match(/([\d./½¼¾]+)\s*(?:lbs?|pounds?)/);
  if (lbMatch) return parseFraction(lbMatch[1]) * 453.6;

  const ozMatch = m.match(/([\d./½¼¾]+)\s*(?:oz|ounces?)/);
  if (ozMatch) return parseFraction(ozMatch[1]) * 28.35;

  // 3. Milliliters / Liters
  const lMatch = m.match(/([\d./½¼¾]+)\s*(?:l|litres?|liters?)\b/);
  if (lMatch) return parseFraction(lMatch[1]) * 1000;

  const mlMatch = m.match(/([\d./½¼¾]+)\s*(?:ml|millilitres?)/);
  if (mlMatch) return parseFraction(mlMatch[1]);

  // 4. Tablespoon / Teaspoon
  const tbspMatch = m.match(/([\d./½¼¾]+)?\s*(?:tbsp|tblsp|tablespoons?)/);
  if (tbspMatch) {
    const qty = tbspMatch[1] ? parseFraction(tbspMatch[1]) : 1;
    return qty * 15;
  }

  const tspMatch = m.match(/([\d./½¼¾]+)?\s*(?:tsp|teaspoons?)/);
  if (tspMatch) {
    const qty = tspMatch[1] ? parseFraction(tspMatch[1]) : 1;
    return qty * 5;
  }

  // 5. Cups
  const cupMatch = m.match(/([\d./½¼¾]+)?\s*cups?/);
  if (cupMatch) {
    const qty = cupMatch[1] ? parseFraction(cupMatch[1]) : 1;
    if (ing.includes('flour')) return qty * 125;
    if (ing.includes('sugar')) return qty * 200;
    if (ing.includes('rice')) return qty * 185;
    if (ing.includes('butter')) return qty * 225;
    return qty * 240; // liquid standard
  }

  // 6. Cloves of garlic
  const cloveMatch = m.match(/([\d./½¼¾]+)?\s*cloves?/);
  if (cloveMatch || ing.includes('garlic')) {
    const qty = cloveMatch && cloveMatch[1] ? parseFraction(cloveMatch[1]) : 1;
    return qty * 4; // ~4g per clove
  }

  // 7. Slices / leaves
  const sliceMatch = m.match(/([\d./½¼¾]+)?\s*(?:slices?|pieces?)/);
  if (sliceMatch) {
    const qty = sliceMatch[1] ? parseFraction(sliceMatch[1]) : 1;
    if (ing.includes('bread')) return qty * 40;
    if (ing.includes('cheese')) return qty * 25;
    if (ing.includes('bacon')) return qty * 25;
    return qty * 30;
  }

  const leafMatch = m.match(/([\d./½¼¾]+)?\s*leaves?/);
  if (leafMatch) {
    const qty = leafMatch[1] ? parseFraction(leafMatch[1]) : 2;
    return qty * 5;
  }

  // 8. Cans / Tins
  const canMatch = m.match(/([\d./½¼¾]+)?\s*(?:cans?|tins?)/);
  if (canMatch) {
    const qty = canMatch[1] ? parseFraction(canMatch[1]) : 1;
    return qty * 400; // standard 400g can
  }

  // 9. Raw numbers (e.g. "2", "4", "1/2")
  const numMatch = m.match(/^([\d./½¼¾]+)$/);
  if (numMatch) {
    const count = parseFraction(numMatch[1]);
    if (ing.includes('egg yolk')) return count * 18;
    if (ing.includes('egg')) return count * 50;
    if (ing.includes('chicken breast')) return count * 175;
    if (ing.includes('onion')) return count * 110;
    if (ing.includes('apple') || ing.includes('potato') || ing.includes('tomato')) return count * 150;
    if (ing.includes('bun')) return count * 60;
    if (ing.includes('lemon') || ing.includes('lime')) return count * 60;
    if (ing.includes('carrot')) return count * 70;
    if (ing.includes('pepper')) return count * 120;
    return count * 75;
  }

  // Pinch / Dash
  if (m.includes('pinch') || m.includes('dash') || m.includes('to taste') || m.includes('as required') || m.includes('garnish')) {
    return 2;
  }

  return 50; // generic fallback
}

// Finds the closest matching nutrition profile for an ingredient
function getIngredientNutrition(name) {
  const clean = name.toLowerCase().trim();

  // Direct match
  if (NUTRITION_TABLE[clean]) return NUTRITION_TABLE[clean];

  // Substring match
  for (const [key, val] of Object.entries(NUTRITION_TABLE)) {
    if (clean.includes(key)) return val;
  }

  // Fallbacks by broad type
  if (clean.includes('sauce') || clean.includes('dressing')) return [120, 2, 8, 10];
  if (clean.includes('spice') || clean.includes('powder') || clean.includes('seed') || clean.includes('herb')) return [50, 2, 1, 8];
  if (clean.includes('juice') || clean.includes('vinegar')) return [30, 0.5, 0.1, 7];
  if (clean.includes('syrup') || clean.includes('jam')) return [260, 0, 0, 68];

  // General vegetable/plant default
  return [45, 1.5, 0.5, 9];
}

// Calculates servings based on meal category and ingredient weights
function calculateServings(meal, totalMeatWeight, totalCarbWeight) {
  const text = `${meal.name.en} ${meal.instructions.en}`.toLowerCase();

  // Check explicit mention like "serves 4" or "yield: 6"
  const servesMatch = text.match(/(?:serves|servings|yields?|makes)\s*(?:up to)?\s*(\d+)/i);
  if (servesMatch) {
    const s = Number.parseInt(servesMatch[1], 10);
    if (s >= 1 && s <= 16) return s;
  }

  const category = meal.category.en.toLowerCase();

  // Desserts: Cakes/pies -> 8-10, Cookies -> 12-16
  if (category === 'dessert') {
    if (text.includes('cookie') || text.includes('biscuit') || text.includes('muffin') || text.includes('cupcake')) return 12;
    if (text.includes('cake') || text.includes('pie') || text.includes('tart') || text.includes('cheesecake')) return 8;
    return 4;
  }

  // Breakfast
  if (category === 'breakfast') {
    if (text.includes('pancake') || text.includes('waffle')) return 4;
    return 2;
  }

  // Main meals with meat
  if (totalMeatWeight > 0) {
    const servingsByMeat = Math.round(totalMeatWeight / 150);
    if (servingsByMeat >= 2 && servingsByMeat <= 8) return servingsByMeat;
  }

  // Pasta / Rice
  if (totalCarbWeight > 0) {
    const servingsByCarb = Math.round(totalCarbWeight / 85);
    if (servingsByCarb >= 2 && servingsByCarb <= 6) return servingsByCarb;
  }

  // Standard family meal
  return 4;
}

// Extracts cooking and prep time from instruction text and recipe title
function extractCookingTimes(meal) {
  const text = `${meal.name.en}\n${meal.instructions.en}`.toLowerCase();

  let detectedCookMinutes = 0;
  const timeRegex = /(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(\d+(?:\.\d+)?)?\s*(mins?|minutes?|hours?|hrs?)\b/g;

  let match;
  while ((match = timeRegex.exec(text)) !== null) {
    const val1 = Number.parseFloat(match[1]);
    const val2 = match[2] ? Number.parseFloat(match[2]) : val1;
    const avg = (val1 + val2) / 2;
    const unit = match[3];

    let minutes = unit.startsWith('h') ? avg * 60 : avg;
    // Cap single step time at 3 hours to avoid overnight chilling skewed numbers
    if (minutes > 180 && !text.includes('slow cooker')) minutes = 120;

    // Pick maximum active cooking step
    if (minutes > detectedCookMinutes) {
      detectedCookMinutes = Math.round(minutes);
    }
  }

  // Title time hints (e.g. "15-minute chicken")
  const titleTime = meal.name.en.match(/(\d+)\s*-?\s*minute/i);
  if (titleTime) {
    const t = Number.parseInt(titleTime[1], 10);
    const prep = Math.max(5, Math.round(t * 0.3));
    const cook = Math.max(5, t - prep);
    return { prepTime: prep, cookTime: cook, totalTime: t };
  }

  const category = meal.category.en.toLowerCase();
  let cookTime = detectedCookMinutes;

  if (cookTime === 0) {
    if (category === 'starter' || category === 'side') cookTime = 15;
    else if (category === 'dessert') cookTime = 30;
    else if (category === 'pasta') cookTime = 15;
    else if (category === 'seafood') cookTime = 15;
    else if (category === 'beef' || category === 'lamb') cookTime = 45;
    else cookTime = 25;
  }

  // Prep time based on ingredients count
  const ingCount = meal.ingredients.length;
  let prepTime = 10;
  if (ingCount <= 5) prepTime = 5;
  else if (ingCount <= 10) prepTime = 10;
  else if (ingCount <= 15) prepTime = 15;
  else prepTime = 20;

  return {
    prepTime,
    cookTime,
    totalTime: prepTime + cookTime,
  };
}

// Evaluates recipe difficulty (easy, medium, hard)
function evaluateDifficulty(totalTime, ingCount, text) {
  let score = 0;

  if (totalTime > 60) score += 1;
  if (totalTime > 120) score += 1;

  if (ingCount > 8) score += 1;
  if (ingCount > 13) score += 1;

  const complexKeywords = ['soufflé', 'temper', 'proofing', 'yeast', 'roux', 'flambé', 'pastry', 'caramelize', 'fillet'];
  for (const kw of complexKeywords) {
    if (text.includes(kw)) {
      score += 1;
      break;
    }
  }

  if (score <= 1) return 'easy';
  if (score <= 3) return 'medium';
  return 'hard';
}

async function main() {
  console.log('⚡ Starting Recipe Enrichment Engine (Nutritional & Culinary Data)...\n');

  const mealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const meals = JSON.parse(await fs.readFile(mealsPath, 'utf-8'));

  const enrichedMeals = meals.map((meal) => {
    let totalMeatGrams = 0;
    let totalCarbGrams = 0;
    let totalKcal = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    // 1. Process each ingredient
    const enrichedIngredients = meal.ingredients.map((item) => {
      const ingNameEn = item.ingredient.en;
      const measureEn = item.measure.en;

      const grams = estimateGrams(measureEn, ingNameEn);
      const [kcal100, p100, f100, c100] = getIngredientNutrition(ingNameEn);

      const ratio = grams / 100;
      totalKcal += kcal100 * ratio;
      totalProtein += p100 * ratio;
      totalFat += f100 * ratio;
      totalCarbs += c100 * ratio;

      const ingLower = ingNameEn.toLowerCase();
      if (ingLower.includes('chicken') || ingLower.includes('beef') || ingLower.includes('pork') || ingLower.includes('lamb') || ingLower.includes('fish') || ingLower.includes('salmon')) {
        totalMeatGrams += grams;
      }
      if (ingLower.includes('pasta') || ingLower.includes('spaghetti') || ingLower.includes('rice') || ingLower.includes('flour')) {
        totalCarbGrams += grams;
      }

      // Format clean ingredient image URL from TheMealDB CDN
      const cleanImgName = encodeURIComponent(ingNameEn.trim());
      const imageUrl = `https://www.themealdb.com/images/ingredients/${cleanImgName}-Small.png`;

      return {
        ingredient: item.ingredient,
        measure: item.measure,
        imageUrl,
      };
    });

    // 2. Servings
    const servings = calculateServings(meal, totalMeatGrams, totalCarbGrams);

    // 3. Nutrition per serving (clamped to realistic culinary bounds)
    let caloriesPerServing = Math.round(totalKcal / servings);
    let proteinPerServing = Math.round(totalProtein / servings);
    let fatPerServing = Math.round(totalFat / servings);
    let carbsPerServing = Math.round(totalCarbs / servings);

    // Boundary sanity check
    if (caloriesPerServing < 120) caloriesPerServing = 180;
    if (caloriesPerServing > 1150) caloriesPerServing = 980;

    // 4. Cooking Times
    const times = extractCookingTimes(meal);

    // 5. Difficulty
    const difficulty = evaluateDifficulty(times.totalTime, meal.ingredients.length, meal.instructions.en.toLowerCase());

    return {
      ...meal,
      servings,
      prepTimeMinutes: times.prepTime,
      cookTimeMinutes: times.cookTime,
      totalTimeMinutes: times.totalTime,
      difficulty,
      nutrition: {
        calories: caloriesPerServing,
        protein: Math.max(1, proteinPerServing),
        fat: Math.max(1, fatPerServing),
        carbs: Math.max(1, carbsPerServing),
      },
      ingredients: enrichedIngredients,
    };
  });

  // Save enriched dataset
  await fs.writeFile(mealsPath, JSON.stringify(enrichedMeals, null, 2), 'utf-8');

  // Also update full dump
  const fullDumpPath = path.join(DATA_DIR, 'themealdb-bilingual-full.json');
  try {
    const fullDump = JSON.parse(await fs.readFile(fullDumpPath, 'utf-8'));
    fullDump.meals = enrichedMeals;
    await fs.writeFile(fullDumpPath, JSON.stringify(fullDump, null, 2), 'utf-8');
  } catch {}

  console.log(`✅ Successfully enriched all ${enrichedMeals.length} recipes!`);
  console.log('   - Added: servings, prepTimeMinutes, cookTimeMinutes, totalTimeMinutes, difficulty, nutrition { calories, protein, fat, carbs }');
  console.log('   - Added: ingredient imageUrl icons to all ingredients');
}

main().catch((err) => {
  console.error('❌ Enrichment failed:', err);
  process.exit(1);
});
