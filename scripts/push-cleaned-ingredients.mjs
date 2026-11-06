import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

async function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  const content = await fs.readFile(envPath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
  }
  return env;
}

async function main() {
  console.log('🚀 Pushing Cleaned Ingredients to Supabase...\n');
  const env = await loadEnv();

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const meals = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'meals-bilingual.json'), 'utf-8'));
  console.log(`Updating ingredients for ${meals.length} meals in Supabase...`);

  const CONCURRENCY = 8;
  let updatedCount = 0;

  async function updateMeal(m) {
    const { error } = await supabase
      .from('meals')
      .update({
        ingredients: m.ingredients,
      })
      .eq('id', m.id);

    if (error) {
      console.warn(`[WARN] Failed to update meal ${m.id}:`, error.message);
    } else {
      updatedCount++;
      if (updatedCount % 50 === 0 || updatedCount === meals.length) {
        process.stdout.write(`   Progress: ${updatedCount}/${meals.length} meals updated...\r`);
      }
    }
  }

  let index = 0;
  async function worker() {
    while (index < meals.length) {
      const meal = meals[index++];
      if (!meal) break;
      await updateMeal(meal);
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log(`\n\n🎉 Successfully updated all ${updatedCount}/${meals.length} meals in Supabase!`);
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
