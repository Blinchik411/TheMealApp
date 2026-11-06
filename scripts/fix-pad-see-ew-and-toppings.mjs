import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

async function main() {
  const mealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const meals = JSON.parse(await fs.readFile(mealsPath, 'utf-8'));

  let fixedTitles = 0;
  let fixedBasil = 0;
  let fixedPots = 0;
  let fixedToppings = 0;
  let fixedPadIngredients = 0;

  for (const meal of meals) {
    // 1. Untranslated title "Pad See Ew"
    if (meal.name.en === 'Pad See Ew' || meal.id === '52774') {
      meal.name.ru = 'Пад Си Ю (тайская жареная лапша)';
      fixedTitles++;
    }

    for (const ing of meal.ingredients) {
      let ruIng = ing.ingredient?.ru?.trim() || '';
      const enIng = ing.ingredient?.en?.trim() || '';
      let ruMeasure = ing.measure?.ru?.trim() || '';
      const enMeasure = ing.measure?.en?.trim() || '';

      // 2. Fix "Василий" -> "Базилик"
      if (ruIng === 'Василий' || enIng.toLowerCase() === 'basil') {
        ruIng = 'Базилик';
        ing.ingredient.ru = ruIng;
        fixedBasil++;
      }

      // 3. Fix "Pad See Ew" chicken & broccoli cups to grams
      if (meal.id === '52774' || meal.name.en === 'Pad See Ew') {
        if (/курица/i.test(ruIng) && /стак/i.test(ruMeasure)) {
          ruMeasure = '200 г';
          fixedPadIngredients++;
        }
        if (/брокколи/i.test(ruIng) && /стак/i.test(ruMeasure)) {
          ruMeasure = '200 г (1 пучок)';
          fixedPadIngredients++;
        }
      }

      // Also general pork in hot and sour soup
      if (meal.name.ru.includes('Горячий и кислый суп') && /свинина/i.test(ruIng) && /стак/i.test(ruMeasure)) {
        ruMeasure = '100 г';
      }

      // 4. Fix "1 горшок" (1 pot) of sour cream / creme fraiche -> "1 баночка (200 г)"
      if (/горшок/i.test(ruMeasure)) {
        if (/сметан|крем|фреш/i.test(ruIng)) {
          ruMeasure = '1 баночка (200 г)';
          fixedPots++;
        } else if (/вода/i.test(ruIng)) {
          ruMeasure = '1 кастрюля';
          fixedPots++;
        }
      }

      // 5. Fix "Топпинг" -> appropriate culinary measure
      if (/топпинг/i.test(ruMeasure) || /^topping$/i.test(enMeasure)) {
        if (/шпинат/i.test(ruIng)) {
          ruMeasure = '100 г (для гарнира)';
          fixedToppings++;
        } else if (/горох/i.test(ruIng)) {
          ruMeasure = '100 г (для гарнира)';
          fixedToppings++;
        } else if (/пармезан|сыр|кунжут|сахар/i.test(ruIng)) {
          ruMeasure = '50 г (для посыпки)';
          fixedToppings++;
        } else if (/петрушк|базилик|манго/i.test(ruIng)) {
          ruMeasure = 'для украшения';
          fixedToppings++;
        } else if (/соус/i.test(ruIng)) {
          ruMeasure = 'по вкусу (для подачи)';
          fixedToppings++;
        } else {
          ruMeasure = 'по вкусу';
          fixedToppings++;
        }
      }

      ing.measure.ru = ruMeasure;
    }
  }

  console.log('✅ Changes Applied:');
  console.log(`   - Title translated (Pad See Ew -> Пад Си Ю): ${fixedTitles}`);
  console.log(`   - Basil mistranslation fixed (Василий -> Базилик): ${fixedBasil}`);
  console.log(`   - Pad See Ew chicken & broccoli converted to grams: ${fixedPadIngredients}`);
  console.log(`   - "1 горшок" fixed (баночка 200 г): ${fixedPots}`);
  console.log(`   - "Топпинг" converted to culinary measures (шпинат, горох, сыр): ${fixedToppings}`);

  await fs.writeFile(mealsPath, JSON.stringify(meals, null, 2), 'utf-8');
  console.log(`💾 Saved to ${mealsPath}`);
}

main().catch(console.error);
