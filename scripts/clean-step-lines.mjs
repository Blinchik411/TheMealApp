import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

async function main() {
  const mealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const meals = JSON.parse(await fs.readFile(mealsPath, 'utf-8'));

  let cleanedMeals = 0;
  const stepLineRegex = /^\s*(шаг|step|этап)\s*\d+[:.]?\s*$/i;

  for (const m of meals) {
    let changed = false;
    for (const lang of ['ru', 'en']) {
      if (!m.instructions || !m.instructions[lang]) continue;
      const lines = m.instructions[lang].split(/\r?\n/);
      const filtered = lines.filter((l) => !stepLineRegex.test(l.trim()));
      if (filtered.length !== lines.length) {
        m.instructions[lang] = filtered.join('\n').replace(/\n{3,}/g, '\n\n').trim();
        changed = true;
      }
    }
    if (changed) cleanedMeals++;
  }

  console.log(`✅ Cleaned standalone step lines in ${cleanedMeals} meals.`);
  await fs.writeFile(mealsPath, JSON.stringify(meals, null, 2), 'utf-8');
  console.log(`💾 Saved updated meals to ${mealsPath}`);
}

main().catch(console.error);
