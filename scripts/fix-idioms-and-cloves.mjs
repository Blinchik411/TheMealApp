import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

async function main() {
  const mealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const meals = JSON.parse(await fs.readFile(mealsPath, 'utf-8'));

  let fixedKnob = 0;
  let fixedDash = 0;
  let fixedSplash = 0;
  let fixedDrizzle = 0;
  let fixedCloves = 0;
  let fixedMisc = 0;

  for (const meal of meals) {
    for (const ing of meal.ingredients) {
      const enMeasure = ing.measure?.en?.trim() || '';
      let ruMeasure = ing.measure?.ru?.trim() || '';
      const enIng = ing.ingredient?.en?.toLowerCase() || '';
      const ruIng = ing.ingredient?.ru?.toLowerCase() || '';

      // 1. Knob -> Кусочек
      if (/^ручка$/i.test(ruMeasure) || /^1\s*ручка$/i.test(ruMeasure) || /^knob$/i.test(enMeasure) || /^1\s*knob$/i.test(enMeasure)) {
        if (/^1\s*ручка$/i.test(ruMeasure) || /^1\s*knob$/i.test(enMeasure)) {
          ruMeasure = '1 кусочек';
        } else {
          ruMeasure = 'Кусочек';
        }
        fixedKnob++;
      }

      // 2. Dash -> Капля / Пара капель
      if (/^дэш$/i.test(ruMeasure) || /^деш$/i.test(ruMeasure) || /^1\s*тире$/i.test(ruMeasure) || /^dash$/i.test(enMeasure) || /^1\s*dash$/i.test(enMeasure)) {
        if (/^1\s*тире$/i.test(ruMeasure) || /^1\s*dash$/i.test(enMeasure)) {
          ruMeasure = '1 капля';
        } else {
          ruMeasure = 'Пара капель';
        }
        fixedDash++;
      }

      // 3. Splash -> Всплеск (немного)
      if (/^всплеск$/i.test(ruMeasure) || /^splash$/i.test(enMeasure)) {
        ruMeasure = 'Всплеск (немного)';
        fixedSplash++;
      }

      // 4. Drizzle -> Сбрызнуть (немного)
      if (/морось/i.test(ruMeasure) || /дождь/i.test(ruMeasure) || /drizzle/i.test(enMeasure)) {
        if (/for cooking/i.test(enMeasure) || /приготовления пищи/i.test(ruMeasure)) {
          ruMeasure = 'Немного (для жарки)';
        } else {
          ruMeasure = 'Сбрызнуть (немного)';
        }
        fixedDrizzle++;
      }

      // 5. Garlic cloves mistranslated as "гвоздика"
      const isGarlic = enIng.includes('garlic') || ruIng.includes('чеснок');
      if (isGarlic && /гвоздик/i.test(ruMeasure)) {
        // e.g. "1 мелко нарезанная гвоздика" -> "1 мелко нарезанный зубчик"
        ruMeasure = ruMeasure
          .replace(/мелко нарезанная гвоздика/gi, 'мелко нарезанный зубчик')
          .replace(/очищенная гвоздика, нарезанная ломтиками/gi, 'очищенный зубчик, нарезанный ломтиками')
          .replace(/нарезанная гвоздика/gi, 'нарезанный зубчик')
          .replace(/измельченная гвоздика/gi, 'измельченный зубчик')
          .replace(/гвоздика/gi, 'зубчик')
          .replace(/измельченных гвоздики/gi, 'измельченных зубчика')
          .replace(/нарезанных гвоздики/gi, 'нарезанных зубчика')
          .replace(/гвоздики/gi, 'зубчика')
          .replace(/нарезанных гвоздик/gi, 'нарезанных зубчиков')
          .replace(/измельченных гвоздик/gi, 'измельченных зубчиков')
          .replace(/гвоздик/gi, 'зубчиков');
        fixedCloves++;
      }

      // 6. Misc awkward translations
      if (/кусок 3 шт\. см/i.test(ruMeasure)) {
        ruMeasure = 'кусочек 3 см';
        fixedMisc++;
      }
      if (/½\s*дюйма/i.test(ruMeasure) || /1\/2\s*дюйма/i.test(ruMeasure)) {
        ruMeasure = ruMeasure.replace(/½\s*дюйма|1\/2\s*дюйма/gi, '1.5 см');
        fixedMisc++;
      }
      if (/дюйма/i.test(ruMeasure)) {
        ruMeasure = ruMeasure.replace(/дюйма/gi, 'см');
        fixedMisc++;
      }
      if (/два мраморных размера/i.test(ruMeasure) || /размером с два мрамора/i.test(ruMeasure)) {
        ruMeasure = 'размером с грецкий орех';
        fixedMisc++;
      }

      ing.measure.ru = ruMeasure;
    }
  }

  console.log(`✅ Fixed:`);
  console.log(`   - Knob (ручка -> кусочек): ${fixedKnob}`);
  console.log(`   - Dash (дэш/тире -> капля): ${fixedDash}`);
  console.log(`   - Splash (всплеск -> всплеск немного): ${fixedSplash}`);
  console.log(`   - Drizzle (морось/дождь -> сбрызнуть): ${fixedDrizzle}`);
  console.log(`   - Garlic cloves (гвоздика -> зубчик): ${fixedCloves}`);
  console.log(`   - Misc (дюймы, куски 3 см, и т.д.): ${fixedMisc}`);

  await fs.writeFile(mealsPath, JSON.stringify(meals, null, 2), 'utf-8');
  console.log(`\n💾 Saved changes to ${mealsPath}`);
}

main().catch(console.error);
