import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

function cleanStepText(text) {
  if (!text) return '';
  return text
    .replace(/^(?:step|шаг|этап)\s*\d+[:.\s\-]*/i, '')
    .replace(/^\d+[:.\)\-\s]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTimerMinutes(text) {
  if (!text) return null;
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(\d+(?:\.\d+)?)?\s*(mins?|minutes?|hours?|hrs?)\b/i);
  if (!match) return null;
  const val1 = Number.parseFloat(match[1]);
  const val2 = match[2] ? Number.parseFloat(match[2]) : val1;
  const avg = (val1 + val2) / 2;
  const unit = match[3].toLowerCase();
  const mins = unit.startsWith('h') ? Math.round(avg * 60) : Math.round(avg);
  return mins > 0 && mins <= 360 ? mins : null;
}

function parseStepsFromText(text, isRussian = false) {
  if (!text) return [];
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // 1. Explicit STEP / ШАГ headers
  const stepHeaderRegex = isRussian
    ? /(?:^|\n+)\s*(?:шаг|этап|step)\s*\d+[:.\)\-\s]*/i
    : /(?:^|\n+)\s*(?:step)\s*\d+[:.\)\-\s]*/i;

  if (stepHeaderRegex.test(normalized)) {
    const rawParts = normalized.split(stepHeaderRegex);
    const parts = rawParts.map((s) => cleanStepText(s)).filter((s) => s.length > 3);
    if (parts.length > 0) return parts;
  }

  // 2. Numbered lists (1. or 1) or 1 -)
  const numRegex = /(?:^|\n+)\s*\d+[:.\)\-]\s+/;
  if (numRegex.test(normalized)) {
    const rawParts = normalized.split(numRegex);
    const parts = rawParts.map((s) => cleanStepText(s)).filter((s) => s.length > 3);
    if (parts.length > 0) return parts;
  }

  // 3. Double newlines (paragraphs)
  if (normalized.includes('\n\n')) {
    const parts = normalized.split(/\n{2,}/).map((s) => cleanStepText(s)).filter((s) => s.length > 3);
    if (parts.length > 0) return parts;
  }

  // 4. Single newlines
  if (normalized.includes('\n')) {
    const parts = normalized.split(/\n+/).map((s) => cleanStepText(s)).filter((s) => s.length > 3);
    if (parts.length > 0) return parts;
  }

  // 5. Sentences (lookbehind for sentence boundary)
  const sentences = normalized.split(/(?<=[.!?])\s+/).map((s) => cleanStepText(s)).filter((s) => s.length > 3);
  if (sentences.length > 0) return sentences;

  return [cleanStepText(normalized)];
}

function alignSteps(enSteps, ruSteps) {
  if (enSteps.length === ruSteps.length) {
    return { en: enSteps, ru: ruSteps };
  }

  let targetLen = Math.min(enSteps.length, ruSteps.length);
  if (targetLen === 0) {
    targetLen = Math.max(enSteps.length, ruSteps.length);
  }

  function compressToLength(arr, target) {
    if (arr.length <= target) return arr;
    const res = [...arr];
    while (res.length > target) {
      let minLen = Number.POSITIVE_INFINITY;
      let minIdx = 0;
      for (let i = 0; i < res.length - 1; i++) {
        const combinedLen = res[i].length + res[i + 1].length;
        if (combinedLen < minLen) {
          minLen = combinedLen;
          minIdx = i;
        }
      }
      res[minIdx] = `${res[minIdx]} ${res[minIdx + 1]}`;
      res.splice(minIdx + 1, 1);
    }
    return res;
  }

  return {
    en: compressToLength(enSteps, targetLen),
    ru: compressToLength(ruSteps, targetLen),
  };
}

async function main() {
  console.log('🔪 Starting Recipe Steps Parser (Structured Cooking Steps)...\n');

  const mealsPath = path.join(DATA_DIR, 'meals-bilingual.json');
  const meals = JSON.parse(await fs.readFile(mealsPath, 'utf-8'));

  let totalStepsCount = 0;
  let totalTimersCount = 0;

  const updatedMeals = meals.map((meal) => {
    const rawEn = parseStepsFromText(meal.instructions.en, false);
    const rawRu = parseStepsFromText(meal.instructions.ru, true);
    const { en, ru } = alignSteps(rawEn, rawRu);

    const steps = en.map((enText, idx) => {
      const ruText = ru[idx] || enText;
      const timerMinutes = extractTimerMinutes(enText) || extractTimerMinutes(ruText);
      if (timerMinutes) totalTimersCount++;

      return {
        stepNumber: idx + 1,
        instruction: {
          en: enText,
          ru: ruText,
        },
        timerMinutes,
      };
    });

    totalStepsCount += steps.length;

    return {
      ...meal,
      steps,
    };
  });

  await fs.writeFile(mealsPath, JSON.stringify(updatedMeals, null, 2), 'utf-8');

  // Also update full dump
  const fullDumpPath = path.join(DATA_DIR, 'themealdb-bilingual-full.json');
  try {
    const fullDump = JSON.parse(await fs.readFile(fullDumpPath, 'utf-8'));
    fullDump.meals = updatedMeals;
    await fs.writeFile(fullDumpPath, JSON.stringify(fullDump, null, 2), 'utf-8');
  } catch {}

  console.log('✅ Steps Parsing Complete:');
  console.log(`   - Total meals processed: ${updatedMeals.length}`);
  console.log(`   - Total structured steps created: ${totalStepsCount} (avg ${(totalStepsCount / updatedMeals.length).toFixed(1)} steps per recipe)`);
  console.log(`   - Interactive timers identified in steps: ${totalTimersCount}`);
  console.log(`\n📁 Updated: ${mealsPath}`);
}

main().catch((err) => {
  console.error('❌ Steps parsing failed:', err);
  process.exit(1);
});
