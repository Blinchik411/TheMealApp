import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

async function main() {
  const mealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const meals = JSON.parse(await fs.readFile(mealsPath, 'utf-8'));

  let fixedPoundRanges = 0;
  let fixedMashed = 0;
  let fixedSpiceDrops = 0;
  let fixedPluralDescriptors = 0;
  let fixedNames = 0;

  for (const meal of meals) {
    // Fix Corned Beef Hash title
    if (meal.id === '53096' || meal.name.en === 'Corned Beef Hash') {
      meal.name.ru = 'Жаркое из солонины с картофелем (хэш)';
      fixedNames++;
    }

    for (const ing of meal.ingredients) {
      let ruMeasure = ing.measure?.ru?.trim() || '';
      const enMeasure = ing.measure?.en?.trim() || '';
      const ruIng = ing.ingredient?.ru?.trim() || '';

      // 1. "4-2.3 кг" (from 4-5 pound) -> "2 кг"
      if (/4-2\.3\s*кг/i.test(ruMeasure) || /4-5\s*pound/i.test(enMeasure)) {
        ruMeasure = '2 кг';
        fixedPoundRanges++;
      }

      // 2. "4 пюре" -> "4 шт."
      if (/^\d+\s*пюре$/i.test(ruMeasure)) {
        const num = ruMeasure.match(/\d+/)?.[0] || '4';
        ruMeasure = `${num} шт.`;
        fixedMashed++;
      }

      // 3. Dry spices (salt, pepper) with "Пара капель" -> "щепотка"
      if (/капел/i.test(ruMeasure) && /соль|перец|тмин|паприк/i.test(ruIng)) {
        ruMeasure = 'щепотка';
        fixedSpiceDrops++;
      }

      // 4. "\d+ больших" / "\d+ маленьких" / "\d+ средних" -> "\d+ шт."
      if (/^\d+\s+(больших|маленьких|крупных|средних)$/i.test(ruMeasure)) {
        const num = ruMeasure.match(/\d+/)?.[0] || '';
        ruMeasure = `${num} шт.`;
        fixedPluralDescriptors++;
      }

      ing.measure.ru = ruMeasure;
    }
  }

  console.log('✅ Applied Fixes:');
  console.log(`   - Pound ranges (4-2.3 кг -> 2 кг): ${fixedPoundRanges}`);
  console.log(`   - Mashed (4 пюре -> 4 шт.): ${fixedMashed}`);
  console.log(`   - Salt/Pepper with drops -> щепотка: ${fixedSpiceDrops}`);
  console.log(`   - Descriptors (3 больших -> 3 шт.): ${fixedPluralDescriptors}`);
  console.log(`   - Recipe names fixed (Corned Beef Hash): ${fixedNames}`);

  await fs.writeFile(mealsPath, JSON.stringify(meals, null, 2), 'utf-8');
  console.log(`💾 Saved to ${mealsPath}`);
}

main().catch(console.error);
