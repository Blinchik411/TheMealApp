import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

async function main() {
  const mealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const meals = JSON.parse(await fs.readFile(mealsPath, 'utf-8'));

  let fixedChicken = 0;
  let fixedOther = 0;

  for (const meal of meals) {
    for (const ing of meal.ingredients) {
      let ruMeasure = ing.measure?.ru?.trim() || '';
      const enMeasure = ing.measure?.en?.trim() || '';
      const ruIng = ing.ingredient?.ru?.trim() || '';

      // 1. "Курица" + "1 целое" -> "1 целая"
      if (/курица/i.test(ruIng) && (/1\s*целое/i.test(ruMeasure) || /^1\s*whole$/i.test(enMeasure))) {
        ruMeasure = '1 целая';
        fixedChicken++;
      }

      // 2. "Мускатный орех" + "1 целое" -> "1 целый"
      if (/мускатный\s*орех/i.test(ruIng) && /1\s*целое/i.test(ruMeasure)) {
        ruMeasure = '1 целый';
        fixedOther++;
      }

      // 3. "Чеснок" + "1 целое" -> "1 головка"
      if (/чеснок/i.test(ruIng) && /1\s*целое/i.test(ruMeasure)) {
        ruMeasure = '1 головка';
        fixedOther++;
      }

      // 4. "Гвоздика" + "1 целое" -> "1 шт."
      if (/гвоздика/i.test(ruIng) && /1\s*целое/i.test(ruMeasure)) {
        ruMeasure = '1 шт.';
        fixedOther++;
      }

      // 5. "Зеленый перец" + "4 целых" -> "4 шт."
      if (/перец/i.test(ruIng) && /4\s*целых/i.test(ruMeasure)) {
        ruMeasure = '4 шт.';
        fixedOther++;
      }

      ing.measure.ru = ruMeasure;
    }
  }

  console.log(`✅ Applied fixes:`);
  console.log(`   - "Курица : 1 целое" -> "1 целая": ${fixedChicken}`);
  console.log(`   - Other whole fixes (головка, целый, шт.): ${fixedOther}`);

  await fs.writeFile(mealsPath, JSON.stringify(meals, null, 2), 'utf-8');
  console.log(`💾 Saved to ${mealsPath}`);
}

main().catch(console.error);
