import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

async function main() {
  const mealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const meals = JSON.parse(await fs.readFile(mealsPath, 'utf-8'));

  let fixedSprigs = 0;
  let fixedFlorets = 0;

  for (const meal of meals) {
    for (const ing of meal.ingredients) {
      let ruMeasure = ing.measure?.ru?.trim() || '';
      const enMeasure = ing.measure?.en?.trim() || '';

      // 1. "веточки свежих" -> "веточки" (since sprigs is plural >= 2)
      if (/^веточки\s+свежих$/i.test(ruMeasure) || /^sprigs\s+of\s+fresh$/i.test(enMeasure)) {
        ruMeasure = 'веточки';
        fixedSprigs++;
      } else if (/^веточк(а|у)\s+свеж(ей|ую)$/i.test(ruMeasure) || /^sprig\s+of\s+fresh$/i.test(enMeasure)) {
        ruMeasure = '1 веточка';
        fixedSprigs++;
      } else if (/веточки\s+свежих/i.test(ruMeasure)) {
        ruMeasure = ruMeasure.replace(/веточки\s+свежих/gi, 'веточки').trim();
        fixedSprigs++;
      }

      // If measure was "1 fresh sprig" -> "1 веточка"
      if (/^1\s*свежая\s*веточка$/i.test(ruMeasure)) {
        ruMeasure = '1 веточка';
      }

      // 2. "12 цветочков" -> "12 соцветий" (broccoli florets)
      if (/12\s*цветочков/i.test(ruMeasure) || /florets/i.test(enMeasure)) {
        ruMeasure = ruMeasure.replace(/цветочков/gi, 'соцветий');
        fixedFlorets++;
      }

      ing.measure.ru = ruMeasure;
    }
  }

  console.log(`✅ Applied sprig fixes:`);
  console.log(`   - "веточки свежих" -> "веточки": ${fixedSprigs}`);
  console.log(`   - "цветочков" -> "соцветий": ${fixedFlorets}`);

  await fs.writeFile(mealsPath, JSON.stringify(meals, null, 2), 'utf-8');
  console.log(`💾 Saved to ${mealsPath}`);
}

main().catch(console.error);
