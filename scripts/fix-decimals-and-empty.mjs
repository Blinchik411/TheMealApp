import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

async function main() {
  const mealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const meals = JSON.parse(await fs.readFile(mealsPath, 'utf-8'));

  for (const meal of meals) {
    for (const ing of meal.ingredients) {
      const ruIng = ing.ingredient?.ru?.trim() || '';
      let ruMeasure = ing.measure?.ru?.trim() || '';

      // 1. Bread omelette salt
      if (meal.name.ru.includes('Хлебный омлет') && ruIng === 'Соль') {
        ruMeasure = '1/2 ч. л.';
      }

      // 2. Escovitch fish peppers
      if (meal.name.ru.includes('Эскович Рыба') && /перец/i.test(ruIng) && (ruMeasure === '0,5' || ruMeasure === '0.5')) {
        ruMeasure = '1/2 шт.';
      }

      // 3. Nutty chicken curry ginger
      if (meal.name.ru.includes('Ореховый куриный карри') && ruIng === 'Имбирь') {
        ruMeasure = 'кусочек 2 см';
      }

      // 4. Yaki udon cabbage
      if (meal.name.ru.includes('Яки Удон') && ruIng === 'Капуста') {
        ruMeasure = '1/4 шт.';
      }

      // 5. If measure is empty string, default to "по вкусу"
      if (!ruMeasure || ruMeasure === 'To taste') {
        ruMeasure = 'по вкусу';
      }

      ing.measure.ru = ruMeasure;
    }
  }

  await fs.writeFile(mealsPath, JSON.stringify(meals, null, 2), 'utf-8');
  console.log('✅ Cleaned decimals and empty measures in meals-bilingual.json');
}

main().catch(console.error);
