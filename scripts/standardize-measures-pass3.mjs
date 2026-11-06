import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

async function main() {
  const mealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const meals = JSON.parse(await fs.readFile(mealsPath, 'utf-8'));

  let fixedSplash = 0;
  let fixedBayLeaf = 0;
  let fixedSparkling = 0;
  let fixedHot = 0;
  let fixedHead = 0;
  let fixedCups = 0;
  let fixedSpaces = 0;
  let fixedCelery = 0;

  for (const meal of meals) {
    for (const ing of meal.ingredients) {
      let ruMeasure = ing.measure?.ru?.trim() || '';
      const enMeasure = ing.measure?.en?.trim() || '';
      const ruIng = ing.ingredient?.ru?.trim() || '';
      const enIng = ing.ingredient?.en?.trim() || '';

      // 1. Splash / Всплеск (немного) -> 1 ст. л.
      if (/всплеск/i.test(ruMeasure) || /^splash$/i.test(enMeasure)) {
        ruMeasure = '1 ст. л.';
        fixedSplash++;
      }

      // 2. Bay Leaf: "2 лавровых листа" / "1 лавровый лист" / "2 листа" -> "2 шт." / "1 шт."
      if (/лавров/i.test(ruIng) || /bay leaf/i.test(enIng)) {
        if (/^\d+\s*(лавровых\s*листа|лавровый\s*лист|листа|листов|лист)/i.test(ruMeasure)) {
          ruMeasure = ruMeasure.replace(/\s*(лавровых\s*листа|лавровый\s*лист|листа|листов|лист)/gi, ' шт.');
          fixedBayLeaf++;
        }
      }

      // 3. Sparkling / Сверкающий (от spinkling / sprinkling)
      if (/сверкающ/i.test(ruMeasure) || /spinkling/i.test(enMeasure)) {
        if (/ваниль|экстракт/i.test(ruIng)) {
          ruMeasure = 'Несколько капель';
        } else if (/соль|перец|мука/i.test(ruIng)) {
          ruMeasure = 'Щепотка';
        } else {
          ruMeasure = 'Для посыпки';
        }
        fixedSparkling++;
      }

      // 4. "горячего" в бульонах: "1 литр горячего" -> "1 л"
      if (/горячего/i.test(ruMeasure)) {
        ruMeasure = ruMeasure.replace(/\s*горячего/gi, '');
        if (/литр/i.test(ruMeasure)) {
          ruMeasure = ruMeasure.replace(/литр[а-я]*/gi, 'л');
        }
        ruMeasure = ruMeasure.trim();
        fixedHot++;
      }

      // 5. "голова" / "головы" -> "1 шт." / "2 шт."
      if (/голов/i.test(ruMeasure)) {
        // e.g. "1 нарезанная голова" -> "1 шт."
        // "1 голова" -> "1 шт."
        // "2 головы" -> "2 шт."
        ruMeasure = ruMeasure
          .replace(/(\d+)\s*(нарезанная\s*голова|нарезанных\s*головы|голова|головы|голов)/gi, '$1 шт.')
          .replace(/нарезанная голова/gi, '1 шт.');
        fixedHead++;
      }

      // 6. Celery bare 1 -> "1 стебель"
      if ((/сельдерей/i.test(ruIng) || /celery/i.test(enIng)) && ruMeasure === '1') {
        ruMeasure = '1 стебель';
        fixedCelery++;
      }

      // 7. Standardize cups: unify unicode fractions, replace "стакана" -> "стак."
      if (/стакан/i.test(ruMeasure)) {
        ruMeasure = ruMeasure
          .replace(/½/g, '1/2')
          .replace(/¼/g, '1/4')
          .replace(/¾/g, '3/4')
          .replace(/⅓/g, '1/3')
          .replace(/⅔/g, '2/3')
          .replace(/\s*стакана|\s*стаканов|\s*стакан/gi, ' стак.')
          .replace(/\s+/g, ' ')
          .trim();
        fixedCups++;
      }

      // Also clean standalone unicode fractions like "½ стак."
      if (/[½¼¾⅓⅔]/.test(ruMeasure)) {
        ruMeasure = ruMeasure
          .replace(/½/g, '1/2')
          .replace(/¼/g, '1/4')
          .replace(/¾/g, '3/4')
          .replace(/⅓/g, '1/3')
          .replace(/⅔/g, '2/3');
      }

      // 8. Format descriptors without units: "1 мелко нарезанный" -> "1 шт. (мелко нарезанный)"
      if (/^\d+\s+(мелко\s+нарезан|крупно\s+нарезан|тонко\s+нарезан|нарезан|средн|рублен|измельчен|очищен|крупн|небольш)/i.test(ruMeasure) && !/шт|г|мл|ст\.|ч\.|зубч/i.test(ruMeasure)) {
        ruMeasure = ruMeasure.replace(/^(\d+)\s+(.+)$/, '$1 шт. ($2)');
      }

      // 9. Add space between digits and units: "140г" -> "140 г", "150мл" -> "150 мл", "1кг" -> "1 кг"
      const beforeSpace = ruMeasure;
      ruMeasure = ruMeasure
        .replace(/(\d+)\s*(г|мл|кг|л)(?![а-яa-z])/gi, '$1 $2')
        .replace(/литр\b/gi, 'л')
        .replace(/\s+/g, ' ')
        .trim();
      if (beforeSpace !== ruMeasure) {
        fixedSpaces++;
      }

      ing.measure.ru = ruMeasure;
    }
  }

  console.log('✅ Changes applied:');
  console.log(`   - Splash -> 1 ст. л.: ${fixedSplash}`);
  console.log(`   - Bay leaf duplication removed: ${fixedBayLeaf}`);
  console.log(`   - Sparkling (сверкающий) fixed: ${fixedSparkling}`);
  console.log(`   - Hot (горячего) removed: ${fixedHot}`);
  console.log(`   - Head (голова/нарезанная голова -> шт.): ${fixedHead}`);
  console.log(`   - Celery bare 1 -> 1 стебель: ${fixedCelery}`);
  console.log(`   - Standardized cups (стак.): ${fixedCups}`);
  console.log(`   - Standardized unit spaces (140г -> 140 г): ${fixedSpaces}`);

  await fs.writeFile(mealsPath, JSON.stringify(meals, null, 2), 'utf-8');
  console.log(`\n💾 Saved updated data to ${mealsPath}`);
}

main().catch(console.error);
