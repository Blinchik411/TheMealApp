import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

async function main() {
  const mealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const meals = JSON.parse(await fs.readFile(mealsPath, 'utf-8'));

  let fixedServe = 0;
  let fixedOliveOil = 0;
  let fixedMint = 0;
  let fixedSage = 0;
  let fixedRocket = 0;

  for (const meal of meals) {
    for (const ing of meal.ingredients) {
      let ruIng = ing.ingredient?.ru?.trim() || '';
      const enIng = ing.ingredient?.en?.trim() || '';
      let ruMeasure = ing.measure?.ru?.trim() || '';
      const enMeasure = ing.measure?.en?.trim() || '';

      // 1. "служить" -> "для подачи"
      if (/^служить$/i.test(ruMeasure) || /^to serve$/i.test(enMeasure)) {
        ruMeasure = 'для подачи';
        fixedServe++;
      } else if (/служить/i.test(ruMeasure)) {
        ruMeasure = ruMeasure.replace(/служить/gi, 'для подачи').trim();
        fixedServe++;
      }

      // 2. "Оливковое масло экстра вирджин" -> "Оливковое масло"
      if (/оливковое\s*масло\s*экстра\s*вирджин/i.test(ruIng) || /extra\s*virgin\s*olive\s*oil/i.test(enIng)) {
        ruIng = 'Оливковое масло';
        ing.ingredient.ru = ruIng;
        fixedOliveOil++;
      }

      // 3. "Мятный" -> "Мята"
      if (/^мятный$/i.test(ruIng) || enIng.toLowerCase() === 'mint') {
        ruIng = 'Мята';
        ing.ingredient.ru = ruIng;
        fixedMint++;
      }
      // If measure was "1 лист" for mint -> "1 листик"
      if (ruIng === 'Мята' && ruMeasure === '1 лист') {
        ruMeasure = '1 листик';
      }

      // 4. "Мудрец" -> "Шалфей" (Sage)
      if (ruIng === 'Мудрец' || enIng.toLowerCase() === 'sage') {
        ruIng = 'Шалфей';
        ing.ingredient.ru = ruIng;
        fixedSage++;
      }

      // 5. "Ракета" -> "Руккола" (Rocket)
      if (ruIng === 'Ракета' || enIng.toLowerCase() === 'rocket') {
        ruIng = 'Руккола';
        ing.ingredient.ru = ruIng;
        fixedRocket++;
      }

      ing.measure.ru = ruMeasure;
    }
  }

  console.log('✅ Pass 5 Applied:');
  console.log(`   - "Служить" -> "для подачи": ${fixedServe}`);
  console.log(`   - "Оливковое масло экстра вирджин" -> "Оливковое масло": ${fixedOliveOil}`);
  console.log(`   - "Мятный" -> "Мята": ${fixedMint}`);
  console.log(`   - "Мудрец" -> "Шалфей": ${fixedSage}`);
  console.log(`   - "Ракета" -> "Руккола": ${fixedRocket}`);

  await fs.writeFile(mealsPath, JSON.stringify(meals, null, 2), 'utf-8');
  console.log(`\n💾 Saved to ${mealsPath}`);
}

main().catch(console.error);
