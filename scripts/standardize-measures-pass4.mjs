import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

async function main() {
  const mealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const meals = JSON.parse(await fs.readFile(mealsPath, 'utf-8'));

  let fixedSlashes = 0;
  let fixedFractions = 0;
  let fixedFreeRange = 0;
  let fixedGlaze = 0;
  let fixedZest = 0;
  let fixedBareNumbers = 0;
  let fixedSpacing = 0;
  let fixedIngredients = 0;

  for (const meal of meals) {
    for (const ing of meal.ingredients) {
      let ruMeasure = ing.measure?.ru?.trim() || '';
      const enMeasure = ing.measure?.en?.trim() || '';
      let ruIng = ing.ingredient?.ru?.trim() || '';
      const enIng = ing.ingredient?.en?.trim() || '';

      // Fix mistranslated ingredients:
      // "Оранжевый" -> "Апельсин" (fruit Orange)
      if (enIng.toLowerCase() === 'orange' && ruIng === 'Оранжевый') {
        ruIng = 'Апельсин';
        ing.ingredient.ru = ruIng;
        fixedIngredients++;
      }
      // "Султанши" -> "Светлый изюм (кишмиш)"
      if (ruIng === 'Султанши' || enIng.toLowerCase() === 'sultanas') {
        ruIng = 'Светлый изюм (кишмиш)';
        ing.ingredient.ru = ruIng;
        fixedIngredients++;
      }
      // "Двойной крем" -> "Жирные сливки"
      if (ruIng === 'Двойной крем' || enIng.toLowerCase() === 'double cream') {
        ruIng = 'Жирные сливки';
        ing.ingredient.ru = ruIng;
        fixedIngredients++;
      }

      // 1. Dual slash measures: "25 г/28 г" -> "25 г", "350 мл/12 фл." -> "350 мл", "50 мл/2 жидких унции" -> "50 мл"
      // Match pattern like: "25 г/28 г", "175 г/170 г", "350 мл/12 фл.", "50 мл/2 жидких унции", "75 г/21/2 унции"
      if (/^\s*(\d+)\s*(г|мл)\s*\/\s*.+$/i.test(ruMeasure)) {
        ruMeasure = ruMeasure.replace(/^\s*(\d+)\s*(г|мл)\s*\/\s*.+$/i, '$1 $2');
        fixedSlashes++;
      } else if (/^\s*(\d+)\s*(г|мл)\s*\/\s*(\d+)\s*(г|мл)\s*$/i.test(ruMeasure)) {
        // e.g. "170 г/180 г" -> keep first or second
        const m = ruMeasure.match(/^\s*(\d+)\s*(г|мл)\s*\/\s*(\d+)\s*(г|мл)\s*$/i);
        if (m) {
          ruMeasure = `${m[1]} ${m[2]}`;
          fixedSlashes++;
        }
      } else if (/^\s*650\s*г\s*\/\s*454\s*г\s*227\s*г$/i.test(ruMeasure)) {
        ruMeasure = '650 г';
        fixedSlashes++;
      }

      // 2. Bad fraction conversions of pounds/ounces:
      // "1/0.9 кг" (from 1/2 lb) -> 225 г
      if (/1\/0\.9\s*кг/i.test(ruMeasure)) {
        ruMeasure = '225 г';
        fixedFractions++;
      }
      // "1/1.8 кг" (from 1/4 lb) -> 115 г
      if (/1\/1\.8\s*кг/i.test(ruMeasure)) {
        ruMeasure = '115 г';
        fixedFractions++;
      }
      // "1/113 г" (from 1/4 oz) -> 7 г
      if (/1\/113\s*г/i.test(ruMeasure)) {
        ruMeasure = '7 г';
        fixedFractions++;
      }
      // "1 1/113 г" (from 1 1/4 oz) -> 35 г
      if (/1\s+1\/113\s*г/i.test(ruMeasure)) {
        ruMeasure = '35 г';
        fixedFractions++;
      }

      // 3. "свободного выгула" in measure: "2 свободного выгула" -> "2 шт."
      if (/свободного\s*выгула/i.test(ruMeasure)) {
        ruMeasure = ruMeasure.replace(/\s*свободного\s*выгула/gi, ' шт.').trim();
        if (/^\d+$/.test(ruMeasure)) ruMeasure += ' шт.';
        fixedFreeRange++;
      }

      // 4. "Глазурь" in measure (from "To Glaze") -> replace with standard decorative gram/unit measure
      if (/^глазурь$/i.test(ruMeasure) || /^to glaze$/i.test(enMeasure)) {
        if (/яйц/i.test(ruIng)) {
          ruMeasure = '1 шт. (для смазывания)';
        } else if (/сахар/i.test(ruIng)) {
          ruMeasure = '30 г (для посыпки)';
        } else if (/мук/i.test(ruIng)) {
          ruMeasure = '30 г (для панировки)';
        } else if (/молок/i.test(ruIng)) {
          ruMeasure = '30 мл (для смазывания)';
        } else {
          ruMeasure = 'по вкусу (для глазури)';
        }
        fixedGlaze++;
      }

      // 5. "Изюминка" in measure (from "Zest of ...") -> replace with "цедра" / grams
      if (/изюминк/i.test(ruMeasure) || /^zest/i.test(enMeasure)) {
        const numMatch = ruMeasure.match(/\d+/) || enMeasure.match(/\d+/);
        const count = numMatch ? parseInt(numMatch[0], 10) : 1;
        ruMeasure = `цедра ${count} шт. (${count * 5} г)`;
        fixedZest++;
      }

      // Also "Сок/цедра одного" -> "сок и цедра 1 шт."
      if (/сок\/цедра одного/i.test(ruMeasure)) {
        ruMeasure = 'сок и цедра 1 шт.';
        fixedZest++;
      }

      // 6. Bare numbers: "8" (oysters), "3" (shallots), "12", etc. -> add "шт."
      if (/^\d+$/.test(ruMeasure)) {
        ruMeasure = `${ruMeasure} шт.`;
        fixedBareNumbers++;
      }

      // 7. Spacing in "1 ст.л." -> "1 ст. л.", "2 ч.л." -> "2 ч. л."
      if (/(\d+)\s*ст\.л\./i.test(ruMeasure)) {
        ruMeasure = ruMeasure.replace(/(\d+)\s*ст\.л\./gi, '$1 ст. л.');
        fixedSpacing++;
      }
      if (/(\d+)\s*ч\.л\./i.test(ruMeasure)) {
        ruMeasure = ruMeasure.replace(/(\d+)\s*ч\.л\./gi, '$1 ч. л.');
        fixedSpacing++;
      }

      ing.measure.ru = ruMeasure;
    }
  }

  console.log('✅ Pass 4 Applied:');
  console.log(`   - Dual slash measures cleaned (25 г/28 г -> 25 г): ${fixedSlashes}`);
  console.log(`   - Bad fraction conversions fixed (1/0.9 кг -> 225 г): ${fixedFractions}`);
  console.log(`   - Free-range (свободного выгула -> шт.): ${fixedFreeRange}`);
  console.log(`   - Glaze (глазурь -> 1 шт./30 г): ${fixedGlaze}`);
  console.log(`   - Zest (изюминка -> цедра N шт.): ${fixedZest}`);
  console.log(`   - Bare numbers got "шт." (устрицы: 8 шт., шалот: 3 шт.): ${fixedBareNumbers}`);
  console.log(`   - Spacing fixed (1 ст.л. -> 1 ст. л.): ${fixedSpacing}`);
  console.log(`   - Ingredients renamed (Апельсин, Сливки, Изюм): ${fixedIngredients}`);

  await fs.writeFile(mealsPath, JSON.stringify(meals, null, 2), 'utf-8');
  console.log(`\n💾 Saved to ${mealsPath}`);
}

main().catch(console.error);
