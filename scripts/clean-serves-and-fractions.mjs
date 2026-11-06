import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

async function main() {
  const mealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const meals = JSON.parse(await fs.readFile(mealsPath, 'utf-8'));

  let fixedServes = 0;
  let fixedFractions = 0;

  for (const meal of meals) {
    // 1. Remove Serves / Обслуживает from instructions
    for (const lang of ['ru', 'en']) {
      if (!meal.instructions || !meal.instructions[lang]) continue;
      const lines = meal.instructions[lang].split(/\r?\n/);
      const filtered = lines.filter((l) => !/^\s*(serves|обслуживает|порции|порций)\s*\d+.*$/i.test(l.trim()));
      if (filtered.length !== lines.length) {
        meal.instructions[lang] = filtered.join('\n').replace(/\n{3,}/g, '\n\n').trim();
        fixedServes++;
      }
    }

    // 2. Fix squished fractions in ingredients
    for (const ing of meal.ingredients) {
      let ruMeasure = ing.measure?.ru?.trim() || '';
      if (/\b11\/2\b/.test(ruMeasure)) {
        ruMeasure = ruMeasure.replace(/\b11\/2\b/g, '1 1/2');
        fixedFractions++;
      }
      if (/\b21\/2\b/.test(ruMeasure)) {
        ruMeasure = ruMeasure.replace(/\b21\/2\b/g, '2 1/2');
        fixedFractions++;
      }
      if (/\b11\/4\b/.test(ruMeasure)) {
        ruMeasure = ruMeasure.replace(/\b11\/4\b/g, '1 1/4');
        fixedFractions++;
      }
      ing.measure.ru = ruMeasure;
    }
  }

  console.log('✅ Applied:');
  console.log(`   - Serves/Обслуживает removed from instructions: ${fixedServes}`);
  console.log(`   - Squished fractions fixed (11/2 -> 1 1/2): ${fixedFractions}`);

  await fs.writeFile(mealsPath, JSON.stringify(meals, null, 2), 'utf-8');
  console.log(`💾 Saved to ${mealsPath}`);
}

main().catch(console.error);
