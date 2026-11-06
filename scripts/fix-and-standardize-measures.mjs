import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

// Clean and standardize ingredients and measures
function cleanIngredientAndMeasure(ingNameRu, ingNameEn, measureRu, measureEn) {
  let nameRu = (ingNameRu || '').trim();
  let nameEn = (ingNameEn || '').trim();
  let mRu = (measureRu || '').trim();
  let mEn = (measureEn || '').trim();

  // 1. Fix broken ingredient names
  const lowerNameRu = nameRu.toLowerCase();
  if (/^розмари$/i.test(nameRu)) nameRu = 'Розмарин';
  if (/^тамариндовый шарик$/i.test(nameRu)) nameRu = 'Тамаринд';
  if (/^соль$/i.test(nameRu) && /пинч/i.test(mRu)) mRu = 'щепотка';

  // 2. Fix misplaced attributes (e.g. Rice + White, Chocolate + Dark)
  if (/^рис$/i.test(nameRu) && /^белый$/i.test(mRu)) {
    nameRu = 'Белый рис';
    nameEn = 'White Rice';
    mRu = 'по вкусу (для подачи)';
    mEn = 'to serve';
  }
  if (/^шоколад$/i.test(nameRu) && /^темный$/i.test(mRu)) {
    nameRu = 'Темный шоколад';
    nameEn = 'Dark Chocolate';
    mRu = 'по вкусу';
    mEn = 'to taste';
  }

  // 3. Garlic clove mistranslation ('гвоздика' -> 'зубчик')
  if (lowerNameRu.includes('чеснок') || nameEn.toLowerCase().includes('garlic')) {
    mRu = mRu.replace(/(\d+)\s*(?:гвоздик[а-я]*|cloves?)/gi, (match, nStr) => {
      const n = Number.parseInt(nStr, 10);
      if (n === 1) return '1 зубчик';
      if (n >= 2 && n <= 4) return `${n} зубчика`;
      return `${n} зубчиков`;
    });
    if (/^clove$/i.test(mEn) || /^гвоздика$/i.test(mRu)) {
      mRu = '1 зубчик';
    }
  }

  // 4. Fix Pinch / Пинч
  if (/^пинч$/i.test(mRu) || /^pinch$/i.test(mEn)) {
    mRu = 'щепотка';
  } else {
    mRu = mRu.replace(/\bпинч[а-я]*\b/gi, 'щепотка');
  }

  // 5. Fix 'marble sized' / 'мраморных размера'
  if (/marble/i.test(mEn) || /мрамор/i.test(mRu)) {
    mRu = mRu.replace(/(\d+)?\s*(?:marble[- ]sized|мраморных размера)/gi, (match, n) => {
      const count = n ? `${n.trim()} ` : '';
      return `${count}шарик(а) размером с орех`;
    });
  }

  // 6. Fix 'beaten' (избит / избитых -> взбитое / взбитых)
  mRu = mRu.replace(/(\d+)?\s*(?:избит[а-я]*|beaten)/gi, (match, n) => {
    const num = n ? Number.parseInt(n.trim(), 10) : 1;
    if (num === 1) return '1 шт. (взбитое)';
    return `${num} шт. (взбитых)`;
  });

  // 7. Fix 'grated' / 'grating' / 'решетка'
  if (/^решетка$/i.test(mRu) || /^grating$/i.test(mEn)) {
    mRu = 'щепотка (тертого)';
  } else {
    mRu = mRu.replace(/\bрешетк[а-я]*\b/gi, 'тертый');
  }

  // 8. Fix 'inch' -> см
  mRu = mRu.replace(/(\d+(?:\.\d+)?)\s*(?:дюйм[а-я]*|inch(?:es)?)/gi, (match, d) => {
    const cm = Math.round(Number.parseFloat(d) * 2.5);
    return `${cm} см`;
  });

  // 9. Convert Ounces (oz) -> Grams (г)
  mRu = mRu.replace(/(\d+(?:\.\d+)?)\s*(?:унц[а-я]*|ounces?|oz\b)/gi, (match, val) => {
    const g = Math.round(Number.parseFloat(val) * 28.35);
    return `${g} г`;
  });

  // 10. Convert Pounds (lb / lbs) -> Grams (г) / Kilograms (кг)
  mRu = mRu.replace(/(\d+(?:\.\d+)?)\s*(?:фунт[а-я]*|pounds?|lbs?\b)/gi, (match, val) => {
    const num = Number.parseFloat(val);
    if (num >= 2) return `${(num * 0.453).toFixed(1)} кг`;
    return `${Math.round(num * 453.6)} г`;
  });

  // 11. Convert Spoons to standard Russian abbreviations
  mRu = mRu.replace(/(\d+(?:[./½¼¾]\d+)?)\s*(?:столов[а-я]*\s*лож[а-я]*|tbsp|tblsp|tablespoons?)/gi, '$1 ст. л.');
  mRu = mRu.replace(/(\d+(?:[./½¼¾]\d+)?)\s*(?:чайн[а-я]*\s*лож[а-я]*|tsp|teaspoons?)/gi, '$1 ч. л.');
  mRu = mRu.replace(/столов[а-я]*\s*лож[а-я]*/gi, 'ст. л.');
  mRu = mRu.replace(/чайн[а-я]*\s*лож[а-я]*/gi, 'ч. л.');

  // 12. Convert Cups to 'стак.'
  mRu = mRu.replace(/(\d+(?:[./½¼¾]\d+)?)\s*(?:чашк[а-я]*|cups?)/gi, '$1 стак.');
  mRu = mRu.replace(/чашк[а-я]*/gi, 'стак.');

  // 13. Fix culinary prep words inside measures
  mRu = mRu.replace(/^для смазки$/i, 'для смазывания');
  mRu = mRu.replace(/^для жарки$/i, 'для жарки');
  mRu = mRu.replace(/^опрыскивание$/i, 'для посыпки');
  mRu = mRu.replace(/^нарезанный$/i, 'по вкусу (нарезать)');
  mRu = mRu.replace(/^тертый$/i, 'по вкусу (натереть)');

  // Fix "Сок 1" -> "сок 1 шт."
  mRu = mRu.replace(/сок\s*(\d+)/gi, 'сок $1 шт.');

  // 14. Convert Bare Numbers to explicit units (шт., зубчик, пучок)
  if (/^\d+$/.test(mRu)) {
    const n = Number.parseInt(mRu, 10);
    if (lowerNameRu.includes('чеснок')) {
      mRu = n === 1 ? '1 зубчик' : (n >= 2 && n <= 4 ? `${n} зубчика` : `${n} зубчиков`);
    } else if (lowerNameRu.includes('лавровый')) {
      mRu = n === 1 ? '1 лавровый лист' : `${n} лавровых листа`;
    } else if (lowerNameRu.includes('зелень') || lowerNameRu.includes('петрушка') || lowerNameRu.includes('укроп') || lowerNameRu.includes('кинза')) {
      mRu = `${n} пучок`;
    } else if (
      lowerNameRu.includes('яйц') ||
      lowerNameRu.includes('булочк') ||
      lowerNameRu.includes('перец') ||
      lowerNameRu.includes('авокадо') ||
      lowerNameRu.includes('банан') ||
      lowerNameRu.includes('яблок') ||
      lowerNameRu.includes('лук') ||
      lowerNameRu.includes('морков') ||
      lowerNameRu.includes('помидор') ||
      lowerNameRu.includes('томат') ||
      lowerNameRu.includes('лимон') ||
      lowerNameRu.includes('лайм') ||
      lowerNameRu.includes('картофел') ||
      lowerNameRu.includes('грудк') ||
      lowerNameRu.includes('стейк') ||
      lowerNameRu.includes('огурец') ||
      lowerNameRu.includes('баклажан') ||
      lowerNameRu.includes('кабачок') ||
      lowerNameRu.includes('тортиль') ||
      lowerNameRu.includes('лаваш')
    ) {
      mRu = `${n} шт.`;
    }
  }

  // Handle single fractions: ½ -> ½ шт., ¼ -> ¼ шт.
  if (/^[½¼¾]$/.test(mRu)) {
    mRu = `${mRu} шт.`;
  }

  // Clean double spaces
  mRu = mRu.replace(/\s+/g, ' ').trim();

  return {
    nameRu,
    nameEn,
    measureRu: mRu,
    measureEn: mEn,
  };
}

async function main() {
  console.log('🧪 Starting Deep Cleaning & Standardization of Ingredients and Measures...\n');

  const mealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const meals = JSON.parse(await fs.readFile(mealsPath, 'utf-8'));

  let fixedGarlic = 0;
  let fixedBeaten = 0;
  let fixedPinch = 0;
  let fixedOunces = 0;
  let fixedPounds = 0;
  let fixedInches = 0;
  let fixedBareNumbers = 0;
  let fixedMisplaced = 0;
  let totalIngredientsProcessed = 0;

  const cleanedMeals = meals.map((meal) => {
    const updatedIngredients = meal.ingredients.map((item) => {
      totalIngredientsProcessed++;
      const origIngRu = item.ingredient.ru;
      const origIngEn = item.ingredient.en;
      const origMRu = item.measure.ru;
      const origMEn = item.measure.en;

      if (origIngRu.toLowerCase().includes('чеснок') && origMRu.includes('гвоздик')) fixedGarlic++;
      if (origMRu.includes('избит')) fixedBeaten++;
      if (/пинч/i.test(origMRu)) fixedPinch++;
      if (/унц|ounce/i.test(origMRu)) fixedOunces++;
      if (/фунт|pound/i.test(origMRu)) fixedPounds++;
      if (/дюйм|inch/i.test(origMRu)) fixedInches++;
      if (/^\d+$/.test(origMRu)) fixedBareNumbers++;
      if (/^рис$/i.test(origIngRu) && /^белый$/i.test(origMRu)) fixedMisplaced++;

      const cleaned = cleanIngredientAndMeasure(origIngRu, origIngEn, origMRu, origMEn);

      return {
        ...item,
        ingredient: {
          en: cleaned.nameEn,
          ru: cleaned.nameRu,
        },
        measure: {
          en: cleaned.measureEn,
          ru: cleaned.measureRu,
        },
      };
    });

    return {
      ...meal,
      ingredients: updatedIngredients,
    };
  });

  await fs.writeFile(mealsPath, JSON.stringify(cleanedMeals, null, 2), 'utf-8');

  // Also update full dump
  const fullDumpPath = path.join(DATA_DIR, 'themealdb-bilingual-full.json');
  try {
    const fullDump = JSON.parse(await fs.readFile(fullDumpPath, 'utf-8'));
    fullDump.meals = cleanedMeals;
    await fs.writeFile(fullDumpPath, JSON.stringify(fullDump, null, 2), 'utf-8');
  } catch {}

  console.log('✅ Standardization Report:');
  console.log(`   - Total ingredients scanned: ${totalIngredientsProcessed}`);
  console.log(`   - Fixed garlic cloves mistranslations ("гвоздика" -> "зубчик"): ${fixedGarlic}`);
  console.log(`   - Fixed "избит" -> "взбитое": ${fixedBeaten}`);
  console.log(`   - Fixed "пинч" -> "щепотка": ${fixedPinch}`);
  console.log(`   - Converted ounces (унции) to grams (г): ${fixedOunces}`);
  console.log(`   - Converted pounds (фунты) to grams/kg: ${fixedPounds}`);
  console.log(`   - Converted inches (дюймы) to cm (см): ${fixedInches}`);
  console.log(`   - Converted bare numbers ("1", "2") to explicit units (шт., зубчик): ${fixedBareNumbers}`);
  console.log(`   - Fixed misplaced attributes (e.g. Рис + Белый): ${fixedMisplaced}`);
  console.log(`\n📁 Updated: ${mealsPath}`);
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
